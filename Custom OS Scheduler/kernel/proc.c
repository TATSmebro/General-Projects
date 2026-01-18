#include "types.h"
#include "param.h"
#include "memlayout.h"
#include "riscv.h"
#include "spinlock.h"
#include "proc.h"
#include "defs.h"
#include "mqss.h"

// MQSS queue structures - Active and Expired sets
struct proc *active_queue_head[LEVELS];
struct proc *active_queue_tail[LEVELS];
struct proc *expired_queue_head[LEVELS];
struct proc *expired_queue_tail[LEVELS];
struct spinlock queue_lock;  // Lock for MQSS queues

// Level quantum tracking
int active_level_quantum[LEVELS]; 
int expired_level_quantum[LEVELS];

int schedlog_active = 0;  // Number of ticks schedlog is active
int schedlog_start_tick = 0;  // Tick when schedlog was started

struct cpu cpus[NCPU];

struct proc proc[NPROC];

struct proc *initproc;

int nextpid = 1;
struct spinlock pid_lock;

extern void forkret(void);
static void freeproc(struct proc *p);

extern char trampoline[]; // trampoline.S

// helps ensure that wakeups of wait()ing
// parents are not lost. helps obey the
// memory model when using p->parent.
// must be acquired before any p->lock.
struct spinlock wait_lock;

// Initialize MQSS queues
void
mqss_init(void)
{
  initlock(&queue_lock, "mqss_queue");

  if (strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    // Phase 2: Initialize active and expired sets
    for(int i = 0; i < LEVELS; i++) {
      active_queue_head[i] = 0;
      active_queue_tail[i] = 0;
      expired_queue_head[i] = 0;
      expired_queue_tail[i] = 0;
      active_level_quantum[i] = MQSS_LEVEL_QUANTUM;
      expired_level_quantum[i] = MQSS_LEVEL_QUANTUM;
    }
  } else {
    // Phase 1 (RR): Single queue, NO expired sets
    active_queue_head[0] = 0;
    active_queue_tail[0] = 0;
  }
}

// Helper: is p already in the given level queue?
static int
mqss_in_queue_locked(struct proc *p, struct proc **head)
{
  if (p->priority_level < 0 || p->priority_level >= LEVELS) return 0; // Invalid level
  if (p->queue_prev || p->queue_next) return 1;
  if (*head == p) return 1;
  return 0;
}

// Helper function to move all processes from one level to another
// queue_lock must be held by caller
void
mqss_move_level_processes(int from_level, int to_level, int is_to_expired, struct proc *skip)
{
  struct proc **from_head = &active_queue_head[from_level];
  struct proc **from_tail = &active_queue_tail[from_level];

  struct proc *p = *from_head;
  
  while(p != 0) {
    struct proc *next = p->queue_next;
    
    if(p == skip) {
      // Skip this process, keep it in the original queue temporarily
      p = next;
      continue;
    }
    
    // Remove from old queue
    if(p->queue_prev)
      p->queue_prev->queue_next = p->queue_next;
    else
      *from_head = p->queue_next;
      
    if(p->queue_next)
      p->queue_next->queue_prev = p->queue_prev;
    else
      *from_tail = p->queue_prev;
    
    // Determine target level: if going to expired, use original_level
    int target_level = is_to_expired ? p->original_level : to_level;
    
    struct proc **to_head = is_to_expired ? &expired_queue_head[target_level] : &active_queue_head[target_level];
    struct proc **to_tail = is_to_expired ? &expired_queue_tail[target_level] : &active_queue_tail[target_level];
    
    // Update process fields
    p->priority_level = target_level;
    p->in_expired_set = is_to_expired;
    
    // Add to new queue at tail
    p->queue_prev = *to_tail;
    p->queue_next = 0;
    
    if(*to_tail)
      (*to_tail)->queue_next = p;
    else
      *to_head = p;
    
    *to_tail = p;
    
    p = next;
  }
}

// Enqueue into active or expired set
// Caller must hold queue_lock
void
mqss_enqueue(struct proc *p, int level, int is_expired)
{
  if(level < 0 || level >= LEVELS)
    panic("mqss_enqueue: invalid level");
  
  struct proc **head = is_expired ? &expired_queue_head[level] : &active_queue_head[level];
  struct proc **tail = is_expired ? &expired_queue_tail[level] : &active_queue_tail[level];
  
  // If already in this queue, remove first
  if (mqss_in_queue_locked(p, head)) {
    if (p->queue_prev)
      p->queue_prev->queue_next = p->queue_next;
    else
      *head = p->queue_next;

    if (p->queue_next)
      p->queue_next->queue_prev = p->queue_prev;
    else
      *tail = p->queue_prev;

    p->queue_next = p->queue_prev = 0;
  }

  p->priority_level = level;
  p->in_expired_set = is_expired;
  p->queue_next = 0;
  p->queue_prev = *tail;
  
  if(*tail)
    (*tail)->queue_next = p;
  else
    *head = p;
  
  *tail = p;
}

// Dequeue from active or expired set
// Caller must hold queue_lock
void
mqss_dequeue(struct proc *p)
{
  int level = p->priority_level;
  if (level < 0 || level >= LEVELS)
    return;
  
  struct proc **head = p->in_expired_set ? &expired_queue_head[level] : &active_queue_head[level];
  struct proc **tail = p->in_expired_set ? &expired_queue_tail[level] : &active_queue_tail[level];

  if (!mqss_in_queue_locked(p, head)) {
    return;
  }

  if(p->queue_prev)
    p->queue_prev->queue_next = p->queue_next;
  else
    *head = p->queue_next;

  if(p->queue_next)
    p->queue_next->queue_prev = p->queue_prev;
  else
    *tail = p->queue_prev;

  p->queue_next = 0;
  p->queue_prev = 0;
  p->priority_level = -1; // Reset priority level
}

// Swap active and expired sets
// Lock must be held by caller
void
mqss_swap_sets(void)
{
  // Swap pointers
  for(int i = 0; i < LEVELS; i++) {
    struct proc *temp_head = active_queue_head[i];
    struct proc *temp_tail = active_queue_tail[i];
    
    active_queue_head[i] = expired_queue_head[i];
    active_queue_tail[i] = expired_queue_tail[i];
    
    expired_queue_head[i] = temp_head;
    expired_queue_tail[i] = temp_tail;

    // Swap level quantums
    int temp_quantum = active_level_quantum[i];
    active_level_quantum[i] = expired_level_quantum[i];
    expired_level_quantum[i] = temp_quantum;
  }

  // Reset the new active set's level quantums
  for(int i = 0; i < LEVELS; i++) {
    active_level_quantum[i] = MQSS_LEVEL_QUANTUM;
  }
  
  // Update all processes' in_expired_set flag
  for(struct proc *p = proc; p < &proc[NPROC]; p++) {
    if(p->state != UNUSED) {
      p->in_expired_set = !p->in_expired_set;
    }
  }
  
  /*Replenish is done at yield() or when a process is enqueued*/
  // // Replenish all process quanta
  // for(struct proc *p = proc; p < &proc[NPROC]; p++) {
  //   if(p->state != UNUSED) {
  //     p->quantum = MQSS_PROC_QUANTUM;
  //   }
  // }
}

// Unified pick next for both RR and MQSS
struct proc*
mqss_pick_next(void)
{
  struct proc *p;
  int is_mqss = (strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0);
  
  acquire(&queue_lock);
  
  // For MQSS: Check if active set is empty and swap if needed
  if(is_mqss) {

    int found_runnable = 0;
    
    for(int i = 0; i < LEVELS; i++) {
      for(p = active_queue_head[i]; p != 0; p = p->queue_next) {
        acquire(&p->lock);
        if(p->state == RUNNABLE) {
          found_runnable = 1;
          release(&p->lock);
          break;
        }
        release(&p->lock);
      }
      if(found_runnable) break;
    }
    
    if(!found_runnable) {
      mqss_swap_sets();
    }
  }
  
  // Pick from active set (works for both RR and MQSS)
  int max_level = is_mqss ? LEVELS : 1;  // RR only uses level 0
  
  for(int i = 0; i < max_level; i++) {
    for(p = active_queue_head[i]; p != 0; p = p->queue_next) {
      acquire(&p->lock);
      if(p->state == RUNNABLE) {
        release(&queue_lock);
        return p;  // Returns with p->lock held
      }
      release(&p->lock);
    }
  }
  
  release(&queue_lock);
  return 0;
}

// Formats schedlog output
void
print_schedlog(void)
{
  struct proc *p;

  // Read ticks with proper locking
  extern struct spinlock tickslock;
  acquire(&tickslock);
  int current_tick = ticks;
  release(&tickslock);
  
  if (strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    acquire(&queue_lock);
    // Print active set
    for(int level = 0; level < LEVELS; level++) {
      printf("%d|active|%d(%d)", current_tick, level, active_level_quantum[level]);
      
      for(p = active_queue_head[level]; p != 0; p = p->queue_next) {
        printf(",[%d]%s:%d(%d)", p->pid, p->name, p->state, p->quantum);
      }
      
      printf("\n");
    }

    // Print expired set
    for(int level = 0; level < LEVELS; level++) {
      printf("%d|expired|%d(%d)", current_tick, level, expired_level_quantum[level]);
      
      for(p = expired_queue_head[level]; p != 0; p = p->queue_next) {
        printf(",[%d]%s:%d(%d)", p->pid, p->name, p->state, p->quantum);
      }
      
      printf("\n");
    }

    release(&queue_lock);
    
  } else if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0) {
    acquire(&queue_lock);

    // Phase 1: Print single active set
    printf("%d|active|0(%d)", current_tick, 0);
    
    for(p = active_queue_head[0]; p != 0; p = p->queue_next) {
      printf(",[%d]%s:%d(%d)", p->pid, p->name, p->state, p->quantum);
    }
  
    printf("\n");

    release(&queue_lock);
    
  } else {
    // Vanilla xv6: scan proc table
    printf("%d|active|0(%d)", current_tick, 0);
    
    for(p = proc; p < &proc[NPROC]; p++) {
      if(p->state == UNUSED) continue;
      printf(",[%d]%s:%d(%d)", p->pid, p->name, p->state, p->quantum);
    }
    
    printf("\n");
  }
}

// MQSS Scheduler
void
mqss_scheduler(void)
{
  struct proc *p;
  struct cpu *c = mycpu();
  
  c->proc = 0;
  for(;;){
    // intr_on() to avoid deadlock
    intr_on();
    
    p = mqss_pick_next(); // Returns with p->lock held
    if(p == 0) {
      // No runnable process found, enable interrupts and wait
      intr_on();
      asm volatile("wfi");  // Wait for interrupt
      continue;
    }
    
    // Switch to chosen process (p->lock is held by mqss_pick_next)
    p->state = RUNNING;
    c->proc = p;

    release(&p->lock);

    // Schedlog printing
    if(schedlog_active > 0) {
      extern struct spinlock tickslock;
      acquire(&tickslock);
      int elapsed = ticks - schedlog_start_tick;
      int should_print = (elapsed < schedlog_active);
      release(&tickslock);
      
      if(should_print) {
        print_schedlog();
      } else {
        schedlog_active = 0;
      }
    }

    acquire(&p->lock);

    // Context switch
    swtch(&c->context, &p->context);
    
    // Process is done running
    c->proc = 0;
    release(&p->lock);
  }
}

// Allocate a page for each process's kernel stack.
// Map it high in memory, followed by an invalid
// guard page.
void
proc_mapstacks(pagetable_t kpgtbl)
{
  struct proc *p;
  
  for(p = proc; p < &proc[NPROC]; p++) {
    char *pa = kalloc();
    if(pa == 0)
      panic("kalloc");
    uint64 va = KSTACK((int) (p - proc));
    kvmmap(kpgtbl, va, (uint64)pa, PGSIZE, PTE_R | PTE_W);
  }
}

// initialize the proc table.
void
procinit(void)
{
  struct proc *p;
  
  initlock(&pid_lock, "nextpid");
  initlock(&wait_lock, "wait_lock");
  for(p = proc; p < &proc[NPROC]; p++) {
      initlock(&p->lock, "proc");
      p->state = UNUSED;
      p->kstack = KSTACK((int) (p - proc));
  }
}

// Must be called with interrupts disabled,
// to prevent race with process being moved
// to a different CPU.
int
cpuid()
{
  int id = r_tp();
  return id;
}

// Return this CPU's cpu struct.
// Interrupts must be disabled.
struct cpu*
mycpu(void)
{
  int id = cpuid();
  struct cpu *c = &cpus[id];
  return c;
}

// Return the current struct proc *, or zero if none.
struct proc*
myproc(void)
{
  push_off();
  struct cpu *c = mycpu();
  struct proc *p = c->proc;
  pop_off();
  return p;
}

int
allocpid()
{
  int pid;
  
  acquire(&pid_lock);
  pid = nextpid;
  nextpid = nextpid + 1;
  release(&pid_lock);

  return pid;
}

// Look in the process table for an UNUSED proc.
// If found, initialize state required to run in the kernel,
// and return with p->lock held.
// If there are no free procs, or a memory allocation fails, return 0.
static struct proc*
allocproc(void)
{
  struct proc *p;

  for(p = proc; p < &proc[NPROC]; p++) {
    acquire(&p->lock);
    if(p->state == UNUSED) {
      goto found;
    } else {
      release(&p->lock);
    }
  }
  return 0;

found:
  p->pid = allocpid();
  p->state = USED;

  // Allocate a trapframe page.
  if((p->trapframe = (struct trapframe *)kalloc()) == 0){
    freeproc(p);
    release(&p->lock);
    return 0;
  }

  // An empty user page table.
  p->pagetable = proc_pagetable(p);
  if(p->pagetable == 0){
    freeproc(p);
    release(&p->lock);
    return 0;
  }

  // Set up new context to start executing at forkret,
  // which returns to user space.
  memset(&p->context, 0, sizeof(p->context));
  p->context.ra = (uint64)forkret;
  p->context.sp = p->kstack + PGSIZE;

  // Initialize MQSS fields
  p->quantum = MQSS_PROC_QUANTUM;
  p->priority_level = -1; // Not assigned yet
  p->original_level = MQSS_STARTING_LEVEL;
  p->queue_next = 0;
  p->queue_prev = 0;
  p->in_expired_set = 0; // Always start in active set

  return p;
}

// free a proc structure and the data hanging from it,
// including user pages.
// p->lock must be held.
static void
freeproc(struct proc *p)
{
  if(p->trapframe)
    kfree((void*)p->trapframe);
  p->trapframe = 0;
  if(p->pagetable)
    proc_freepagetable(p->pagetable, p->sz);
  p->pagetable = 0;
  p->sz = 0;
  p->pid = 0;
  p->parent = 0;
  p->name[0] = 0;
  p->chan = 0;
  p->killed = 0;
  p->xstate = 0;
  
  p->state = UNUSED;
}

// Create a user page table for a given process, with no user memory,
// but with trampoline and trapframe pages.
pagetable_t
proc_pagetable(struct proc *p)
{
  pagetable_t pagetable;

  // An empty page table.
  pagetable = uvmcreate();
  if(pagetable == 0)
    return 0;

  // map the trampoline code (for system call return)
  // at the highest user virtual address.
  // only the supervisor uses it, on the way
  // to/from user space, so not PTE_U.
  if(mappages(pagetable, TRAMPOLINE, PGSIZE,
              (uint64)trampoline, PTE_R | PTE_X) < 0){
    uvmfree(pagetable, 0);
    return 0;
  }

  // map the trapframe page just below the trampoline page, for
  // trampoline.S.
  if(mappages(pagetable, TRAPFRAME, PGSIZE,
              (uint64)(p->trapframe), PTE_R | PTE_W) < 0){
    uvmunmap(pagetable, TRAMPOLINE, 1, 0);
    uvmfree(pagetable, 0);
    return 0;
  }

  return pagetable;
}

// Free a process's page table, and free the
// physical memory it refers to.
void
proc_freepagetable(pagetable_t pagetable, uint64 sz)
{
  uvmunmap(pagetable, TRAMPOLINE, 1, 0);
  uvmunmap(pagetable, TRAPFRAME, 1, 0);
  uvmfree(pagetable, sz);
}

// Set up first user process.
void
userinit(void)
{
  struct proc *p;

  p = allocproc(); // Returns with p->lock held
  initproc = p;
  
  p->cwd = namei("/");

  p->state = RUNNABLE;

  release(&p->lock);

  // Enqueue init process into MQSS queue
  if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0 || strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    acquire(&queue_lock);
    mqss_enqueue(p, p->original_level, 0);
    release(&queue_lock);
  }
}

// Shrink user memory by n bytes.
// Return 0 on success, -1 on failure.
int
shrinkproc(int n)
{
  uint64 sz;
  struct proc *p = myproc();

  if(n > p->sz)
    return -1;

  sz = p->sz;
  sz = uvmdealloc(p->pagetable, sz, sz - n);
  p->sz = sz;
  return 0;
}

static int
do_fork(int priority_level){
int i, pid;
  struct proc *np;
  struct proc *p = myproc();

  // Allocate process.
  if((np = allocproc()) == 0){
    return -1;
  }

  // Copy user memory from parent to child.
  if(uvmcopy(p->pagetable, np->pagetable, p->sz) < 0){
    freeproc(np);
    release(&np->lock);
    return -1;
  }
  np->sz = p->sz;

  // copy saved user registers.
  *(np->trapframe) = *(p->trapframe);

  // Cause fork to return 0 in the child.
  np->trapframe->a0 = 0;

  // increment reference counts on open file descriptors.
  for(i = 0; i < NOFILE; i++)
    if(p->ofile[i])
      np->ofile[i] = filedup(p->ofile[i]);
  np->cwd = idup(p->cwd);

  safestrcpy(np->name, p->name, sizeof(p->name));

  pid = np->pid;

  release(&np->lock);

  acquire(&wait_lock);
  np->parent = p;
  release(&wait_lock);

  acquire(&np->lock);
  np->state = RUNNABLE;
  
  // Set original_level based on whether this is fork or priofork
  if(priority_level == -1) {
    // Regular fork: use MQSS_STARTING_LEVEL
    np->original_level = MQSS_STARTING_LEVEL;
  } else {
    // priofork: use specified priority level
    np->original_level = priority_level;
  }
  
  release(&np->lock);
  
  // Enqueue the new process if using RR or MQSS
  if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0 || strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    acquire(&queue_lock);
    mqss_enqueue(np, np->original_level, 0); // Enqueue in active set
    release(&queue_lock);
  }

  return pid;
}

// Create a new process, copying the parent.
// Sets up child kernel stack to return as if from fork() system call.
int
fork(void)
{
  return do_fork(-1); // Use MQSS_STARTING_LEVEL
}

//  Create a new process with a p->original_level = priority level
int
priofork(int priority_level)
{
  return do_fork(priority_level);
}

// Pass p's abandoned children to init.
// Caller must hold wait_lock.
void
reparent(struct proc *p)
{
  struct proc *pp;

  for(pp = proc; pp < &proc[NPROC]; pp++){
    if(pp->parent == p){
      pp->parent = initproc;
      wakeup(initproc);
    }
  }
}

// Exit the current process.  Does not return.
// An exited process remains in the zombie state
// until its parent calls wait().
void
exit(int status)
{
  struct proc *p = myproc();

  if(p == initproc)
    panic("init exiting");

  // Close all open files.
  for(int fd = 0; fd < NOFILE; fd++){
    if(p->ofile[fd]){
      struct file *f = p->ofile[fd];
      fileclose(f);
      p->ofile[fd] = 0;
    }
  }

  begin_op();
  iput(p->cwd);
  end_op();
  p->cwd = 0;

  if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0 || strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    acquire(&queue_lock);
    mqss_dequeue(p);
    release(&queue_lock);
  }

  acquire(&wait_lock);

  // Give any children to init.
  reparent(p);

  // Parent might be sleeping in wait().
  wakeup(p->parent);
  
  acquire(&p->lock);

  p->xstate = status;
  p->state = ZOMBIE;

  release(&wait_lock);

  // Jump into the scheduler, never to return.
  sched();
  panic("zombie exit");
}

// Wait for a child process to exit and return its pid.
// Return -1 if this process has no children.
int
wait(uint64 addr)
{
  struct proc *pp;
  int havekids, pid;
  struct proc *p = myproc();

  acquire(&wait_lock);

  for(;;){
    // Scan through table looking for exited children.
    havekids = 0;
    for(pp = proc; pp < &proc[NPROC]; pp++){
      if(pp->parent == p){
        // make sure the child isn't still in exit() or swtch().
        acquire(&pp->lock);

        havekids = 1;
        if(pp->state == ZOMBIE){
          // Found one.
          pid = pp->pid;
          if(addr != 0 && copyout(p->pagetable, addr, (char *)&pp->xstate,
                                  sizeof(pp->xstate)) < 0) {
            release(&pp->lock);
            release(&wait_lock);
            return -1;
          }
          freeproc(pp);
          release(&pp->lock);
          release(&wait_lock);
          return pid;
        }
        release(&pp->lock);
      }
    }

    // No point waiting if we don't have any children.
    if(!havekids || killed(p)){
      release(&wait_lock);
      return -1;
    }
    
    // Wait for a child to exit.
    sleep(p, &wait_lock);  //DOC: wait-sleep
  }
}

// Per-CPU process scheduler.
// Each CPU calls scheduler() after setting itself up.
// Scheduler never returns.  It loops, doing:
//  - choose a process to run.
//  - swtch to start running that process.
//  - eventually that process transfers control
//    via swtch back to the scheduler.
void
scheduler(void)
{
  if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0 || strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    mqss_scheduler();
    // Should nerver reach here if SCHEDULING_POLICY is MQSS
  }

  struct proc *p;
  struct cpu *c = mycpu();

  c->proc = 0;
  for(;;){
    // The most recent process to run may have had interrupts
    // turned off; enable them to avoid a deadlock if all
    // processes are waiting. Then turn them back off
    // to avoid a possible race between an interrupt
    // and wfi.
    intr_on();
    intr_off();

    int found = 0;
    for(p = proc; p < &proc[NPROC]; p++) {
      acquire(&p->lock);
      if(p->state == RUNNABLE) {
        // Switch to chosen process.  It is the process's job
        // to release its lock and then reacquire it
        // before jumping back to us.
        p->state = RUNNING;
        c->proc = p;

        release(&p->lock);
        // Schedlog printing
        if(schedlog_active > 0) {
          extern struct spinlock tickslock;
          acquire(&tickslock);
          int elapsed = ticks - schedlog_start_tick;
          int should_print = (elapsed < schedlog_active);
          release(&tickslock);
          
          if(should_print) {
            print_schedlog();
          } else {
            schedlog_active = 0;
          }
        }

        acquire(&p->lock);

        // Context switch
        swtch(&c->context, &p->context);

        // Process is done running for now.
        // It should have changed its p->state before coming back.
        c->proc = 0;
        found = 1;
      }
      release(&p->lock);
    }
    if(found == 0) {
      // nothing to run; stop running on this core until an interrupt.
      asm volatile("wfi");
    }
  }
}

// Switch to scheduler.  Must hold only p->lock
// and have changed proc->state. Saves and restores
// intena because intena is a property of this
// kernel thread, not this CPU. It should
// be proc->intena and proc->noff, but that would
// break in the few places where a lock is held but
// there's no process.
void
sched(void)
{
  int intena;
  struct proc *p = myproc();

  if(!holding(&p->lock))
    panic("sched p->lock");
  if(mycpu()->noff != 1)
    panic("sched locks");
  if(p->state == RUNNING)
    panic("sched RUNNING");
  if(intr_get())
    panic("sched interruptible");

  intena = mycpu()->intena;
  swtch(&p->context, &mycpu()->context);
  mycpu()->intena = intena;
}

// Give up the CPU for one scheduling round.
void
yield(void)
{
  struct proc *p = myproc();

  acquire(&p->lock);

  if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0) {
    p->quantum = MQSS_PROC_QUANTUM; // Replenish quantum on re-enqueue for RR
    p->state = RUNNABLE;
    release(&p->lock);
    
    acquire(&queue_lock);
    mqss_dequeue(p);
    mqss_enqueue(p, p->original_level, 0); // Re-enqueue at the tail
    release(&queue_lock);

  } else if (strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
    // Save state before releasing lock
    int current_level = p->priority_level;
    int process_quantum_depleted = (p->quantum <= 0);
    
    p->state = RUNNABLE;
    release(&p->lock);

    // Determine next level
    acquire(&queue_lock);
    
    int level_quantum_depleted = (active_level_quantum[current_level] <= 0);
    int next_level = -1;
    int to_expired = 0;
    
    // Check if we need to move levels
    if(level_quantum_depleted || process_quantum_depleted) {
      // Try to find a lower level in active set with available quantum
      for(int i = current_level + 1; i < LEVELS; i++) {
        if(active_level_quantum[i] > 0) {
          next_level = i;
          break;
        }
      }
      
      // If no lower level available, go to expired set at original level
      if(next_level == -1) {
        next_level = p->original_level;
        to_expired = 1;
      }
      
      // If level quantum depleted, move all other processes too
      if (level_quantum_depleted){
        mqss_move_level_processes(current_level, next_level, to_expired, p);
      }
    } else {
      // Neither depleted (voluntary yield), stay in current level
      next_level = current_level;
      to_expired = 0;
    }
    
    release(&queue_lock);

    // Replenish quantum ONLY if changing levels or moving to expired set
    if(next_level != current_level || to_expired) {
      acquire(&p->lock);
      p->quantum = MQSS_PROC_QUANTUM;
      release(&p->lock);
    }

    // Re-enqueue the yielding process at the tail of the next level
    acquire(&queue_lock);
    mqss_dequeue(p);
    mqss_enqueue(p, next_level, to_expired);
    release(&queue_lock);
    
  } else {
    p->state = RUNNABLE; // Default behavior (vanilla xv6)
    release(&p->lock);
  }

  acquire(&p->lock);
  sched();
  release(&p->lock);
}

// A fork child's very first scheduling by scheduler()
// will swtch to forkret.
void
forkret(void)
{
  extern char userret[];
  static int first = 1;
  struct proc *p = myproc();

  // Still holding p->lock from scheduler.
  release(&p->lock);

  if (first) {
    // File system initialization must be run in the context of a
    // regular process (e.g., because it calls sleep), and thus cannot
    // be run from main().
    fsinit(ROOTDEV);

    first = 0;
    // ensure other cores see first=0.
    __sync_synchronize();

    // We can invoke exec() now that file system is initialized.
    // Put the return value (argc) of exec into a0.
    p->trapframe->a0 = exec("/init", (char *[]){ "/init", 0 });
    if (p->trapframe->a0 == -1) {
      panic("exec");
    }
  }

  // return to user space, mimicing usertrap()'s return.
  prepare_return();
  uint64 satp = MAKE_SATP(p->pagetable);
  uint64 trampoline_userret = TRAMPOLINE + (userret - trampoline);
  ((void (*)(uint64))trampoline_userret)(satp);
}

// Sleep on wait channel chan, releasing condition lock lk.
// Re-acquires lk when awakened.
void
sleep(void *chan, struct spinlock *lk)
{
  struct proc *p = myproc();
  
  // Must acquire p->lock in order to
  // change p->state and then call sched.
  // Once we hold p->lock, we can be
  // guaranteed that we won't miss any wakeup
  // (wakeup locks p->lock),
  // so it's okay to release lk.

  acquire(&p->lock);  //DOC: sleeplock1

  release(lk);

  // Go to sleep.
  p->chan = chan;

  p->state = SLEEPING; // Retains position in queue if MQSS

  sched();

  // Tidy up.
  p->chan = 0;

  // Reacquire original lock.
  release(&p->lock);
  acquire(lk);
}

// Wake up all processes sleeping on wait channel chan.
// Caller should hold the condition lock.
void
wakeup(void *chan)
{
  struct proc *p;

  for(p = proc; p < &proc[NPROC]; p++) {
    if(p == myproc())
      continue;

    acquire(&p->lock);
    if(p->state == SLEEPING && p->chan == chan) {

      p->state = RUNNABLE;
      
      // Read priority_level BEFORE releasing lock
      int current_level = p->priority_level;
      
      if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0){
        p->quantum = MQSS_PROC_QUANTUM; // Reset quantum on wakeup if RR
      }
      // For MQSS: Do not reset quantum on wakeup, keep current quantum
      
      release(&p->lock);
      
      if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0 || strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
        // Re-enqueue at current priority level in ACTIVE set
        acquire(&queue_lock);
        mqss_dequeue(p);
        mqss_enqueue(p, current_level, 0);  // 0 = active set
        release(&queue_lock);
      }
    } else {
      release(&p->lock);
    }
  }
}

// Kill the process with the given pid.
// The victim won't exit until it tries to return
// to user space (see usertrap() in trap.c).
int
kill(int pid)
{
  struct proc *p;

  for(p = proc; p < &proc[NPROC]; p++){
    acquire(&p->lock);
    if(p->pid == pid){
      p->killed = 1;
      if(p->state == SLEEPING){
        // Wake process from sleep().
        p->state = RUNNABLE;

        // Read priority_level BEFORE releasing lock
        int current_level = p->priority_level;
        
        if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0){
          p->quantum = MQSS_PROC_QUANTUM; // Reset quantum for RR
        }
        // For MQSS: Don't reset quantum, keep current quantum
        
        release(&p->lock);
        
        if (strncmp(SCHEDULING_POLICY, "RR", 2) == 0 || strncmp(SCHEDULING_POLICY, "MQSS", 4) == 0) {
          // Re-enqueue at current priority level in ACTIVE set
          acquire(&queue_lock);
          mqss_dequeue(p);
          mqss_enqueue(p, current_level, 0);  // 0 = active set
          release(&queue_lock);
        }
        return 0;
      }
      release(&p->lock);
      return 0;
    }
    release(&p->lock);
  }
  return -1;
}

void
setkilled(struct proc *p)
{
  acquire(&p->lock);
  p->killed = 1;
  release(&p->lock);
}

int
killed(struct proc *p)
{
  int k;
  
  acquire(&p->lock);
  k = p->killed;
  release(&p->lock);
  return k;
}

// Copy to either a user address, or kernel address,
// depending on usr_dst.
// Returns 0 on success, -1 on error.
int
either_copyout(int user_dst, uint64 dst, void *src, uint64 len)
{
  struct proc *p = myproc();
  if(user_dst){
    return copyout(p->pagetable, dst, src, len);
  } else {
    memmove((char *)dst, src, len);
    return 0;
  }
}

// Copy from either a user address, or kernel address,
// depending on usr_src.
// Returns 0 on success, -1 on error.
int
either_copyin(void *dst, int user_src, uint64 src, uint64 len)
{
  struct proc *p = myproc();
  if(user_src){
    return copyin(p->pagetable, dst, src, len);
  } else {
    memmove(dst, (char*)src, len);
    return 0;
  }
}

// Print a process listing to console.  For debugging.
// Runs when user types ^P on console.
// No lock to avoid wedging a stuck machine further.
void
procdump(void)
{
  static char *states[] = {
  [UNUSED]    "unused",
  [USED]      "used",
  [SLEEPING]  "sleep ",
  [RUNNABLE]  "runble",
  [RUNNING]   "run   ",
  [ZOMBIE]    "zombie"
  };
  struct proc *p;
  char *state;

  printf("\n");
  for(p = proc; p < &proc[NPROC]; p++){
    if(p->state == UNUSED)
      continue;
    if(p->state >= 0 && p->state < NELEM(states) && states[p->state])
      state = states[p->state];
    else
      state = "???";
    printf("%d %s %s", p->pid, state, p->name);
    printf("\n");
  }
}
