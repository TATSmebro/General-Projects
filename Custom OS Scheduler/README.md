# Phase 5 - Changes

## Overview
Phase 5 adds the **priofork()** system call, allowing processes to fork children at a specified priority level instead of the default MQSS_STARTING_LEVEL.

---

## Code Changes by File

### 1. **kernel/proc.c**

#### 1.1 `do_fork()` - New Helper Function

**Purpose:** Common fork logic shared by fork() and priofork().

**Changes:**
- Takes priority_level parameter (-1 for regular fork, 0-LEVELS-1 for priofork)
- If priority_level is -1: sets child's original_level to MQSS_STARTING_LEVEL
- If priority_level specified: sets child's original_level to that level
- Enqueues child at original_level in active set

#### 1.2 `fork()` - Modified Function

**Changes:**
- Now calls do_fork(-1) to use default starting level

#### 1.3 `priofork()` - New Function

**Purpose:** Fork child at specified priority level.

**Implementation:**
- Calls do_fork(priority_level)
- Returns child PID in parent, 0 in child, -1 on error

---

### 2. **kernel/sysproc.c**

#### 2.1 `sys_priofork()` - New System Call Handler

**Implementation:**
- Extracts priority level argument using argint()
- Validates priority (0 <= priority < LEVELS)
- Returns -1 if invalid
- Calls priofork(priority_level) and returns result

---

### 3. **kernel/defs.h**

**Changes:**
- Added declaration: int priofork(int);

---

### 4. **kernel/syscall.h**

**Changes:**
- Added: #define SYS_priofork 25

---

### 5. **kernel/syscall.c**

**Changes:**
- Added external declaration: extern uint64 sys_priofork(void);
- Added dispatch entry: [SYS_priofork] sys_priofork

---

### 6. **user/user.h**

**Changes:**
- Added declaration: int priofork(int);

---

### 7. **user/usys.pl**

**Changes:**
- Added: entry("priofork");

---

# Phase 4 - Changes

## Overview
Phase 4 extends Phase 3 by implementing **level quantum tracking** for each priority level. Each level has its own quantum budget that is decremented as processes run at that level. When a level's quantum is exhausted, all processes at that level are moved together to maintain fairness across priority levels.

---

## Code Changes by File
### sys_priofork was also included in this branch (see documentation in phase5)

### 1. **kernel/proc.c**

#### 1.1 Global State - Added Level Quantum Arrays

**Added:**
- `int active_level_quantum[LEVELS]`: Tracks remaining quantum for each level in active set
- `int expired_level_quantum[LEVELS]`: Tracks remaining quantum for each level in expired set

**Explanation:** Each priority level now has its own quantum budget (typically MQSS_LEVEL_QUANTUM = 100 ticks). When a level exhausts its quantum, all processes at that level must move together, either to a lower priority level or to the expired set.

#### 1.2 `mqss_init()` - Modified Function

**Changes:**
- Initializes active_level_quantum[i] = MQSS_LEVEL_QUANTUM for all levels
- Initializes expired_level_quantum[i] = MQSS_LEVEL_QUANTUM for all levels

**Explanation:** All levels start with full quantum budget at system boot.

#### 1.3 `mqss_move_level_processes()` - New Function

**Purpose:** Move all processes from one level to another when level quantum is exhausted.

**Parameters:**
- from_level: Source priority level
- to_level: Destination priority level  
- is_to_expired: Whether moving to expired set (1) or active set (0)
- skip: Process to skip (the yielding process, handled separately)

**Behavior:**
- Iterates through all processes at from_level in active set
- Skips the yielding process (handled separately in yield)
- Removes each process from source queue
- If moving to expired set, uses process's original_level as target
- Otherwise uses to_level as target
- Updates priority_level and in_expired_set flags
- Adds to tail of destination queue

**Explanation:** When a level's quantum is exhausted, all processes at that level must migrate together to maintain fairness. They all move to the same destination (either next lower level or expired set at original level). The yielding process is handled separately by yield() to allow different destination than other processes.

#### 1.4 `mqss_swap_sets()` - Modified Function

**Changes:**
- Swaps active_level_quantum[i] and expired_level_quantum[i] for all levels
- Resets new active set level quantums to MQSS_LEVEL_QUANTUM
- Updates all process in_expired_set flags by toggling

**Explanation:** When sets swap, level quantum budgets swap along with the queues. The new active set gets fresh level quantums while the new expired set retains old (exhausted) quantums. All processes have their in_expired_set flag toggled to reflect the swap.

#### 1.5 `yield()` - Modified Function for Level Quantum

**Changes for MQSS:**
- Reads process_quantum_depleted (p->quantum <= 0) before releasing lock
- After releasing p->lock, acquires queue_lock
- Reads level_quantum_depleted (active_level_quantum[current_level] <= 0)
- Decision logic now considers BOTH process quantum AND level quantum:
  - If either depleted: find next available level or move to expired set
  - If neither depleted: voluntary yield, stay at current level
- When level quantum depleted: calls mqss_move_level_processes() to move all other processes
- Replenishes process quantum only when changing levels or moving to expired set

**Behavior - Level Quantum Depleted:**
- Scans levels from current_level+1 to LEVELS-1 looking for level with positive quantum
- If found: moves to that level in active set (both yielding process and all others at exhausted level)
- If not found: moves to expired set at original_level
- Calls mqss_move_level_processes() to migrate all other processes at exhausted level
- Replenishes process quantum to MQSS_PROC_QUANTUM

**Behavior - Process Quantum Depleted (Level Quantum Remaining):**
- Only the yielding process moves (other processes stay at current level)
- Follows same logic: find next level or go to expired set
- Does NOT call mqss_move_level_processes()
- Replenishes process quantum to MQSS_PROC_QUANTUM

**Behavior - Voluntary Yield (Neither Depleted):**
- Process stays at current level in active set
- Moves to back of queue at same level
- Keeps remaining process quantum (no replenishment)
- Level quantum unaffected

**Explanation:** Level quantum adds a fairness mechanism across priority levels. When a level exhausts its quantum budget, all processes at that level must move together, preventing a single level from monopolizing CPU time. This creates batch-like behavior where all processes at a level get their share before the level migrates.

#### 1.6 `print_schedlog()` - Modified Function

**Changes:**
- For MQSS: now prints active_level_quantum[level] for each level instead of hardcoded 0
- Format unchanged: level(level_quantum)
- Shows remaining quantum budget for each level

**Explanation:** Schedlog now displays how much quantum budget each level has remaining, making it easy to observe level quantum depletion and level migration behavior.

---

### 2. **kernel/trap.c**

#### 2.1 `usertrap()` and `kerneltrap()` - Modified Functions

**Changes:**
- Added external declarations for active_level_quantum array and queue_lock
- On timer interrupt (which_dev == 2):
  - Decrements p->quantum (process quantum) as before
  - For MQSS: additionally decrements active_level_quantum[p->priority_level]
  - Acquires queue_lock before decrementing level quantum, releases after
  - Reads level_depleted flag (active_level_quantum[p->priority_level] <= 0)
  - Yields if process quantum depleted OR level quantum depleted

**Behavior:**
- Every timer tick decrements both process quantum AND level quantum
- Process yields if EITHER quantum reaches zero
- Lock ordering: always hold queue_lock when accessing level quantum arrays

**Explanation:** Level quantum is decremented alongside process quantum on every tick. The running process's level gets charged for the CPU time used. When either quantum hits zero, the process yields, triggering level migration logic if it was the level quantum that expired.

---

# Phase 3 - Changes

## Overview
Phase 3 extends Phase 2 by implementing **multi-level priority queues** with N priority levels (where N > 1). Processes start at a configurable priority level and can move between levels based on their behavior.

---

## Code Changes by File

### 1. **kernel/mqss.h** - Modified File

**Changes:**
- Changed `LEVELS` from 1 to a configurable value (e.g., 3, 5, etc.)

**Explanation:** Increasing `LEVELS` enables true multi-level priority scheduling. The starting level determines where new processes enter the system.

---

### 4. **kernel/proc.c**

**Major Changes:** Extended queue management to handle N priority levels.

#### 4.1 Global Queue State

**Behavior:**
- `active_queue_head[LEVELS]` and `active_queue_tail[LEVELS]` now represent N levels
- `expired_queue_head[LEVELS]` and `expired_queue_tail[LEVELS]` now represent N levels
- Each level maintains independent active and expired queues

**Explanation:** The array-based queue structure from Phase 2 naturally scales to N levels without code changes.

#### 4.2 `mqss_pick_next()` - Critical Changes for Priority

**Changes:**
- For MQSS: now scans levels from **highest priority (0) to lowest (LEVELS-1)**
- For each level, checks active set first
- If no runnable process found across ALL active levels, swaps sets
- After swap, rescans from highest to lowest priority

**Explanation:** The key change is respecting priority order - higher priority levels (lower numbers) are always checked first. This ensures high-priority processes run before lower-priority ones, implementing true priority scheduling.

#### 4.3 `yield()` - Modified Function for Multi-Level Support

**Changes for Phase 3:**
- Now handles yielding at any priority level (0 to LEVELS-1)
- Implements priority demotion when quantum is exhausted
- Process moves to next lower priority level on quantum depletion
- At lowest level, moves to expired set at original level
- Voluntary yields keep current level and remaining quantum

**Behavior for MQSS - Quantum Exhausted (Involuntary Yield):**
- Process has used all its quantum (p->quantum <= 0)
- If NOT at lowest level (current_level < LEVELS-1):
  - Demotes to next lower priority level (current_level + 1)
  - Goes to active set at new lower level
  - Quantum replenished to MQSS_PROC_QUANTUM
  - Example: Process at level 1 exhausts quantum, moves to level 2 active set
- If at lowest level (current_level == LEVELS-1):
  - Cannot demote further
  - Moves to expired set at original_level (configured starting level)
  - Quantum replenished to MQSS_PROC_QUANTUM
  - Example: Process at level 4 (lowest in 5-level system) exhausts quantum, moves to expired set at original level (e.g., level 2)
- Dequeued from current position and re-enqueued at destination level and set

**Behavior for MQSS - Voluntary Yield:**
- Process yields while quantum remains (p->quantum > 0)
- Stays at current priority level (no demotion)
- Goes to active set at same level (back of queue)
- Keeps remaining quantum (no replenishment)
- Can be scheduled again immediately but after other processes at same level
- Example: Process at level 2 with 5 quantum remaining yields for I/O, returns to level 2 active set with 5 quantum

**Behavior for RR:**
- Always replenishes quantum to MQSS_PROC_QUANTUM
- Always goes to active set at level 0 (only level)
- No priority changes (only one level exists)

**Explanation:** Phase 3 introduces dynamic priority adjustment through progressive demotion. CPU-bound processes that repeatedly exhaust their quantum gradually sink to lower priority levels, ensuring they don't monopolize CPU time. I/O-bound processes that frequently yield voluntarily maintain their priority level and remaining quantum, rewarding interactive behavior.

#### 4.4 `print_schedlog()` - Modified Function

**Changes:**
- For MQSS: now prints ALL N levels for both active and expired sets
- Format: tick|active|0(lq),[procs]|1(lq),[procs]|...|expired|0(lq),[procs]|1(lq),[procs]|...
- Each level shows: level number, level quantum, and list of processes at that level
- Levels printed in priority order: 0 (highest) to LEVELS-1 (lowest)
- Process format unchanged: [PID]name:state(quantum)

**Explanation:** Extended schedlog output provides complete visibility into the N-level queue structure.

---

# Phase 2 - Changes

## Overview
Phase 2 extends Phase 1 by introducing **active and expired sets** for each priority level. Processes that exhaust their quantum move to the expired set, and when the active set becomes empty, the sets are swapped.

---

## Code Changes by File

### 1. **kernel/proc.c**

**Major Changes:** Extended MQSS to support active/expired set architecture.

#### 1.1 Global Queue State - Modified

**Changed:**
- Split single queue into dual sets:
  - `struct proc *active_queue_head[LEVELS]`: Active set queue heads
  - `struct proc *active_queue_tail[LEVELS]`: Active set queue tails
  - `struct proc *expired_queue_head[LEVELS]`: Expired set queue heads
  - `struct proc *expired_queue_tail[LEVELS]`: Expired set queue tails
- Kept `struct spinlock queue_lock`: Still protects both sets
- Kept schedlog variables unchanged

**Explanation:** Dual queue structure allows processes to be organized into active (ready to run) and expired (used their quantum) sets, enabling fair batch scheduling.

#### 1.2 `mqss_init()` - Modified Function

**Changes:**
- Initializes both active and expired queue arrays to NULL
- Still initializes `queue_lock` with name "mqss_queue"

**Explanation:** Both sets start empty at boot time.

#### 1.3 `mqss_in_queue_locked()` - Modified Function

**Changes:**
- Now takes additional parameter: `struct proc *head` (queue head to search)
- Can search either active or expired set based on passed head pointer

**Explanation:** Allows checking membership in either set independently.

#### 1.4 `mqss_enqueue()` - Modified Function

**Changes:**
- Now takes additional parameter: `int is_expired` (0 for active, 1 for expired)
- Routes to appropriate queue based on `is_expired` flag
- Updates `p->in_expired_set` to match destination set
- Still prevents duplicate enqueuing by checking both sets

**Explanation:** Processes can now be enqueued into either active or expired set. The `in_expired_set` flag tracks which set the process belongs to.

#### 1.5 `mqss_dequeue()` - Modified Function

**Changes:**
- Now checks both active and expired sets to find the process
- Uses `p->in_expired_set` flag to determine which set to search first
- Clears `p->in_expired_set` after removal

**Explanation:** Can remove processes from either set. The flag optimization avoids searching both sets unnecessarily.

#### 1.6 `mqss_swap_sets()` - New Function

**Purpose:** Swap active and expired sets when active set is exhausted.

**Implementation:**
- Swaps head and tail pointers for each priority level
- Updates `in_expired_set` flag by iterating through both queues at each level
- Active set processes: `in_expired_set = 0`
- Expired set processes: `in_expired_set = 1`

**Explanation:** When all processes in active set have run, expired becomes active (fresh chance) and active becomes expired (empty, ready for next batch). This ensures all processes get equal opportunity before any process runs again.

#### 1.7 `mqss_pick_next()` - Modified Function

**Changes:**
- For RR: unchanged, still scans single queue at level 0
- For MQSS: scans active set first across all priority levels (high to low)
- If no runnable process found in active set, calls `mqss_swap_sets()`
- After swap, scans new active set (previously expired)

**Explanation:** Scheduler prioritizes active set. When empty, swaps sets to give all processes a fresh quantum. This implements the batch scheduling characteristic of MQSS.

#### 1.8 `yield()` - Modified Function

**Changes for MQSS:**
- If quantum exhausted (`p->quantum <= 0`):
  - Dequeues from current position
  - Enqueues to expired set at same priority level
  - Does NOT replenish quantum (keeps it at 0 or negative)
- If quantum remaining (voluntary yield):
  - Dequeues from current position
  - Re-enqueues to active set at same priority level (back of queue)
  - Keeps remaining quantum

**Changes for RR:**
- Always replenishes quantum to `MQSS_PROC_QUANTUM`
- Always enqueues to active set (only one set exists effectively)

**Explanation:** MQSS distinguishes between voluntary and involuntary yields. Quantum-exhausted processes go to expired set and wait for set swap. Voluntary yields stay in active set with remaining quantum.

#### 1.9 `wakeup()` - Modified Function

**Changes:**
- For RR: unchanged, resets quantum and enqueues to active set
- For MQSS:
  - Does NOT reset quantum (preserves remaining quantum from before sleep)
  - Always enqueues to active set at current priority level
  - Sets state to RUNNABLE

**Explanation:** In MQSS, waking processes return to active set but keep their quantum state. This prevents sleeping from being used to "cheat" and get fresh quantum.

#### 1.10 `kill()` - Modified Function

**Changes:**
- When killing sleeping process:
  - Sets state to RUNNABLE
  - For RR: resets quantum to `MQSS_PROC_QUANTUM`
  - For MQSS: preserves current quantum
  - Dequeues and re-enqueues to active set at current priority level

**Explanation:** Killed sleeping processes must wake up to exit properly. They're placed in active set to ensure they run soon. Quantum handling matches `wakeup()` behavior for consistency.

#### 1.11 `exit()` - Modified Function

**Changes:**
- Dequeues process BEFORE acquiring any locks (prevents race condition)
- `mqss_dequeue()` handles removal from either active or expired set
- Rest of exit logic unchanged

**Explanation:** Early dequeue eliminates race window where `wait()` could reap zombie before final `sched()` call. Works correctly regardless of which set the process is in.

#### 1.12 `print_schedlog()` - Modified Function

**Changes:**
- For MQSS: prints both active and expired sets
- Format: `<tick>|active|L(lq),[processes...]|expired|L(lq),[processes...]`
- For each set, shows: priority level, level quantum, and list of processes
- Process format unchanged: `[PID]name:state(quantum)`

**Explanation:** Extended output shows dual-set structure, making it easier to observe set swaps and process movement between sets during debugging.

---

### 2. **kernel/proc.h**

**Changes:**
- Added new field to `struct proc`: `int in_expired_set`
- 0 = process is in active set
- 1 = process is in expired set

**Explanation:** This flag allows O(1) determination of which set contains a process, avoiding expensive searches through both queues.

---

### 3. **kernel/mqss.h**

**No changes from Phase 1.**

**Explanation:** Constants remain the same; active/expired architecture doesn't require new configuration parameters.

---

### 4. **kernel/defs.h**

**Changes:**
- Added declaration: `void mqss_swap_sets(void)`

**Explanation:** Exposes set swap function for use in scheduler logic.

---

# Phase 1 - Changes

## Overview
Phase 1 implements a Round Robin (RR) scheduler using a single FIFO queue at priority level 0. All processes are enqueued at the tail and scheduled from the head with a fixed time quantum.

---

## Code Changes by File

### 1. **kernel/mqss.h** (New File)

**Changes:**
- Defined `LEVELS = 1`
- Defined `MQSS_STARTING_LEVEL = 0`
- Defined `MQSS_PROC_QUANTUM = 10`
- Defined `MQSS_LEVEL_QUANTUM = 100`

**Explanation:** These constants configure the scheduler behavior with a single priority level for Phase 1 RR scheduling.

---

### 2. **kernel/param.h**

**Changes:**
- Added `#include "mqss.h"` to import MQSS constants
- Added conditional definition of `SCHEDULING_POLICY` that defaults to "Vanilla xv6 RR"

**Explanation:** Allows compile-time selection between vanilla xv6 and RR scheduling. To enable RR scheduling, compile with `make qemu SCHEDULING_POLICY=RR`. If not specified, defaults to vanilla xv6 behavior.

---

### 3. **kernel/proc.h**

**Changes:** Added five new fields to `struct proc` for MQSS scheduler support:
- `int quantum`: Tracks remaining process quantum in ticks, decremented on each timer interrupt
- `int priority_level`: Current priority level
- `int original_level`: Original/starting priority level to return to
- `struct proc *queue_next`: Pointer to next process in the FIFO queue
- `struct proc *queue_prev`: Pointer to previous process in the FIFO queue

**Explanation:** These fields enable the doubly-linked queue implementation and track scheduling state per process. The doubly-linked structure allows O(1) removal from any position in the queue.

---

### 4. **kernel/proc.c**

**Major Changes:** This file contains the core scheduler implementation.

#### 4.1 Global Queue State

**Added:**
- `struct proc *queue_head[LEVELS]`: Array of queue head pointers
- `struct proc *queue_tail[LEVELS]`: Array of queue tail pointers
- `struct spinlock queue_lock`: Spinlock protecting queue operations
- `int schedlog_active`: Number of ticks remaining for schedlog output
- `int schedlog_start_tick`: Tick number when schedlog was activated

**Explanation:** These globals maintain the FIFO queue structure and schedlog state. The queue_lock prevents race conditions during concurrent queue modifications.

#### 4.2 `mqss_init()` - New Function

**Purpose:** Initialize MQSS queue structures at boot time.

**Implementation:**
- Initializes the `queue_lock` spinlock with name "mqss_queue"
- Sets all queue head and tail pointers to NULL (empty queues)
- Called from `main()` when SCHEDULING_POLICY is set to "RR"

**Explanation:** Sets up empty queues and synchronization primitives before any processes are created.

#### 4.3 `mqss_in_queue_locked()` - New Helper Function

**Purpose:** Check if a process is currently in a specific queue.

**Implementation:**
- Caller must hold `queue_lock`
- Iterates through the queue starting from head
- Returns 1 if process found, 0 otherwise

**Explanation:** Used internally to prevent duplicate enqueuing and verify queue membership before dequeue operations.

#### 4.4 `mqss_enqueue()` - New Function

**Purpose:** Add a process to the tail of a priority level queue.

**Implementation:**
- Validates level parameter (0 to LEVELS-1)
- If process already in queue, removes it first (handles re-enqueue case)
- Sets process fields
- Links process to queue tail, updates tail pointer
- If queue was empty, also updates head pointer

**Explanation:** Implements FIFO queue by always adding to the tail. The check-and-remove logic prevents duplicate entries when a process is re-enqueued (e.g., after yielding).

#### 4.5 `mqss_dequeue()` - New Function

**Purpose:** Remove a process from its current queue.

**Implementation:**
- Reads process's `priority_level` to identify which queue it's in
- Verifies process is actually in the queue using `mqss_in_queue_locked()`
- Unlinks process by updating neighbor's pointers (or head/tail if at edges)
- Clears process's queue pointers and resets `priority_level` to -1

**Explanation:** Safely removes a process from anywhere in the queue (not just head). Used when processes exit, block, or are being moved between queues.

#### 4.6 `mqss_pick_next()` - New Function

**Purpose:** Select the next process to run from the queue.

**Implementation:**
- Starts at queue head (level 0 in Phase 1)
- Iterates through queue, skipping non-RUNNABLE processes (e.g., SLEEPING)
- For each process, acquires `p->lock` to check state atomically
- Returns first RUNNABLE process with its lock held, or NULL if none found

**Explanation:** Scans queue from head to tail, respecting FIFO order. Sleeping processes remain in queue but are skipped. Returns with process lock held to prevent state changes before context switch.

#### 4.7 `mqss_scheduler()` - New Function

**Purpose:** Main scheduler loop for MQSS/RR policy.

**Implementation:**
- Infinite loop that repeatedly picks and runs processes
- Enables interrupts to avoid deadlock with `intr_on()`
- Calls `mqss_pick_next()` to select next process
- If no process available, enables interrupts and executes `wfi` (wait for interrupt)
- If process found (returned with lock held), sets state to RUNNING and updates `c->proc`
- Checks if schedlog is active, calls `print_schedlog()` if within duration
- Performs context switch via `swtch()`
- After process returns, clears `c->proc` and releases process lock

**Explanation:** This replaces the vanilla xv6 scheduler when RR is enabled. The schedlog check before context switch provides visibility into scheduling decisions.

#### 4.8 `scheduler()` - Modified Function

**Changes:**
- Added check at beginning: if `SCHEDULING_POLICY` starts with "RR", calls `mqss_scheduler()` instead
- Falls through to vanilla xv6 scheduler implementation if not using RR

**Explanation:** Provides clean routing between vanilla and RR schedulers based on compile-time policy selection.

#### 4.9 `yield()` - Modified Function

**Changes for RR:**
- If RR policy enabled, replenishes `p->quantum` to `MQSS_PROC_QUANTUM`
- Sets process state to RUNNABLE
- Dequeues process from current position
- Re-enqueues at tail of level 0 (maintains FIFO order)
- Calls `sched()` for context switch

**Explanation:** In Phase 1 RR, all yields (voluntary or preemptive) are treated identically - the process always gets a fresh quantum and goes to the back of the queue. This ensures fairness.

#### 4.10 `allocproc()` - Modified Function

**Changes:**
- Added initialization of MQSS fields after successful allocation:
  - `p->quantum = MQSS_PROC_QUANTUM` (start with full quantum)
  - `p->priority_level = -1` (not yet in any queue)
  - `p->original_level = MQSS_STARTING_LEVEL` (will be enqueued at level 0)
  - `p->queue_next = 0` and `p->queue_prev = 0` (not linked)

**Explanation:** Ensures all new processes start with consistent MQSS state before being enqueued.

#### 4.11 `userinit()` - Modified Function

**Changes:**
- After creating init process and setting state to RUNNABLE
- Added conditional: if RR policy enabled, calls `mqss_enqueue(p, p->original_level)` to add init to queue

**Explanation:** The init process (PID 1) must be explicitly enqueued to be scheduled under RR policy.

#### 4.12 `fork()` - Modified Function

**Changes:**
- After child process is fully set up and marked RUNNABLE
- Added conditional: if RR policy enabled, calls `mqss_enqueue(np, np->original_level)` to add child to queue

**Explanation:** Newly forked processes must be enqueued to become eligible for scheduling. They are added at the tail of level 0.

#### 4.13 `exit()` - Modified Function

**Changes:**
- Dequeues process early, before acquiring locks
- After setting process state to ZOMBIE and releasing locks
- Calls `sched()` for final context switch

**Explanation:** Exiting processes must be removed from the queue so they won't be selected by the scheduler. Dequeue happens before lock acquisition to prevent race conditions with `wait()`.

#### 4.14 `wakeup()` - Modified Function

**Changes:**
- Added tracking variable `do_enqueue` initialized to 0
- When waking a sleeping process (state SLEEPING matching channel):
  - Sets state to RUNNABLE
  - Sets `p->quantum = MQSS_PROC_QUANTUM` to give fresh time slice
  - Sets `do_enqueue = 1` flag
- Saves `current_level` before releasing lock
- After releasing `p->lock`, if `do_enqueue` flag set and RR enabled:
  - Calls `mqss_dequeue(p)` to remove from old position
  - Calls `mqss_enqueue(p, current_level)` to add at tail

**Explanation:** Woken processes need to be made schedulable again by re-enqueuing them. They get a fresh quantum as if newly created. The dequeue-then-enqueue ensures they move to the tail of the queue.

#### 4.15 `kill()` - Modified Function

**Changes:**
- When killing a sleeping process:
  - Sets state to RUNNABLE
  - Resets quantum to `MQSS_PROC_QUANTUM`
  - Dequeues and re-enqueues at tail (similar to `wakeup()`)

**Explanation:** Killed sleeping processes must be woken up so they can run and actually exit. Re-enqueuing makes them schedulable again.

#### 4.16 `sleep()` - No Functional Changes

**Behavior in Phase 1:**
- Process remains in queue when sleeping
- State changes to SLEEPING but queue membership unchanged
- Scheduler skips SLEEPING processes in `mqss_pick_next()`

**Explanation:** This design is more efficient than dequeuing/re-enqueuing sleeping processes. They simply stay in place with SLEEPING state, and the scheduler skips over them.

#### 4.17 `freeproc()` - Modified Function

**Changes:**
- Before clearing process state to UNUSED
- Added defensive dequeue (handles all cases safely)

**Explanation:** Ensures processes are removed from queues before their memory is recycled. Prevents dangling queue pointers.

#### 4.18 `print_schedlog()` - New Function

**Purpose:** Print current scheduler state for debugging/testing.

**Output Format:** `<tick>|active|0(0),[PID]name:state(quantum),...`

**Implementation:**
- Reads current tick count
- For RR: prints "active" set label with level 0 and level quantum 0 (unused)
- Iterates through queue from head to tail
- For each process, prints: PID, name, state (as integer), and remaining quantum
- For vanilla xv6: scans entire proc table instead of queue

**Explanation:** Provides visibility into scheduler state at each scheduling decision. The format shows queue order and per-process state. Called from scheduler right before context switches.

---

### 5. **kernel/trap.c**

**Changes in `usertrap()` function:**
- In timer interrupt handler (when `which_dev == 2`):
  - Added conditional: if RR policy enabled:
    - Decrements `p->quantum` by 1
    - If quantum reaches 0 or below, calls `yield()` to force preemption
  - Otherwise (vanilla policy): always calls `yield()` on timer

**Explanation:** Implements quantum-based preemption. Each timer tick (~10ms) decrements the running process's quantum. When quantum is exhausted, the process is forced to yield, moving to the back of the queue. This ensures no process monopolizes the CPU beyond its quantum.

---

### 6. **kernel/main.c**

**Changes in `main()` function:**
- Added printf statement to display active scheduling policy at boot
- After calling `procinit()`:
  - Added conditional: if RR policy enabled, calls `mqss_init()` to initialize queue structures

**Explanation:** Ensures MQSS infrastructure is set up before any processes are created. The printf helps verify which policy is active during testing.

---

### 7. **kernel/defs.h**

**Changes:** Added function declarations:
- `void mqss_init(void)`: Initialize MQSS queues
- `void print_schedlog(void)`: Print scheduler state

**Explanation:** Makes these functions visible to other kernel files like `main.c` which needs to call `mqss_init()`.

---

### 8. **kernel/sysproc.c**

**Changes:** Implemented new `sys_schedlog()` system call handler.

**Implementation:**
- Extracts integer argument using `argint(0, &duration)`
- Returns -1 if duration is negative (error)
- If duration is positive, sets `schedlog_active = duration` and records `schedlog_start_tick = ticks`
- If duration is 0, disables schedlog by setting `schedlog_active = 0`
- Returns 0 on success

**Explanation:** Provides user programs control over scheduler logging. The duration parameter specifies how many timer ticks to log. Setting duration to 0 disables logging.

---

### 9. **kernel/syscall.h**

**Changes:**
- Added `#define SYS_schedlog 24` to assign system call number

**Explanation:** Each system call needs a unique number for the system call dispatch table.

---

### 10. **kernel/syscall.c**

**Changes:**
- Added extern declaration for `sys_schedlog`
- Added entry in `syscalls` array: `[SYS_schedlog] sys_schedlog`

**Explanation:** Registers the system call handler in the dispatch table so it can be invoked from user space.

---

### 11. **user/user.h**

**Changes:**
- Added function declaration: `int schedlog(int);`

**Explanation:** Exposes the schedlog system call to user programs.

---

### 12. **user/usys.pl**

**Changes:**
- Added `entry("schedlog");` to generate system call stub

**Explanation:** This Perl script generates assembly stubs that invoke system calls. The entry for schedlog creates the user-space wrapper that transitions to kernel mode.

---

### 13. **user/schedlog.c** (New File)

**Purpose:** User program to test scheduler logging.

**Implementation:**
- Takes one command-line argument specifying number of ticks
- Validates argument is positive
- Calls `schedlog()` system call with the duration
- Exits

**Usage Example:** `schedlog 50` enables logging for 50 ticks

**Explanation:** Provides a simple interface for users to enable scheduler logging without modifying kernel code. Useful for debugging and understanding scheduler behavior.

---

### 14. **Makefile**

**Changes:**
- Added `$U/_schedlog` to `UPROGS` list to build the schedlog user program

**Explanation:** Ensures the schedlog utility is compiled and included in the file system image.
