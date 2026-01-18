#!/bin/bash

# ============================================================================
# CS 140 Project 2 - Part 1 Sanity Check Script (Enhanced)
# ============================================================================
# PURPOSE: Comprehensive validation for Part 1 (multithreaded grep)
#          1. Functional Verification (vs Ground Truth)
#          2. Strict Output Formatting Checks
#          3. Logic Checks (No self-links, unique entries)
#          4. Stress Testing (Race condition detection)
#          5. Memory & Thread Safety (Valgrind)
#
# USAGE: ./part_1_sanity_check.sh
# ============================================================================
# --- SETUP LOGGING ---
LOG_DIR="logs_multithreaded_sanity_checks"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MASTER_LOG="$LOG_DIR/run_${TIMESTAMP}_summary.log"

# Redirect all stdout and stderr to both console and master log file
# This captures "the current output of sanity check" as requested
exec > >(tee -i "$MASTER_LOG") 2>&1

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo "============================================"
echo "CS 140 Project 2 - Part 1 Master Runner"
echo "Start Time: $(date)"
echo "Logs saved to: $LOG_DIR/"
echo "============================================"
echo ""

# ============================================================================
# STEP 1: COMPILATION
# ============================================================================
echo -e "${CYAN}[STEP 1/6] Compiling multithreaded.c...${NC}"

gcc -o multithreaded multithreaded.c -pthread -Wall 2>&1 | tee "$LOG_DIR/compilation.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}[FAIL]${NC} Compilation failed. See $LOG_DIR/compilation.log"
    exit 1
fi

if [ -s "$LOG_DIR/compilation.log" ]; then
    echo -e "${YELLOW}[WARN]${NC} Compilation warnings detected"
else
    echo -e "${GREEN}[PASS]${NC} Compilation successful"
fi
echo ""

# ============================================================================
# STEP 2: SETUP
# ============================================================================
echo -e "${CYAN}[STEP 2/6] Setting up output directory...${NC}"

mkdir -p part-1-outputs
rm -f part-1-outputs/*.txt

# Helper script check
if [ ! -f "part_1_sanityhelper_verifylinks.py" ]; then
    echo -e "${YELLOW}[WARN]${NC} Helper script 'part_1_sanityhelper_verifylinks.py' not found."
    echo "       Ground truth verification will be skipped or fail."
fi

echo -e "${GREEN}[PASS]${NC} Created part-1-outputs/"
echo ""

# ============================================================================
# STEP 3: FUNCTIONAL TESTS (Ground Truth Verification)
# ============================================================================
STRUCTURES=("connected" "forest" "full" "random")
THREAD_COUNTS=(1 2 4 8)
MAX_FILES=5
MAX_DIRS=2
MAX_DEPTH=2

echo -e "${CYAN}[STEP 3/6] Running Functional Tests (Ground Truth Verification)...${NC}"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

for structure in "${STRUCTURES[@]}"; do
    echo "----------------------------------------"
    echo "Structure: $structure"
    echo "----------------------------------------"
    
    # Generate Files
    ./files_generator.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "  ${RED}[FAIL]${NC} Generator failed"
        ((FAILED_TESTS++))
        continue
    fi
    
    for threads in "${THREAD_COUNTS[@]}"; do
        ((TOTAL_TESTS++))
        TEST_ID="${structure}_${threads}"
        output_file="part-1-outputs/${TEST_ID}_file_links.txt"
        debug_log="$LOG_DIR/debug_${TEST_ID}.txt"
        
        echo -n "  Threads: $threads ... "
        
        # --- Run C Program ---
        timeout 30 ./multithreaded $threads $structure > /dev/null 2>&1
        exit_code=$?
        
        # --- LOGGING FOR VISUAL COMPARISON ---
        echo "========================================" > "$debug_log"
        echo "TEST: $structure with $threads threads" >> "$debug_log"
        echo "========================================" >> "$debug_log"
        
        if [ $exit_code -eq 124 ]; then
             echo -e "${RED}[TIMEOUT]${NC}"
             echo "ERROR: Program timed out (30s)" >> "$debug_log"
             ((FAILED_TESTS++))
             continue
        elif [ $exit_code -ne 0 ]; then
             echo -e "${RED}[CRASH]${NC} (Exit Code: $exit_code)"
             echo "ERROR: Program crashed with exit code $exit_code" >> "$debug_log"
             ((FAILED_TESTS++))
             continue
        fi

        # Dump actual output to debug log
        echo "" >> "$debug_log"
        echo "--- ACTUAL OUTPUT (First 20 lines) ---" >> "$debug_log"
        if [ -f "$output_file" ]; then
            head -n 20 "$output_file" >> "$debug_log"
            echo "... (see $output_file for full content)" >> "$debug_log"
        else
            echo "[File not created]" >> "$debug_log"
        fi

        # Verify Output
        if [ -f "part_1_sanityhelper_verifylinks.py" ]; then
            # Run python script and capture output to variable AND log file
            echo "" >> "$debug_log"
            echo "--- VERIFICATION REPORT ---" >> "$debug_log"
            
            # Capture output
            verify_output=$(python3 part_1_sanityhelper_verifylinks.py "$output_file" 2>&1)
            verify_status=$?
            
            # Write to log
            echo "$verify_output" >> "$debug_log"
            
            if [ $verify_status -eq 0 ]; then
                echo -e "${GREEN}[PASS]${NC}"
                ((PASSED_TESTS++))
            else
                echo -e "${RED}[FAIL]${NC} (See logs)"
                echo "$verify_output" | sed 's/^/      /' | head -n 3 # Show only first 3 lines of error to console
                ((FAILED_TESTS++))
            fi
        else
            # Fallback
            if [ -s "$output_file" ]; then
                 echo -e "${YELLOW}[PASS]${NC} (Unchecked)"
                 ((PASSED_TESTS++))
            else
                 echo -e "${RED}[FAIL]${NC} (No output)"
                 ((FAILED_TESTS++))
            fi
        fi
    done
done
echo ""

# ============================================================================
# STEP 4: STRICT FORMATTING & LOGIC CHECKS
# ============================================================================
echo -e "${CYAN}[STEP 4/6] Checking Formatting & Logic Constraints...${NC}"

TEST_FILE=$(ls part-1-outputs/*_4_file_links.txt 2>/dev/null | head -n 1)

if [ -z "$TEST_FILE" ]; then
    echo -e "${RED}[SKIP]${NC} No output files found to analyze."
else
    echo "Analyzing: $TEST_FILE"

    # 4.1 Strict Regex
    echo -n "  Format Compliance (path|name|[in]|[out])... "
    MALFORMED=$(grep -vE "^files/.*\|[^|]+\|\[.*\]\|\[.*\]$" "$TEST_FILE")
    if [ -z "$MALFORMED" ]; then
        echo -e "${GREEN}[PASS]${NC}"
    else
        echo -e "${RED}[FAIL]${NC}"
        echo "    Found malformed lines (logged to $MASTER_LOG)"
        echo "$MALFORMED" | head -n 5
    fi

    # 4.2 Self-Link
    echo -n "  Self-Link Exclusion... "
    SELF_LINKS=0
    while IFS='|' read -r path name inlinks outlinks; do
        if [[ "$inlinks" == *"$name"* ]] || [[ "$outlinks" == *"$name"* ]]; then
            ((SELF_LINKS++))
        fi
    done < "$TEST_FILE"

    if [ $SELF_LINKS -eq 0 ]; then
        echo -e "${GREEN}[PASS]${NC}"
    else
        echo -e "${RED}[FAIL]${NC} Found $SELF_LINKS self-links."
    fi

    # 4.3 Dangling Node
    echo -n "  Empty List Format ([])... "
    BAD_EMPTY=$(grep -E "\[[[:space:]]*\]" "$TEST_FILE" | grep -v "\[\]")
    if [ -z "$BAD_EMPTY" ]; then
        echo -e "${GREEN}[PASS]${NC}"
    else
        echo -e "${RED}[FAIL]${NC} Found malformed empty lists."
    fi
fi
echo ""

# ============================================================================
# STEP 5: STRESS TEST
# ============================================================================
echo -e "${CYAN}[STEP 5/6] Stress Testing (Deadlock/Crash Detection)...${NC}"
ITERATIONS=20
STRESS_THREADS=8
STRESS_STRUCT="connected"

echo "Running $ITERATIONS iterations with $STRESS_THREADS threads..."
./files_generator.sh 5 3 3 $STRESS_STRUCT > /dev/null 2>&1

STRESS_FAIL=0
for ((i=1; i<=ITERATIONS; i++)); do
    echo -ne "  Iteration $i/$ITERATIONS... \r"
    timeout 10 ./multithreaded $STRESS_THREADS $STRESS_STRUCT > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "\n  ${RED}[FAIL]${NC} Crashed or Timed Out on iteration $i"
        STRESS_FAIL=1
        break
    fi
done

if [ $STRESS_FAIL -eq 0 ]; then
    echo -e "  Iteration $ITERATIONS/$ITERATIONS... ${GREEN}[PASS]${NC}"
else
    ((FAILED_TESTS++))
fi
echo ""

# ============================================================================
# STEP 6: VALGRIND
# ============================================================================
echo -e "${CYAN}[STEP 6/6] Memory & Thread Safety Checks (Valgrind)...${NC}"

if ! command -v valgrind &> /dev/null; then
    echo -e "${YELLOW}[SKIP]${NC} Valgrind not found."
else
    echo "Generating small dataset for Valgrind..."
    ./files_generator.sh 3 2 2 forest > /dev/null 2>&1

    # 6.1 Memcheck
    echo -n "  Running Memcheck (Leaks)... "
    valgrind --tool=memcheck --leak-check=full --error-exitcode=1 --log-file="$LOG_DIR/valgrind_mem.log" \
        ./multithreaded 2 forest > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[PASS]${NC}"
    else
        echo -e "${RED}[FAIL]${NC} Leaks detected. See $LOG_DIR/valgrind_mem.log"
        ((FAILED_TESTS++))
    fi

    # 6.2 Helgrind
    echo -n "  Running Helgrind (Race Conditions)... "
    valgrind --tool=helgrind --error-exitcode=1 --log-file="$LOG_DIR/valgrind_race.log" \
        ./multithreaded 2 forest > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[PASS]${NC}"
    else
        echo -e "${RED}[FAIL]${NC} Race conditions detected. See $LOG_DIR/valgrind_race.log"
        ((FAILED_TESTS++))
    fi
fi
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo "============================================"
echo "FINAL TEST SUMMARY"
echo "============================================"
echo "Total Functional Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo "Master Log: $MASTER_LOG"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}SUCCESS: All sanity checks passed!${NC}"
    exit 0
else
    echo -e "${RED}FAILURE: Some tests failed.${NC}"
    exit 1
fi