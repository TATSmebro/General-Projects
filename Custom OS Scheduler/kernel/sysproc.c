#include "types.h"
#include "riscv.h"
#include "defs.h"
#include "param.h"
#include "memlayout.h"
#include "spinlock.h"
#include "proc.h"
#include "mqss.h"

// External declaration for wait_lock (defined in proc.c)
extern struct spinlock wait_lock;
extern int schedlog_active;
extern int schedlog_start_tick;

uint64
sys_exit(void)
{
  int n;
  argint(0, &n);
  exit(n);
  return 0;  // not reached
}

uint64
sys_getpid(void)
{
  return myproc()->pid;
}

uint64
sys_fork(void)
{
  return fork();
}

uint64
sys_wait(void)
{
  uint64 p;
  argaddr(0, &p);
  return wait(p);
}

uint64
sys_sbrk(void)
{
  uint64 addr;
  int n;

  argint(0, &n);
  addr = myproc()->sz;
  if(n < 0) {
    if(shrinkproc(-n) < 0)
      return -1;
  } else {
    // Lazily allocate memory for this process: increase its memory
    // size but don't allocate memory. If the processes uses the
    // memory, vmfault() will allocate it.
    myproc()->sz += n;
  }
  return addr;
}

uint64
sys_sleep(void)
{
  int n;
  uint ticks0;

  argint(0, &n);
  if(n < 0)
    n = 0;
  acquire(&tickslock);
  ticks0 = ticks;
  while(ticks - ticks0 < n){
    if(killed(myproc())){
      release(&tickslock);
      return -1;
    }
    sleep(&ticks, &tickslock);
  }
  release(&tickslock);
  return 0;
}

uint64
sys_kill(void)
{
  int pid;

  argint(0, &pid);
  return kill(pid);
}

// return how many clock tick interrupts have occurred
// since start.
uint64
sys_uptime(void)
{
  uint xticks;

  acquire(&tickslock);
  xticks = ticks;
  release(&tickslock);
  return xticks;
}

uint64
sys_shutdown(void)
{
  (*(volatile uint32 *) 0x100000) = 0x5555;
  return 0;
}

uint64
sys_schedlog(void)
{
  int duration;
  
  // Get duration argument
  argint(0, &duration);

  if(duration < 0)
    return -1;
  
  // Validate duration (must be non-negative)
  if(duration < 0)
    return -1;
  
  if(duration > 0) {
    schedlog_active = duration;
    schedlog_start_tick = ticks;
  } else {
    schedlog_active = 0;  // Disable schedlog
  }
  
  return 0;
}

uint64
sys_priofork(void)
{
  int priority_level;
  
  // Get priority level argument
  argint(0, &priority_level);
  
  // Validation
  if(priority_level < 0 || priority_level >= LEVELS)
    return -1;
  
  return priofork(priority_level);
}