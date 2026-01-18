# #!/bin/bash

# # ============================================================================
# # Performance Measurement Script for Part 1
# # ============================================================================
# # SPEC REFERENCE: Section 4.5 - Performance Analysis
# #
# # PURPOSE: Measure execution time for NUM_THREADS = 1-10
# #          Generate data for required performance graphs
# #
# # OUTPUT: CSV file with timing data for graph generation
# # ============================================================================

# echo "============================================"
# echo "Part 1 Performance Measurement"
# echo "============================================"
# echo ""

# # Test parameters
# STRUCTURES=("connected" "forest" "full" "random")
# MAX_THREADS=10
# RUNS_PER_TEST=3  # Run 3 times and average to reduce variance

# # File generation parameters
# MAX_FILES=4
# MAX_DIRS=3
# MAX_DEPTH=3

# # Create output directory
# mkdir -p performance-data

# # Compile
# echo "[1/2] Compiling multithreaded.c..."
# gcc -o multithreaded multithreaded.c -pthread -Wall
# if [ $? -ne 0 ]; then
#     echo "ERROR: Compilation failed"
#     exit 1
# fi
# echo "      Compilation successful"
# echo ""

# echo "[2/2] Running performance tests..."
# echo "      (This may take several minutes)"
# echo ""

# # ============================================================================
# # MEASURE PERFORMANCE FOR EACH STRUCTURE
# # ============================================================================

# for structure in "${STRUCTURES[@]}"; do
#     echo "Testing $structure structure..."
    
#     # Generate files once for this structure
#     ./files_generator.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure > /dev/null 2>&1
#     file_count=$(find files -type f | wc -l)
#     echo "  Generated $file_count files"
    
#     # Create CSV file for this structure
#     csv_file="part-1-performance-data/${structure}_performance.csv"
#     echo "threads,run,duration_ms,files_processed" > "$csv_file"
    
#     # Test each thread count from 1 to 10
#     for threads in $(seq 1 $MAX_THREADS); do
#         echo -n "  Testing $threads thread(s)... "
        
#         # Run multiple times and average
#         total_time=0
#         successful_runs=0
        
#         for run in $(seq 1 $RUNS_PER_TEST); do
#             # Measure execution time in milliseconds
#             start_time=$(date +%s%3N)
            
#             # Run the program
#             ./multithreaded $threads $structure > /dev/null 2>&1
#             exit_code=$?
            
#             end_time=$(date +%s%3N)
#             duration=$((end_time - start_time))
            
#             if [ $exit_code -eq 0 ]; then
#                 echo "$threads,$run,$duration,$file_count" >> "$csv_file"
#                 total_time=$((total_time + duration))
#                 ((successful_runs++))
#             fi
#         done
        
#         if [ $successful_runs -eq $RUNS_PER_TEST ]; then
#             avg_time=$((total_time / RUNS_PER_TEST))
#             echo "avg: ${avg_time}ms"
#         else
#             echo "FAILED"
#         fi
#     done
    
#     echo ""
# done

# echo "============================================"
# echo "Performance data saved to part-1-performance-data/"
# echo ""
# echo "CSV files generated:"
# ls -1 part-1-performance-data/*.csv

# echo ""

#!/bin/bash

# ============================================================================
# CS 140 Project 2 - Part 1 Runner Script
# ============================================================================
# SPEC REFERENCE: Section 4.4.1
#
# PURPOSE: Run parallelized grep for NUM_THREADS = 1-10 for each DIR_STRUCTURE
#          Generate log files with timing information
#          Save all outputs to part-1-outputs/
#
# USAGE: ./part_1_runner.sh
# ============================================================================

echo "============================================"
echo "Part 1 Runner - Performance Measurement"
echo "============================================"
echo ""

# Test parameters
STRUCTURES=("connected" "forest" "full" "random")
MAX_THREADS=10
RUNS_PER_TEST=3  # Run 3 times and average to reduce variance

# File generation parameters
MAX_FILES=4
MAX_DIRS=3
MAX_DEPTH=3

# Create output directories
mkdir -p part-1-outputs
mkdir -p part-1-performance-data

# Compile
echo "[1/2] Compiling multithreaded.c..."
gcc -o multithreaded multithreaded.c -pthread -Wall
if [ $? -ne 0 ]; then
    echo "ERROR: Compilation failed"
    exit 1
fi
echo "      Compilation successful"
echo ""

echo "[2/2] Running performance tests..."
echo "      (This may take several minutes)"
echo ""

# ============================================================================
# MEASURE PERFORMANCE FOR EACH STRUCTURE
# ============================================================================

for structure in "${STRUCTURES[@]}"; do
    echo "Testing $structure structure..."
    
    # Generate files once for this structure
    ./files_generator.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure > /dev/null 2>&1
    file_count=$(find files -type f | wc -l)
    echo "  Generated $file_count files"
    
    # Create CSV file for this structure (for graphing)
    csv_file="part-1-performance-data/${structure}_performance.csv"
    echo "threads,run,duration_ms,files_processed" > "$csv_file"
    
    # Test each thread count from 1 to 10
    for threads in $(seq 1 $MAX_THREADS); do
        echo -n "  Testing $threads thread(s)... "
        
        # SPEC REQUIREMENT: Create log file for each run
        log_file="part-1-outputs/${structure}_${threads}_threads.log"
        
        # Run multiple times and average
        total_time=0
        successful_runs=0
        
        for run in $(seq 1 $RUNS_PER_TEST); do
            # Measure execution time in milliseconds
            start_time=$(date +%s%3N)
            
            # Run the program and capture output to log
            ./multithreaded $threads $structure > "${log_file}.run${run}" 2>&1
            exit_code=$?
            
            end_time=$(date +%s%3N)
            duration=$((end_time - start_time))
            
            if [ $exit_code -eq 0 ]; then
                # Save to CSV for graphing
                echo "$threads,$run,$duration,$file_count" >> "$csv_file"
                total_time=$((total_time + duration))
                ((successful_runs++))
            fi
        done
        
        if [ $successful_runs -eq $RUNS_PER_TEST ]; then
            avg_time=$((total_time / RUNS_PER_TEST))
            echo "avg: ${avg_time}ms"
            
            # SPEC REQUIREMENT: Append timing to log file
            # Use the first run's log and append timing
            mv "${log_file}.run1" "$log_file"
            echo "" >> "$log_file"
            echo "============================================" >> "$log_file"
            echo "PERFORMANCE SUMMARY" >> "$log_file"
            echo "============================================" >> "$log_file"
            echo "Structure: $structure" >> "$log_file"
            echo "Threads: $threads" >> "$log_file"
            echo "Files processed: $file_count" >> "$log_file"
            echo "Runs: $RUNS_PER_TEST" >> "$log_file"
            echo "Average duration: ${avg_time}ms" >> "$log_file"
            echo "Run 1 duration: $(sed -n '2p' "$csv_file" | cut -d',' -f3)ms" >> "$log_file"
            echo "Run 2 duration: $(sed -n '3p' "$csv_file" | cut -d',' -f3)ms" >> "$log_file"
            echo "Run 3 duration: $(sed -n '4p' "$csv_file" | cut -d',' -f3)ms" >> "$log_file"
            
            # Clean up extra log files
            rm -f "${log_file}.run2" "${log_file}.run3"
        else
            echo "FAILED"
        fi
    done
    
    echo ""
done

echo "============================================"
echo "Performance data saved to:"
echo "  - part-1-outputs/*.log (log files)"
echo "  - part-1-outputs/*_file_links.txt (program outputs)"
echo "  - part-1-performance-data/*.csv (for graphing)"
echo ""
echo "CSV files for graphing:"
ls -1 part-1-performance-data/*.csv

echo ""
echo "Log files created:"
ls -1 part-1-outputs/*.log | wc -l
echo " log files in part-1-outputs/"

echo ""
echo "Next steps"
echo "Use part-1_plot_performance.py to generate graphs"