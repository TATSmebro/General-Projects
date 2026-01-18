#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <dirent.h>
#include <sys/file.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <unistd.h>
#include <limits.h>

// ============================================================================
// CS 140 PROJECT 2 - PART 1: MULTITHREADED GREP
// ============================================================================
// OPTIMIZATIONS IMPLEMENTED:
//   1. Dynamic work queue (better load balancing than static partitioning)
//   2. Batched file writes (reduces lock contention by 10x)
//   3. Chunk-based processing (better cache locality)
//   4. Removed unnecessary sleep(2) (proper synchronization suffices)
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

#define MAX_FILES 1000                  // Maximum files that can be processed
#define MAX_FILENAME 256                // Maximum length of a filename
#ifndef PATH_MAX
#define PATH_MAX 4096                   // Maximum path length
#endif
#define MAX_LINKS 100                   // Maximum inlinks/outlinks per file
#define CHUNK_SIZE 10                   // Process files in chunks for better cache locality

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

int NUM_THREADS;            // Number of worker threads (from command line)
char DIR_STRUCTURE[50];     // Directory structure type (connected, forest, full, random)
int DEBUG = 0;              // Debug mode flag (TRUE/FALSE)

// ============================================================================
// DATA STRUCTURES
// ============================================================================

// FileLink Struct: Storing information about a single file and its connections
// SPEC Section 3.1.2 -- Store path, name, inlinks, outlinks
typedef struct {
    char path[PATH_MAX];                    // Full path: "files/subdir/A.txt"
    char name[MAX_FILENAME];                // Filename: "A.txt"
    char inlinks[MAX_LINKS][MAX_FILENAME];  // Array of filenames mentioning THIS file
    int inlink_count;                       // Number of inlinks found
    char outlinks[MAX_LINKS][MAX_FILENAME]; // Array of filenames THIS file mentions
    int outlink_count;                      // Number of outlinks found
} FileLink;

// DirQueue: Circular queue to store directory paths for Task Queue 0
// SPEC Section 3.1.3 - Producer/Consumer pattern for directory traversal
typedef struct{
    char paths[MAX_FILES][PATH_MAX]; // Array of directory paths
    int front;                       // Index of next item to dequeue
    int rear;                        // Index where next item will be enqueued
    int count;                       // Current number of items in queue
} DirQueue;

// ThreadArgs: Arguments passed to each worker thread
typedef struct{
    int thread_id;   // Thread ID (0 to NUM_THREADS-1)
    DirQueue *queue; // Pointer to shared directory queue
} ThreadArgs;

// WorkQueue: Dynamic work distribution for Task Queue 1
//  Better load balancing than static (file_idx % NUM_THREADS)
typedef struct {
    int next_file_idx;  // Next file index to be processed
} WorkQueue;

// ============================================================================
// GLOBAL SHARED DATA
// ============================================================================

FileLink file_links[MAX_FILES]; // Array of all files found
int file_link_count = 0;        // Number of files currently in file_links[]

// Work queue for dynamic load balancing in Task Queue 1
WorkQueue work_queue = {0};

// ============================================================================
// SYNCHRONIZATION PRIMITIVES
// ============================================================================
// SPEC Section 3.1.3 - Using MUTEXES for thread-safe operations
pthread_mutex_t queue0_mutex = PTHREAD_MUTEX_INITIALIZER;       // Protects DirQueue operations
pthread_cond_t queue0_cond = PTHREAD_COND_INITIALIZER;          // Condition variable for queue0
pthread_mutex_t filelinks_mutex = PTHREAD_MUTEX_INITIALIZER;    // Protects file_links[] array
pthread_mutex_t output_mutex = PTHREAD_MUTEX_INITIALIZER;       // Protects output file writes
pthread_mutex_t work_mutex = PTHREAD_MUTEX_INITIALIZER;         //  Protects work queue

// ============================================================================
// CONTROL FLAGS
// ============================================================================
// Flag to indicate when main thread is done adding directories
int queue0_done = 0;    // 0 = still adding work, 1 = no more directories will be added

// ============================================================================
// QUEUE OPERATIONS FOR TASK QUEUE 0
// ============================================================================

// SPEC Section 3.1.3 - Initialize an empty directory queue
void init_queue(DirQueue *q){
    q->front = 0;               // Next item to dequeue is at index 0
    q->rear = 0;                // Next item will be enqueued at index 0
    q->count = 0;               // Queue is empty
}

// Add a directory path to the queue (thread-safe)
// SPEC: Producer operation in producer/consumer pattern
int enqueue_dir(DirQueue *q, const char *path){
    pthread_mutex_lock(&queue0_mutex);
    // -------------------------------    
    if (q->count >= MAX_FILES){
        pthread_mutex_unlock(&queue0_mutex);
        fprintf(stderr, "ERROR: DIRECTORY QUEUE FULL (MAX %d)\n", MAX_FILES);
        return -1;  // Failure
    }

    strcpy(q->paths[q->rear], path);        // Copy path to queue at rear position
    q->rear = (q->rear + 1) % MAX_FILES;    // Move rear pointer forward (circular)
    q->count++;                             // Increment count
    // -------------------------------
    pthread_cond_signal(&queue0_cond);      // Wake up one waiting thread
    pthread_mutex_unlock(&queue0_mutex);
    return 0;       // Success
}

// Remove and return a directory path from queue (thread-safe)
// SPEC: Consumer operation in producer/consumer pattern
int dequeue_dir(DirQueue *q, char *path){
    pthread_mutex_lock(&queue0_mutex);
    // -------------------------------    
    if (q->count == 0) {
        pthread_mutex_unlock(&queue0_mutex);  
        return -1;  // Queue empty
    }

    strcpy(path, q->paths[q->front]);               // Copy path from front position
    q->front = (q->front + 1) % MAX_FILES;          // Move front pointer forward (circular)
    q->count--;                                     // Decrement count
    // -------------------------------    
    pthread_mutex_unlock(&queue0_mutex);
    return 0;  // Success
}

// ============================================================================
//  DYNAMIC WORK DISTRIBUTION
// ============================================================================
// Get next chunk of work for Task Queue 1
// BENEFIT: Better load balancing than static partitioning
// Each thread grabs chunks dynamically, so fast threads don't idle
int get_next_work_chunk(int *start_idx, int chunk_size) {
    pthread_mutex_lock(&work_mutex);
    // -------------------------------
    if (work_queue.next_file_idx >= file_link_count) {
        pthread_mutex_unlock(&work_mutex);
        return -1;  // No more work available
    }
    
    *start_idx = work_queue.next_file_idx;          // Give thread this starting index
    work_queue.next_file_idx += chunk_size;         // Reserve next chunk
    // -------------------------------
    pthread_mutex_unlock(&work_mutex);
    return 0;  // Success - thread got work
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Check if a file with this name already exists in file_links[]
// Used to prevent duplicate entries
int file_exists(const char *name){
    for (int i = 0; i < file_link_count; i++){
        if (strcmp(file_links[i].name, name) == 0){
            return 1;       // File found
        }
    }
    return 0;               // File not found
}

// Safely build a path by concatenating directory and filename
// Prevents buffer overflow attacks
int safe_path_concat(char *dest, size_t dest_size, const char *dir, const char *name) {
    size_t dir_len = strlen(dir);
    size_t name_len = strlen(name);
    
    // Check if combined length fits (including null terminator)
    if (dir_len + name_len + 1 > dest_size) {
        fprintf(stderr, "ERROR: Path too long: %s%s\n", dir, name);
        return -1;  // Failure
    } 
    
    snprintf(dest, dest_size, "%s%s", dir, name);
    return 0;  // Success
}

// Safely add trailing slash to a path
int safe_path_add_slash(char *dest, size_t dest_size, const char *path) {
    size_t path_len = strlen(path);
    
    // Need space for path + '/' + '\0'
    if (path_len + 2 > dest_size) {
        fprintf(stderr, "ERROR: Path too long for trailing slash: %s\n", path);
        return -1;  // Failure
    }
    
    snprintf(dest, dest_size, "%s/", path);
    return 0;  // Success
}

// GREP - invokes the external grep command via system() and parses the exit status to determine if a match was found
int grep_file(const char *search_string, const char *file_path) {
    // Build grep command
    char command[PATH_MAX * 2 + 50];
    snprintf(command, sizeof(command), 
             "grep -q -F '%s' '%s' 2>/dev/null",  
             search_string, file_path);

    // Execute grep
    int status = system(command);

    if (status == -1) {
        return -1;  // system() failed
    }
    
    // Check exit status
    if (WIFEXITED(status)) {
        int exit_code = WEXITSTATUS(status);
        if (exit_code == 0) {
            return 1;  // Match found
        } else if (exit_code == 1) {
            return 0;  // No match
        } else {
            return -1; // grep error
        }
    }
    
    return -1;  // Process didn't exit normally
}

// ============================================================================
// TASK QUEUE 0 WORKER: DIRECTORY TRAVERSAL
// ============================================================================
// SPEC Section 3.1.5 - Find all files in directory tree
// Each thread:
//   1. Dequeues a directory
//   2. Reads all entries in that directory
//   3. Enqueues subdirectories for other threads
//   4. Records regular files in file_links[]
void* task_queue_0_worker(void *arg) {
    ThreadArgs *args = (ThreadArgs *)arg;   // Cast void* to ThreadArgs*
    int tid = args->thread_id;              // This thread's ID
    DirQueue *queue = args->queue;          // Pointer to shared queue
    char dir_path[PATH_MAX];                // Buffer for dequeued directory

    // ------ Main worker loop ------
    while(1) {
        // = Try to dequeue a directory =
        if (dequeue_dir(queue, dir_path) == -1) {   
            // Queue is empty - should we exit or wait?
            pthread_mutex_lock(&queue0_mutex);
            // ------------------------------
            // Wait while queue is empty AND work might still come
            while (queue->count == 0 && !queue0_done) {
                // Block until signaled that work was added
                pthread_cond_wait(&queue0_cond, &queue0_mutex);
            }

            int done = queue0_done;          // Is main thread done adding work?
            int empty = (queue->count == 0); // Is queue empty?
            // ------------------------------
            pthread_mutex_unlock(&queue0_mutex);

            // Exit condition: Queue empty AND no more work coming
            if (done && empty){
                if (DEBUG) {
                    printf("[%d] T-0 FINISHED (queue empty and done)\n", tid);
                }
                break;  // Exit worker loop
            }

            // Queue temporarily empty but more work might come - keep waiting
            continue;
        }

        // = Successfully dequeued a directory - process it =
        printf("[%d] T-0 DIR %s\n", tid, dir_path);

        // = Open the directory =
        DIR *dir = opendir(dir_path);
        if (!dir) {
            perror("opendir");  // Permission denied or doesn't exist
            continue;           // Skip this directory
        }

        // = Read all entries in directory =
        struct dirent *entry;
        while ((entry = readdir(dir)) != NULL) {
            // Skip current and parent directory entries
            if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) {
                continue;  
            }
            
            // Build full path: "files/" + "A.txt" = "files/A.txt"
            char full_path[PATH_MAX];
            if (safe_path_concat(full_path, PATH_MAX, dir_path, entry->d_name) != 0) {
                continue;  // Path too long - skip
            }

            // = Check if entry is directory or file =
            struct stat statbuf;
            if (stat(full_path, &statbuf) == -1) {
                perror("stat");
                continue;  // Can't stat - skip
            }

            // = Handle subdirectories =
            if (S_ISDIR(statbuf.st_mode)) {
                // Add trailing slash: "files/subdir" -> "files/subdir/"
                char subdir_path[PATH_MAX];
                if (safe_path_add_slash(subdir_path, PATH_MAX, full_path) != 0) {
                    continue;  // Path too long
                }

                // Enqueue for processing (this or another thread will handle it)
                if (enqueue_dir(queue, subdir_path) == 0) {
                    printf("[%d] T-0 ENQUEUE %s\n", tid, subdir_path);
                }
            } 
            // = Handle regular files =
            else if (S_ISREG(statbuf.st_mode)){
                printf("[%d] T-0 FILE %s\n", tid, full_path);
                
                // = Add to file_links[] array (thread-safe) =
                pthread_mutex_lock(&filelinks_mutex);
                // ----------------------------------
                if (!file_exists(entry->d_name)) {
                    // Check capacity
                    if (file_link_count >= MAX_FILES) {
                        fprintf(stderr, "ERROR: TOO MANY FILES (MAX %d)\n", MAX_FILES);
                        pthread_mutex_unlock(&filelinks_mutex);
                        closedir(dir);
                        return NULL;
                    }
                    
                    // Create new FileLink entry
                    FileLink *fl = &file_links[file_link_count];
                    strcpy(fl->path, full_path);        // Store full path
                    strcpy(fl->name, entry->d_name);    // Store filename
                    fl->inlink_count = 0;               // Initialize counts
                    fl->outlink_count = 0;
                    file_link_count++;                  // Increment file count
                }
                // ----------------------------------
                pthread_mutex_unlock(&filelinks_mutex);
            }
            // SPEC: Assume no special files (symlinks, pipes, etc.)
        }
        closedir(dir);
    }

    if (DEBUG) {
        printf("[%d] T-0 Thread exiting\n", tid);
    }
    
    return NULL;
}

// ============================================================================
//  TASK QUEUE 1 WORKER: FIND INLINKS AND OUTLINKS
// ============================================================================
// SPEC Section 3.1.4 - Find inlinks/outlinks using grep
//
// OPTIMIZATIONS IMPLEMENTED:
//   1. Dynamic work queue (better load balancing than file_idx % NUM_THREADS)
//   2. Chunk-based processing (reduces context switching overhead)
//   3. Batched file writes (one lock per chunk vs one lock per file)
void* task_queue_1_worker(void *arg) {
    ThreadArgs *args = (ThreadArgs *)arg;
    int tid = args->thread_id;
    
    //  Buffer for batched writes
    // Reduces mutex contention by writing multiple files at once
    char write_buffer[MAX_FILES * 512];
    int buffer_pos = 0;
    
    // Main worker loop - grab chunks dynamically
    while (1) {
        int start_idx;
        
        //  Get next chunk of work (dynamic load balancing)
        // Better than static partitioning (file_idx % NUM_THREADS)
        if (get_next_work_chunk(&start_idx, CHUNK_SIZE) == -1) {
            break;  // No more work available
        }
        
        int end_idx = start_idx + CHUNK_SIZE;
        if (end_idx > file_link_count) {
            end_idx = file_link_count;
        }
        
        // = Process this chunk of files =
        for (int file_idx = start_idx; file_idx < end_idx; file_idx++) {
            FileLink *current_file = &file_links[file_idx];
            printf("[%d] T-1 START %s\n", tid, current_file->name);

            // =================================================================
            // FIND INLINKS: Which files mention THIS file?
            // =================================================================
            for (int other_idx = 0; other_idx < file_link_count; other_idx++) {
                // Don't check if file mentions itself
                if (other_idx == file_idx) continue;
                
                FileLink *other_file = &file_links[other_idx];
                
                // Does other_file contain current_file's name?
                int result = grep_file(current_file->name, other_file->path);
                
                if (result == 1) {  // Match found!
                    printf("[%d] T-1 INLINK %s %s\n", 
                           tid, current_file->name, other_file->name);
                    
                    // Check for duplicates
                    int already_exists = 0;
                    for (int k = 0; k < current_file->inlink_count; k++) {
                        if (strcmp(current_file->inlinks[k], other_file->name) == 0) {
                            already_exists = 1;
                            break;
                        }
                    }
                    
                    // Store unique inlinks only
                    if (!already_exists && current_file->inlink_count < MAX_LINKS) {
                        strcpy(current_file->inlinks[current_file->inlink_count], 
                               other_file->name);
                        current_file->inlink_count++;
                    }
                } else if (result == 0) {
                    printf("[%d] T-1 NO-INLINK %s %s\n",
                           tid, current_file->name, other_file->name);
                }
                // If result == -1 (error), silently skip
            }

            // ==================================================================
            // FIND OUTLINKS: Which files does THIS file mention?
            // ==================================================================
            for (int other_idx = 0; other_idx < file_link_count; other_idx++) {
                if (other_idx == file_idx) continue;
                
                FileLink *other_file = &file_links[other_idx];
                
                // Does current_file contain other_file's name?
                int result = grep_file(other_file->name, current_file->path);
                
                if (result == 1) {  // Match found!
                    // Check for duplicates
                    int already_exists = 0;
                    for (int k = 0; k < current_file->outlink_count; k++) {
                        if (strcmp(current_file->outlinks[k], other_file->name) == 0) {
                            already_exists = 1;
                            break;
                        }
                    }
                    
                    // Store unique outlinks only
                    if (!already_exists && current_file->outlink_count < MAX_LINKS) {
                        strcpy(current_file->outlinks[current_file->outlink_count], 
                               other_file->name);
                        current_file->outlink_count++;
                    }
                }
                // No output for outlinks during grep (only final count)
            }
            
            // Output final outlink count
            printf("[%d] T-1 %s %d\n", 
                   tid, current_file->name, current_file->outlink_count);

            // ==================================================================
            //  Add to write buffer (batched writes)
            // ==================================================================
            // Build output line: path|name|[inlinks]|[outlinks]
            int written = snprintf(write_buffer + buffer_pos, 
                                   sizeof(write_buffer) - buffer_pos,
                                   "%s|%s|[", current_file->path, current_file->name);
            buffer_pos += written;
            
            // Write inlinks
            for (int j = 0; j < current_file->inlink_count; j++) {
                written = snprintf(write_buffer + buffer_pos,
                                   sizeof(write_buffer) - buffer_pos,
                                   "%s%s", current_file->inlinks[j],
                                   j < current_file->inlink_count - 1 ? "," : "");
                buffer_pos += written;
            }
            
            written = snprintf(write_buffer + buffer_pos,
                               sizeof(write_buffer) - buffer_pos, "]|[");
            buffer_pos += written;
            
            // Write outlinks
            for (int j = 0; j < current_file->outlink_count; j++) {
                written = snprintf(write_buffer + buffer_pos,
                                   sizeof(write_buffer) - buffer_pos,
                                   "%s%s", current_file->outlinks[j],
                                   j < current_file->outlink_count - 1 ? "," : "");
                buffer_pos += written;
            }
            
            written = snprintf(write_buffer + buffer_pos,
                               sizeof(write_buffer) - buffer_pos, "]\n");
            buffer_pos += written;
        }
        
        // ==================================================================
        //  Batch write to file (one lock for entire chunk)
        // ==================================================================
        // One lock per chunk (1 lock)
        if (buffer_pos > 0) {
            char filename[256];
            snprintf(filename, sizeof(filename), 
                     "part-1-outputs/%s_%d_file_links.txt", 
                     DIR_STRUCTURE, NUM_THREADS);
            
            pthread_mutex_lock(&output_mutex);
            // ------------------------------
            FILE *fp = fopen(filename, "a");
            if (fp) {
                fwrite(write_buffer, 1, buffer_pos, fp);  // Write entire buffer at once
                fflush(fp);
                fclose(fp);
            }
            // ------------------------------
            pthread_mutex_unlock(&output_mutex);
            
            buffer_pos = 0;  // Reset buffer for next chunk
        }
    }
    
    if (DEBUG) {
        printf("[%d] T-1 Thread exiting\n", tid);
    }
    
    return NULL;
}

// ============================================================================
// MAIN
// ============================================================================

int main(int argc, char *argv[]) {
    // ========================================================================
    // PARSE ARGUMENTS
    // ========================================================================
    // SPEC Section 3.1.1 - Command line arguments
    if (argc < 3) {
        fprintf(stderr, "Usage: %s <NUM_THREADS> <DIR_STRUCTURE> [DEBUG]\n", argv[0]);
        fprintf(stderr, "  NUM_THREADS: 1-10\n");
        fprintf(stderr, "  DIR_STRUCTURE: connected, forest, full, random\n");
        fprintf(stderr, "  DEBUG: TRUE or FALSE (optional, default FALSE)\n");
        return 1;
    }
    
    NUM_THREADS = atoi(argv[1]);
    strcpy(DIR_STRUCTURE, argv[2]);
    
    if (argc >= 4 && strcmp(argv[3], "TRUE") == 0) {
        DEBUG = 1;
    }
    
    printf("=== CS 140 Project 2 - Part 1 () ===\n");
    printf("Threads: %d, Structure: %s, Debug: %s\n\n", 
           NUM_THREADS, DIR_STRUCTURE, DEBUG ? "TRUE" : "FALSE");

    // ========================================================================
    // CREATE OUTPUT DIRECTORY
    // ========================================================================
    // SPEC Section 4.2 - Outputs must be in part-1-outputs/
    struct stat st = {0};
    if (stat("part-1-outputs", &st) == -1) {
        if (mkdir("part-1-outputs", 0755) != 0) {
            perror("mkdir part-1-outputs");
            fprintf(stderr, "Warning: Could not create output directory\n");
        }
    }

    // ========================================================================
    // TASK QUEUE 0: DIRECTORY TRAVERSAL
    // ========================================================================
    // SPEC Section 3.1.5 - Find all files in directory tree
    printf("=== TASK QUEUE 0: Finding all files ===\n");
    
    // Initialize queue
    DirQueue queue0;
    init_queue(&queue0);
    
    // Enqueue root directory BEFORE spawning threads
    if (enqueue_dir(&queue0, "files/") != 0) {
        fprintf(stderr, "Error: Failed to enqueue files/ directory\n");
        return 1;
    }
    
    // Prepare thread arguments
    pthread_t threads[NUM_THREADS];
    ThreadArgs args[NUM_THREADS];
    
    // Create N threads for Task Queue 0
    for (int i = 0; i < NUM_THREADS; i++) {
        args[i].thread_id = i;
        args[i].queue = &queue0;
        
        if (pthread_create(&threads[i], NULL, task_queue_0_worker, &args[i]) != 0) {
            perror("pthread_create");
            return 1;
        }
    }
    
    // Signal that no more directories will be added by main thread
    pthread_mutex_lock(&queue0_mutex);
    // -------------------------------
    queue0_done = 1;
    pthread_cond_broadcast(&queue0_cond);  // Wake ALL waiting threads   
    // -------------------------------
    pthread_mutex_unlock(&queue0_mutex);
    
    // SPEC Section 3.1.5 - Main thread must block via pthread_join
    // Wait for all Task Queue 0 threads to finish
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }
    
    printf("\n=== Task Queue 0 Complete ===\n");
    printf("Found %d files\n\n", file_link_count);
    
    // Display all found files (if DEBUG mode)
    if (DEBUG) {
        printf("Files found:\n");
        for (int i = 0; i < file_link_count; i++) {
            printf("  [%d] %s (path: %s)\n", 
                   i, file_links[i].name, file_links[i].path);
        }
    }

    // ========================================================================
    // TASK QUEUE 1: INLINKS AND OUTLINKS
    // ========================================================================
    // SPEC Section 3.1.4 - Find inlinks/outlinks using grep
    printf("\n=== TASK QUEUE 1: Finding inlinks and outlinks ===\n");
    
    // Reset work queue for dynamic load balancing
    work_queue.next_file_idx = 0;
    
    // Create threads for Task Queue 1
    for (int i = 0; i < NUM_THREADS; i++) {
        args[i].thread_id = i;
        
        if (pthread_create(&threads[i], NULL, task_queue_1_worker, &args[i]) != 0) {
            perror("pthread_create");
            return 1;
        }
    }
    
    // Wait for all Task Queue 1 threads to finish
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }
    
    printf("\n=== Task Queue 1 Complete ===\n");
    
    // Display results (if DEBUG mode)
    if (DEBUG) {
        printf("\nLink analysis results:\n");
        for (int i = 0; i < file_link_count; i++) {
            FileLink *fl = &file_links[i];
            printf("  %s:\n", fl->name);
            
            printf("    Inlinks (%d): [", fl->inlink_count);
            for (int j = 0; j < fl->inlink_count; j++) {
                printf("%s", fl->inlinks[j]);
                if (j < fl->inlink_count - 1) printf(", ");
            }
            printf("]\n");

            printf("    Outlinks (%d): [", fl->outlink_count);
            for (int j = 0; j < fl->outlink_count; j++) {
                printf("%s", fl->outlinks[j]);
                if (j < fl->outlink_count - 1) printf(", ");
            }
            printf("]\n");
        }
    }
    
    // =========== OUTPUT FILE ============
    char filename[256];
    snprintf(filename, sizeof(filename), "part-1-outputs/%s_%d_file_links.txt", 
             DIR_STRUCTURE, NUM_THREADS);
    printf("\n[SUCCESS] Output written to: %s\n", filename);
    printf("\n=== Part 1 Complete ===\n");
    
    return 0;
}