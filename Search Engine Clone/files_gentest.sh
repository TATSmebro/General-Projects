#!/bin/bash

# ============================================================================
# CS 140 Project 2 - File Generator Tester
# ============================================================================
# PURPOSE: Validate that files_generator.sh created correct structure
#
# USAGE: ./files_tester.sh <MAX_FILES> <MAX_DIRS> <MAX_DEPTH> <DIR_STRUCTURE>
#
# This tester validates:
#   1. File naming convention (file_XXX.EXT)
#   2. Directory naming convention (dir_XXX)
#   3. File uniqueness
#   4. Directory depth constraints
#   5. Link structure correctness based on DIR_STRUCTURE type
# ============================================================================

# Parse command-line arguments
MAX_FILES=$1
MAX_DIRS=$2
MAX_DEPTH=$3
DIR_STRUCTURE=$4

# Log file path
LOG_DIR="logs_file_generators"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/test_files_generator_logs.txt"

# Initialize/append to log file with timestamp
echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "TEST RUN: $(date)" >> "$LOG_FILE"
echo "Parameters: MAX_FILES=$MAX_FILES, MAX_DIRS=$MAX_DIRS, MAX_DEPTH=$MAX_DEPTH, DIR_STRUCTURE=$DIR_STRUCTURE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Colors for output (terminal only)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
    local title=$1
    local style=$2  # "BOX" or empty

    echo ""
    echo "" >> "$LOG_FILE"

    if [ "$style" == "BOX" ]; then
        # --- BOX STYLE (For Main Sections) ---
        # Terminal
        echo -e "${BLUE}----------------------------------------${NC}"
        echo -e "${BLUE}$title${NC}"
        echo -e "${BLUE}----------------------------------------${NC}"
        
        # Log File
        echo "========================================" >> "$LOG_FILE"
        echo "$title" >> "$LOG_FILE"
        echo "========================================" >> "$LOG_FILE"
    else
        # --- SIMPLE STYLE (For Individual Tests) ---
        # Terminal
        echo -e "${BLUE}+ $title${NC}"
        
        # Log File
        echo "+ $title" >> "$LOG_FILE"
    fi
}


print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    echo "[TEST] $1" >> "$LOG_FILE"
}

print_pass() {
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
    echo -e "${GREEN}[PASS]${NC} $1"
    echo "[PASS] $1" >> "$LOG_FILE"
}

print_fail() {
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
    echo -e "${RED}[FAIL]${NC} $1"
    echo "[FAIL] $1" >> "$LOG_FILE"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[INFO] $1" >> "$LOG_FILE"
}

# ============================================================================
# ARGUMENT VALIDATION
# ============================================================================

if [ -z "$DIR_STRUCTURE" ]; then
    echo "Usage: $0 <MAX_FILES> <MAX_DIRS> <MAX_DEPTH> <DIR_STRUCTURE>"
    echo "These should match the parameters used with files_generator.sh"
    exit 1
fi

print_header "CS 140 File Generator Tester"
echo "Testing with parameters:"
echo "  MAX_FILES:      $MAX_FILES"
echo "  MAX_DIRS:       $MAX_DIRS"
echo "  MAX_DEPTH:      $MAX_DEPTH"
echo "  DIR_STRUCTURE:  $DIR_STRUCTURE"

# Log parameters
echo "Testing with parameters:" >> "$LOG_FILE"
echo "  MAX_FILES:      $MAX_FILES" >> "$LOG_FILE"
echo "  MAX_DIRS:       $MAX_DIRS" >> "$LOG_FILE"
echo "  MAX_DEPTH:      $MAX_DEPTH" >> "$LOG_FILE"
echo "  DIR_STRUCTURE:  $DIR_STRUCTURE" >> "$LOG_FILE"

# ============================================================================
# LOG GENERATED FILE STRUCTURE AND CONTENTS
# ============================================================================

print_header "Generated Files Structure and Contents"

if [ -d "files" ]; then
    print_info "Logging directory structure..."
    echo "" >> "$LOG_FILE"
    echo "Directory Tree:" >> "$LOG_FILE"
    echo "---------------" >> "$LOG_FILE"
    tree files >> "$LOG_FILE" 2>/dev/null || ls -R files >> "$LOG_FILE"
    
    print_info "Logging file contents..."
    echo "" >> "$LOG_FILE"
    echo "File Contents:" >> "$LOG_FILE"
    echo "--------------" >> "$LOG_FILE"
    
    # Find all files and log their contents
    FILES_LIST=($(find files -type f | sort))
    
    for file in "${FILES_LIST[@]}"; do
        echo "" >> "$LOG_FILE"
        echo "$file = [" >> "$LOG_FILE"
        
        # Read file contents line by line
        if [ -s "$file" ]; then
            while IFS= read -r line; do
                echo "  $line" >> "$LOG_FILE"
            done < "$file"
        else
            echo "  (empty)" >> "$LOG_FILE"
        fi
        
        echo "]" >> "$LOG_FILE"
    done
    
    print_pass "File structure and contents logged"
else
    print_fail "Directory ./files/ does not exist - cannot log contents"
fi

# ============================================================================
# TEST 1: DIRECTORY EXISTS
# ============================================================================

print_header "Test 1: Directory Existence"

print_test "Checking if ./files/ directory exists"
if [ -d "files" ]; then
    print_pass "Directory ./files/ exists"
else
    print_fail "Directory ./files/ does not exist"
    echo "Cannot continue testing without files directory"
    exit 1
fi

# ============================================================================
# TEST 2: FILE NAMING CONVENTION
# ============================================================================

print_header "Test 2: File Naming Convention"

print_test "Checking file naming pattern: file_XXX.EXT"

# Find all files (not directories) recursively
FILES=($(find files -type f))

if [ ${#FILES[@]} -eq 0 ]; then
    print_fail "No files found in ./files/"
else
    print_info "Found ${#FILES[@]} files"
    
    NAMING_ERRORS=0
    for file in "${FILES[@]}"; do
        filename=$(basename "$file")
        
        # Check pattern: file_NNN.ext (3 digits, 3 letter extension)
        if [[ ! "$filename" =~ ^file_[0-9]{3}\.[a-z]{3}$ ]]; then
            print_fail "Invalid filename: $filename"
            ((NAMING_ERRORS++))
        fi
    done
    
    if [ $NAMING_ERRORS -eq 0 ]; then
        print_pass "All files follow naming convention file_XXX.EXT"
    else
        print_fail "$NAMING_ERRORS files have incorrect naming"
    fi
fi

# ============================================================================
# TEST 3: FILE UNIQUENESS
# ============================================================================

print_header "Test 3: File Uniqueness"

print_test "Checking that all file numbers are unique"

# Extract all file numbers
FILE_NUMBERS=()
for file in "${FILES[@]}"; do
    filename=$(basename "$file")
    # Extract the XXX part from file_XXX.ext
    if [[ "$filename" =~ file_([0-9]{3}) ]]; then
        FILE_NUMBERS+=("${BASH_REMATCH[1]}")
    fi
done

# Check for duplicates
UNIQUE_NUMBERS=($(printf '%s\n' "${FILE_NUMBERS[@]}" | sort -u))

if [ ${#FILE_NUMBERS[@]} -eq ${#UNIQUE_NUMBERS[@]} ]; then
    print_pass "All ${#FILE_NUMBERS[@]} file numbers are unique"
else
    DUPLICATES=$((${#FILE_NUMBERS[@]} - ${#UNIQUE_NUMBERS[@]}))
    print_fail "Found $DUPLICATES duplicate file numbers"
fi

# ============================================================================
# TEST 4: DIRECTORY NAMING CONVENTION
# ============================================================================

print_header "Test 4: Directory Naming Convention"

print_test "Checking directory naming pattern: dir_XXX"

# Find all directories (excluding root 'files' directory)
DIRS=($(find files -mindepth 1 -type d))

if [ ${#DIRS[@]} -eq 0 ]; then
    print_info "No subdirectories found (valid for shallow structures)"
else
    print_info "Found ${#DIRS[@]} subdirectories"
    
    DIR_NAMING_ERRORS=0
    for dir in "${DIRS[@]}"; do
        dirname=$(basename "$dir")
        
        # Check pattern: dir_NNN (3 digits)
        if [[ ! "$dirname" =~ ^dir_[0-9]{3}$ ]]; then
            print_fail "Invalid directory name: $dirname"
            ((DIR_NAMING_ERRORS++))
        fi
    done
    
    if [ $DIR_NAMING_ERRORS -eq 0 ]; then
        print_pass "All directories follow naming convention dir_XXX"
    else
        print_fail "$DIR_NAMING_ERRORS directories have incorrect naming"
    fi
fi

# ============================================================================
# TEST 5: DIRECTORY UNIQUENESS
# ============================================================================

print_header "Test 5: Directory Uniqueness"

print_test "Checking that all directory numbers are unique"

DIR_NUMBERS=()
for dir in "${DIRS[@]}"; do
    dirname=$(basename "$dir")
    if [[ "$dirname" =~ dir_([0-9]{3}) ]]; then
        DIR_NUMBERS+=("${BASH_REMATCH[1]}")
    fi
done

if [ ${#DIR_NUMBERS[@]} -gt 0 ]; then
    UNIQUE_DIR_NUMBERS=($(printf '%s\n' "${DIR_NUMBERS[@]}" | sort -u))
    
    if [ ${#DIR_NUMBERS[@]} -eq ${#UNIQUE_DIR_NUMBERS[@]} ]; then
        print_pass "All ${#DIR_NUMBERS[@]} directory numbers are unique"
    else
        DUPLICATES=$((${#DIR_NUMBERS[@]} - ${#UNIQUE_DIR_NUMBERS[@]}))
        print_fail "Found $DUPLICATES duplicate directory numbers"
    fi
else
    print_info "No subdirectories to check for uniqueness"
fi

# ============================================================================
# TEST 6: MAXIMUM DEPTH CONSTRAINT
# ============================================================================

print_header "Test 6: Maximum Depth Constraint"

print_test "Checking that directory depth does not exceed MAX_DEPTH=$MAX_DEPTH"

MAX_FOUND_DEPTH=0
DEPTH_VIOLATIONS=0

for dir in "${DIRS[@]}"; do
    # Count depth by number of slashes after 'files/'
    # Remove 'files/' prefix and count remaining slashes + 1
    relative_path=${dir#files/}
    depth=$(echo "$relative_path" | tr -cd '/' | wc -c)
    depth=$((depth + 1))
    
    if [ $depth -gt $MAX_FOUND_DEPTH ]; then
        MAX_FOUND_DEPTH=$depth
    fi
    
    if [ $depth -gt $MAX_DEPTH ]; then
        print_fail "Directory exceeds MAX_DEPTH: $dir (depth=$depth)"
        ((DEPTH_VIOLATIONS++))
    fi
done

if [ $DEPTH_VIOLATIONS -eq 0 ]; then
    print_pass "All directories respect MAX_DEPTH=$MAX_DEPTH (max found: $MAX_FOUND_DEPTH)"
else
    print_fail "$DEPTH_VIOLATIONS directories exceed MAX_DEPTH"
fi

# ============================================================================
# TEST 7: FILES PER DIRECTORY CONSTRAINT
# ============================================================================

print_header "Test 7: Files Per Directory Constraint"

print_test "Checking that each directory has 1-$MAX_FILES files"

# Check files directory and all subdirectories
ALL_DIRS=("files" "${DIRS[@]}")
FILES_PER_DIR_VIOLATIONS=0

for dir in "${ALL_DIRS[@]}"; do
    # Count files directly in this directory (not recursive)
    file_count=$(find "$dir" -maxdepth 1 -type f | wc -l)
    
    if [ $file_count -lt 1 ]; then
        print_fail "Directory has no files: $dir"
        ((FILES_PER_DIR_VIOLATIONS++))
    elif [ $file_count -gt $MAX_FILES ]; then
        print_fail "Directory has too many files: $dir ($file_count > $MAX_FILES)"
        ((FILES_PER_DIR_VIOLATIONS++))
    fi
done

if [ $FILES_PER_DIR_VIOLATIONS -eq 0 ]; then
    print_pass "All directories have valid file counts (1-$MAX_FILES)"
else
    print_fail "$FILES_PER_DIR_VIOLATIONS directories violate file count constraints"
fi

# ============================================================================
# TEST 8: SUBDIRECTORIES PER DIRECTORY CONSTRAINT
# ============================================================================

print_header "Test 8: Subdirectories Per Directory Constraint"

print_test "Checking that each directory has 0-$MAX_DIRS subdirectories"

SUBDIR_VIOLATIONS=0

for dir in "${ALL_DIRS[@]}"; do
    # Count subdirectories directly in this directory
    subdir_count=$(find "$dir" -maxdepth 1 -type d ! -path "$dir" | wc -l)
    
    if [ $subdir_count -gt $MAX_DIRS ]; then
        print_fail "Directory has too many subdirectories: $dir ($subdir_count > $MAX_DIRS)"
        ((SUBDIR_VIOLATIONS++))
    fi
done

if [ $SUBDIR_VIOLATIONS -eq 0 ]; then
    print_pass "All directories have valid subdirectory counts (0-$MAX_DIRS)"
else
    print_fail "$SUBDIR_VIOLATIONS directories violate subdirectory constraints"
fi

# ============================================================================
# TEST 9: LINK STRUCTURE VALIDATION
# ============================================================================

print_header "Test 9: Link Structure Validation"

print_test "Validating link structure for type: $DIR_STRUCTURE"

# Build list of all filenames for validation
declare -A ALL_FILENAMES
for file in "${FILES[@]}"; do
    filename=$(basename "$file")
    ALL_FILENAMES["$filename"]=1
done

# Validate links based on structure type
case "$DIR_STRUCTURE" in

    # ================================== CONNECTED ==================================
    "connected")
        print_info "Checking CONNECTED structure: each file should have at least 1 outlink"
        
        FILES_WITHOUT_OUTLINKS=0
        FILES_WITH_INVALID_LINKS=0
        
        for file in "${FILES[@]}"; do
            # Count non-empty lines (outlinks)
            outlink_count=$(grep -c '[^[:space:]]' "$file" 2>/dev/null || echo "0")
            
            if [ "$outlink_count" -eq 0 ]; then
                print_fail "File has no outlinks: $(basename "$file")"
                ((FILES_WITHOUT_OUTLINKS++))
            fi
            
            # Check that all mentioned files exist
            while IFS= read -r linked_file; do
                # Skip empty lines
                [ -z "$linked_file" ] && continue
                
                if [ -z "${ALL_FILENAMES[$linked_file]}" ]; then
                    print_fail "File $(basename "$file") links to non-existent file: $linked_file"
                    ((FILES_WITH_INVALID_LINKS++))
                fi
            done < "$file"
        done
        
        if [ $FILES_WITHOUT_OUTLINKS -eq 0 ]; then
            print_pass "All files have at least 1 outlink"
        else
            print_fail "$FILES_WITHOUT_OUTLINKS files have no outlinks"
        fi
        
        if [ $FILES_WITH_INVALID_LINKS -eq 0 ]; then
            print_pass "All links reference existing files"
        else
            print_fail "$FILES_WITH_INVALID_LINKS files have invalid links"
        fi
        ;;

    # ================================== FOREST ==================================
    "forest")
        print_info "Checking FOREST structure: files only link within same directory"
        
        CROSS_DIR_LINKS=0
        
        for file in "${FILES[@]}"; do
            file_dir=$(dirname "$file")
            
            while IFS= read -r linked_file; do
                [ -z "$linked_file" ] && continue
                
                # Find the full path of the linked file
                linked_path=$(find files -type f -name "$linked_file" 2>/dev/null | head -1)
                
                if [ -n "$linked_path" ]; then
                    linked_dir=$(dirname "$linked_path")
                    
                    if [ "$file_dir" != "$linked_dir" ]; then
                        print_fail "Cross-directory link: $(basename "$file") -> $linked_file"
                        ((CROSS_DIR_LINKS++))
                    fi
                fi
            done < "$file"
        done
        
        if [ $CROSS_DIR_LINKS -eq 0 ]; then
            print_pass "All links are within same directory (forest structure)"
        else
            print_fail "$CROSS_DIR_LINKS cross-directory links found"
        fi
        ;;

    # ================================== FULL ==================================
    "full")
        print_info "Checking FULL structure: each file should link to all other files"
        
        EXPECTED_LINKS=$((${#FILES[@]} - 1))
        FULL_VIOLATIONS=0
        
        for file in "${FILES[@]}"; do
            outlink_count=$(grep -c '[^[:space:]]' "$file" 2>/dev/null || echo "0")
            
            if [ "$outlink_count" -ne $EXPECTED_LINKS ]; then
                print_fail "File has $outlink_count links, expected $EXPECTED_LINKS: $(basename "$file")"
                ((FULL_VIOLATIONS++))
            fi
        done
        
        if [ $FULL_VIOLATIONS -eq 0 ]; then
            print_pass "All files link to all other files (full structure)"
        else
            print_fail "$FULL_VIOLATIONS files don't have complete linkage"
        fi
        ;;
    

    # ================================== RANDOM ==================================
    "random")
        print_info "Checking RANDOM structure: validating link integrity"
        
        INVALID_LINKS=0
        
        for file in "${FILES[@]}"; do
            while IFS= read -r linked_file; do
                [ -z "$linked_file" ] && continue
                
                if [ -z "${ALL_FILENAMES[$linked_file]}" ]; then
                    print_fail "File $(basename "$file") links to non-existent file: $linked_file"
                    ((INVALID_LINKS++))
                fi
            done < "$file"
        done
        
        if [ $INVALID_LINKS -eq 0 ]; then
            print_pass "All links reference existing files (random structure)"
        else
            print_fail "$INVALID_LINKS invalid links found"
        fi
        ;;
    
    *)
        print_fail "Unknown structure type: $DIR_STRUCTURE"
        ;;
esac

# ============================================================================
# TEST 10: NO SELF-LINKS
# ============================================================================

print_header "Test 10: Self-Link Check"

print_test "Checking that no file links to itself"

SELF_LINKS=0

for file in "${FILES[@]}"; do
    filename=$(basename "$file")
    
    # Check if file contains its own name
    if grep -q "^$filename$" "$file" 2>/dev/null; then
        print_fail "File links to itself: $filename"
        ((SELF_LINKS++))
    fi
done

if [ $SELF_LINKS -eq 0 ]; then
    print_pass "No self-links found"
else
    print_fail "$SELF_LINKS files link to themselves"
fi

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print_header "Test Summary"

echo "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

# Log summary
echo "Total Tests: $TESTS_TOTAL" >> "$LOG_FILE"
echo "Passed: $TESTS_PASSED" >> "$LOG_FILE"
echo "Failed: $TESTS_FAILED" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    echo "========================================" >> "$LOG_FILE"
    echo "ALL TESTS PASSED!" >> "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
    
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}SOME TESTS FAILED!${NC}"
    echo -e "${RED}========================================${NC}"
    
    echo "========================================" >> "$LOG_FILE"
    echo "SOME TESTS FAILED!" >> "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
    
    exit 1
fi