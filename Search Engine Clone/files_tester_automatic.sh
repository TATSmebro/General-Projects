# #!/bin/bash

# # ============================================================================
# # Enhanced Demo Script - Tests ALL 4 Directory Structures
# # ============================================================================
# # This script demonstrates the file generator and tester for all structure types:
# #   - forest
# #   - connected
# #   - full
# #   - random
# # ============================================================================

# # Colors for output
# RED='\033[0;31m'
# GREEN='\033[0;32m'
# YELLOW='\033[1;33m'
# BLUE='\033[0;34m'
# CYAN='\033[0;36m'
# MAGENTA='\033[0;35m'
# NC='\033[0m' # No Color

# # Test parameters (same for all structures)
# MAX_FILES=5
# MAX_DIRS=3
# MAX_DEPTH=3

# # Array of all structure types to test
# STRUCTURES=("forest" "connected" "full" "random")

# # Results tracking
# declare -A TEST_RESULTS
# TOTAL_TESTS=0
# PASSED_TESTS=0
# FAILED_TESTS=0

# echo -e "${CYAN}============================================${NC}"
# echo -e "${CYAN}CS 140 Enhanced Demo - All Structures${NC}"
# echo -e "${CYAN}============================================${NC}"
# echo ""
# echo "This demo will test all 4 directory structures:"
# echo "  1. forest     - Files link only within same directory"
# echo "  2. connected  - Each file connected to at least one other"
# echo "  3. full       - Every file links to every other file"
# echo "  4. random     - Random connections, may have dangling nodes"
# echo ""
# echo "Test Parameters:"
# echo "  MAX_FILES:  $MAX_FILES"
# echo "  MAX_DIRS:   $MAX_DIRS"
# echo "  MAX_DEPTH:  $MAX_DEPTH"
# echo ""

# # Check if generator exists
# if [ ! -f "files_generator.sh" ]; then
#     echo -e "${RED}Error: files_generator.sh not found!${NC}"
#     echo "Please ensure files_generator.sh is in the current directory."
#     exit 1
# fi

# # Check if tester exists
# if [ ! -f "files_gentest.sh" ]; then
#     echo -e "${RED}Error: files_gentest.sh not found!${NC}"
#     echo "Please ensure files_gentest.sh is in the current directory."
#     exit 1
# fi

# # Make scripts executable
# chmod +x files_generator.sh
# chmod +x files_gentest.sh

# echo -e "${BLUE}Press Enter to start testing all structures...${NC}"
# read -r

# # ============================================================================
# # Test each structure type
# # ============================================================================

# for structure in "${STRUCTURES[@]}"; do
#     ((TOTAL_TESTS++))
    
#     echo ""
#     echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
#     echo -e "${MAGENTA}Testing Structure: ${structure^^}${NC}"
#     echo -e "${MAGENTA}═══════════════════════════════════════════${NC}"
#     echo ""
    
#     # Step 1: Generate files
#     echo -e "${YELLOW}[STEP 1/${#STRUCTURES[@]}] Generating $structure structure...${NC}"
#     echo "-------------------------------------------"
#     ./files_generator.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure
    
#     GENERATOR_EXIT=$?
    
#     if [ $GENERATOR_EXIT -ne 0 ]; then
#         echo -e "${RED}✗ Generator failed for $structure!${NC}"
#         TEST_RESULTS[$structure]="GENERATOR_FAILED"
#         ((FAILED_TESTS++))
#         continue
#     fi
    
#     echo ""
    
#     # Step 2: Run validation tests
#     echo -e "${YELLOW}[STEP 2/${#STRUCTURES[@]}] Running validation tests for $structure...${NC}"
#     echo "-------------------------------------------"
#     ./files_gentest.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure
    
#     TESTER_EXIT=$?
    
#     if [ $TESTER_EXIT -eq 0 ]; then
#         echo ""
#         echo -e "${GREEN}✓ $structure structure: ALL TESTS PASSED${NC}"
#         TEST_RESULTS[$structure]="PASSED"
#         ((PASSED_TESTS++))
#     else
#         echo ""
#         echo -e "${RED}✗ $structure structure: SOME TESTS FAILED${NC}"
#         TEST_RESULTS[$structure]="FAILED"
#         ((FAILED_TESTS++))
#     fi
    
#     # Small pause between tests for readability
#     sleep 1
# done

# # ============================================================================
# # Final Summary
# # ============================================================================

# echo ""
# echo ""
# echo -e "${CYAN}============================================${NC}"
# echo -e "${CYAN}FINAL SUMMARY - All Structures${NC}"
# echo -e "${CYAN}============================================${NC}"
# echo ""

# # Display results for each structure
# for structure in "${STRUCTURES[@]}"; do
#     result=${TEST_RESULTS[$structure]}
    
#     case $result in
#         "PASSED")
#             echo -e "  ${structure^^}: ${GREEN}✓ PASSED${NC}"
#             ;;
#         "FAILED")
#             echo -e "  ${structure^^}: ${RED}✗ FAILED${NC}"
#             ;;
#         "GENERATOR_FAILED")
#             echo -e "  ${structure^^}: ${RED}✗ GENERATOR FAILED${NC}"
#             ;;
#         *)
#             echo -e "  ${structure^^}: ${YELLOW}? UNKNOWN${NC}"
#             ;;
#     esac
# done

# echo ""
# echo -e "Total Structures Tested: $TOTAL_TESTS"
# echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
# echo -e "${RED}Failed: $FAILED_TESTS${NC}"
# echo ""

# # Exit with appropriate code
# if [ $FAILED_TESTS -eq 0 ]; then
#     echo -e "${GREEN}═══════════════════════════════════════════${NC}"
#     echo -e "${GREEN}SUCCESS! All structures validated!${NC}"
#     echo -e "${GREEN}═══════════════════════════════════════════${NC}"
#     exit 0
# else
#     echo -e "${RED}═══════════════════════════════════════════${NC}"
#     echo -e "${RED}FAILURE: $FAILED_TESTS structure(s) failed validation${NC}"
#     echo -e "${RED}═══════════════════════════════════════════${NC}"
#     exit 1
# fi


#!/bin/bash

# ============================================================================
# Enhanced Demo Script - 10-Run Stress Test
# ============================================================================
# PURPOSE: Runs the file generator and tester 10 times consecutively.
#          Each run tests all 4 structure types (forest, connected, full, random).
#          Logs are saved individually per run in the logs_file_generators/ directory.
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Test parameters
MAX_FILES=5
MAX_DIRS=3
MAX_DEPTH=3
TOTAL_RUNS=10

# Array of all structure types to test
STRUCTURES=("forest" "connected" "full" "random")

# Global Counters
GRAND_TOTAL_TESTS=0
GRAND_PASSED=0
GRAND_FAILED=0

# Ensure logs directory exists
mkdir -p logs_file_generators

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}CS 140 Stress Test - 10 Runs Sequence${NC}"
echo -e "${CYAN}============================================${NC}"

# Check for required scripts
if [ ! -f "files_generator.sh" ] || [ ! -f "files_gentest.sh" ]; then
    echo -e "${RED}Error: Missing files_generator.sh or files_gentest.sh${NC}"
    exit 1
fi

chmod +x files_generator.sh
chmod +x files_gentest.sh

# ============================================================================
# OUTER LOOP: 10 RUNS
# ============================================================================

for ((run=1; run<=TOTAL_RUNS; run++)); do
    echo ""
    echo -e "${BLUE}##################################################${NC}"
    echo -e "${BLUE}             GLOBAL RUN $run OF $TOTAL_RUNS               ${NC}"
    echo -e "${BLUE}##################################################${NC}"
    echo ""

    # Clear the standard log file for this new run so we get a fresh report
    # The tester appends, so we remove it to start fresh for this run ID
    rm -f logs_file_generators/test_files_generator_logs.txt

    # Initialize results for this specific run
    RUN_FAILED_COUNT=0

    # ========================================================================
    # INNER LOOP: 4 STRUCTURES
    # ========================================================================
    for structure in "${STRUCTURES[@]}"; do
        ((GRAND_TOTAL_TESTS++))
        
        echo -e "${MAGENTA}--- Run $run: Testing Structure '${structure^^}' ---${NC}"
        
        # 1. Generate
        ./files_generator.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure > /dev/null
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Generator failed${NC}"
            ((GRAND_FAILED++))
            ((RUN_FAILED_COUNT++))
            continue
        fi
        
        # 2. Test
        # We allow standard output to show, but the tester also writes to logs_file_generators/test_files_generator_logs.txt
        ./files_gentest.sh $MAX_FILES $MAX_DIRS $MAX_DEPTH $structure
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Passed${NC}"
            ((GRAND_PASSED++))
        else
            echo -e "${RED}✗ Failed${NC}"
            ((GRAND_FAILED++))
            ((RUN_FAILED_COUNT++))
        fi
        echo ""
    done

    # ========================================================================
    # END OF RUN PROCESSING
    # ========================================================================
    
    # Save the log file for this specific run
    mv logs_file_generators/test_files_generator_logs.txt "logs_file_generators/run_${run}_report.txt"
    echo -e "${YELLOW}Log for Run $run saved to: logs_file_generators/run_${run}_report.txt${NC}"

    if [ $RUN_FAILED_COUNT -eq 0 ]; then
        echo -e "${GREEN}>> Run $run Completed Successfully${NC}"
    else
        echo -e "${RED}>> Run $run Completed with $RUN_FAILED_COUNT errors${NC}"
    fi
    
    sleep 1
done

# ============================================================================
# FINAL AGGREGATE SUMMARY
# ============================================================================

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}FINAL AGGREGATE SUMMARY (10 RUNS)${NC}"
echo -e "${CYAN}============================================${NC}"
echo "Total Executions: $GRAND_TOTAL_TESTS"
echo -e "Total Passed:     ${GREEN}$GRAND_PASSED${NC}"
echo -e "Total Failed:     ${RED}$GRAND_FAILED${NC}"
echo ""

if [ $GRAND_FAILED -eq 0 ]; then
    echo -e "${GREEN}PERFECT SCORE! All 10 runs passed all validations.${NC}"
    exit 0
else
    echo -e "${RED}WARNING: Some tests failed. Check logs_file_generators/run_X_report.txt for details.${NC}"
    exit 1
fi