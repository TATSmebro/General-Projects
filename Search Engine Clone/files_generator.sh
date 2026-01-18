#!/bin/bash

# ============================================================================
# CS 140 Project 2 - File Generator
# ============================================================================
# REFERENCE: Section 4.1.1 (pages 21-22)
#
# PURPOSE: Generate test directory structures with configurable parameters
#          to test the multithreaded grep runner and PageRank calculator
#
# USAGE: ./files_generator.sh <MAX_FILES> <MAX_DIRS> <MAX_DEPTH> <DIR_STRUCTURE>
#
# ARGUMENTS:
#   MAX_FILES:      Maximum number of files per directory (1-10)
#   MAX_DIRS:       Maximum number of subdirectories per directory (1-10)
#   MAX_DEPTH:      Maximum depth of directory tree (1-10)
#   DIR_STRUCTURE:  Type of link structure (forest, connected, full, random)
#
# REQUIREMENTS:
#   - Files named: file_XXX.EXT (XXX = sequential number, EXT = random 3-letter)
#   - Directories named: dir_XXX (XXX = sequential number)
#   - Link patterns depend on DIR_STRUCTURE type
# ============================================================================

# Parse command-line arguments
MAX_FILES=$1
MAX_DIRS=$2
MAX_DEPTH=$3
DIR_STRUCTURE=$4

# ============================================================================
# ARGUMENT VALIDATION
# ============================================================================
# PATH_MAX "This program should take in the following arguments"

if [ -z "$DIR_STRUCTURE" ]; then
    echo "Usage: $0 <MAX_FILES> <MAX_DIRS> <MAX_DEPTH> <DIR_STRUCTURE>"
    echo ""
    echo "Arguments:"
    echo "  MAX_FILES:      1-10 (max files per directory)"
    echo "  MAX_DIRS:       1-10 (max subdirectories per directory)"
    echo "  MAX_DEPTH:      1-10 (max depth of directory tree)"
    echo "  DIR_STRUCTURE:  forest, connected, full, random"
    echo ""
    echo "Structure types:"
    echo "  forest:    Files only link within same subdirectory"
    echo "  connected: Each file connected to at least one other"
    echo "  full:      Every file mentions every other file"
    echo "  random:    Random connections, may have dangling nodes"
    exit 1
fi

# Display generation parameters
echo "=== CS 140 File Generator ==="
echo "Generating directory structure: $DIR_STRUCTURE"
echo "Parameters: MAX_FILES=$MAX_FILES, MAX_DIRS=$MAX_DIRS, MAX_DEPTH=$MAX_DEPTH"
echo ""

# ============================================================================
# INITIALIZATION
# ============================================================================

# PATH_MAX "Create the files directory, if it does not yet exist"
# Clean up old files directory for fresh start
rm -rf files
mkdir -p files

# Global counters for unique naming
FILE_COUNTER=0  # PATH_MAX "Each file must uniquely be named file_XXX.EXT"
DIR_COUNTER=0   # PATH_MAX "Each subdirectory must uniquely be named dir_XXX"

# Arrays to store all created files for linking phase
declare -a ALL_FILES        # - ALL_FILES: Full paths (e.g., "files/dir_000/file_001.abc")
declare -a ALL_FILE_NAMES   # - ALL_FILE_NAMES: Just filenames (e.g., "file_001.abc")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

# ----------------------------------------------------------------------------
# generate_extension: Generate random 3-letter file extension
# ----------------------------------------------------------------------------
generate_extension() {
    head /dev/urandom | tr -dc 'a-z' | head -c 3
}

# ----------------------------------------------------------------------------
# create_files_in_dir: Create specified number of files in a directory
# ----------------------------------------------------------------------------
create_files_in_dir() {
    local dir_path=$1
    local num_files=$2
    
    # Create each file with unique name
    for ((file_idx=0; file_idx<num_files; file_idx++)); do
        # Generate random 3-letter extension
        local ext=$(generate_extension)
        
        # PATH_MAX "file_XXX.EXT where XXX is a number from 0 to total files"
        # Use printf to zero-pad to 3 digits (e.g., file_001.abc)
        local filename="file_$(printf '%03d' $FILE_COUNTER).$ext"
        local filepath="$dir_path/$filename"
        
        # Create empty file (content added in linking phase)
        touch "$filepath"
        
        # Store for later linking phase
        ALL_FILES+=("$filepath")          # Full path
        ALL_FILE_NAMES+=("$filename")     # Just filename
        
        # Increment global counter for next file
        ((FILE_COUNTER++))
    done
}

# ----------------------------------------------------------------------------
# create_structure: Recursively create directory tree with files
# ----------------------------------------------------------------------------
create_structure() {
    local current_path=$1
    local current_depth=$2
    local dir_idx
    local dirname
    local dirpath
    
    # Create exactly MAX_FILES files in current directory
    create_files_in_dir "$current_path" $MAX_FILES
    
    # Create subdirectories if not at max depth
    if [ $current_depth -lt $MAX_DEPTH ]; then
        # Create exactly MAX_DIRS subdirectories
        for ((dir_idx=0; dir_idx<MAX_DIRS; dir_idx++)); do
            dirname="dir_$(printf '%03d' $DIR_COUNTER)"
            dirpath="$current_path/$dirname"
            
            mkdir -p "$dirpath"
            ((DIR_COUNTER++))
            
            # Recurse into subdirectory (increment depth)
            create_structure "$dirpath" $((current_depth + 1))
        done
    fi
}
# ============================================================================
# PHASE 1: CREATE DIRECTORY STRUCTURE
# ============================================================================
echo "Phase 1: Creating directory structure..."
create_structure "files" 1

# Verify at least some files were created
if [ ${#ALL_FILES[@]} -eq 0 ]; then
    echo "Warning: No files created. Creating minimum set..."
    create_files_in_dir "files" 3
fi

echo "[SUCCESS] Created ${#ALL_FILES[@]} files in $DIR_COUNTER directories"
echo ""

# ============================================================================
# PHASE 2: ADD LINKS BASED ON DIR_STRUCTURE
# ============================================================================
echo "Phase 2: Adding links based on structure: $DIR_STRUCTURE"
case "$DIR_STRUCTURE" in
    # ------------------------------------------------------------------------
    # CONNECTED STRUCTURE
    # ------------------------------------------------------------------------
    # PATH_MAX "Each file contained within the files directory must be connected
    #        to at least one other file via an inlink/outlink"
    #
    # IMPLEMENTATION:
    #   1. Create circular reference: file_i mentions file_(i+1)
    #   2. This ensures every file has at least 1 inlink and 1 outlink
    #   3. Optionally add extra random links for variety
    # ------------------------------------------------------------------------
    "connected")
        for ((i=0; i<${#ALL_FILES[@]}; i++)); do
            current_file="${ALL_FILES[$i]}"
            
            # Create circular link to next file (wraps to 0 at end)
            next_idx=$(((i + 1) % ${#ALL_FILES[@]}))
            next_filename="${ALL_FILE_NAMES[$next_idx]}"
            
            # Write filename to file (this creates the link)
            echo "$next_filename" >> "$current_file"
            
            # OPTIONAL: Add one more random link for variety
            # 50% chance to add extra link
            if [ $((RANDOM % 2)) -eq 0 ] && [ ${#ALL_FILES[@]} -gt 2 ]; then
                random_idx=$((RANDOM % ${#ALL_FILES[@]}))
                # Don't link to self or next (already linked)
                if [ $random_idx -ne $i ] && [ $random_idx -ne $next_idx ]; then
                    echo "${ALL_FILE_NAMES[$random_idx]}" >> "$current_file"
                fi
            fi
        done
        
        echo "[SUCCESS] Connected: Each file linked in circular pattern"
        ;;
    
    # ------------------------------------------------------------------------
    # FOREST STRUCTURE
    # ------------------------------------------------------------------------
    # PATH_MAX "Only files contained within the same subdirectory can mention
    #        each other"
    #
    # IMPLEMENTATION:
    #   1. Group files by their parent directory
    #   2. Within each group, create links only among that group
    #   3. No cross-directory links allowed
    #
    # RESULT: Multiple isolated "islands" of connected files
    # ------------------------------------------------------------------------
    "forest")
        # Group files by directory
        declare -A dir_files  # Associative array: directory -> file indices
        
        for ((i=0; i<${#ALL_FILES[@]}; i++)); do
            filepath="${ALL_FILES[$i]}"
            dirpath=$(dirname "$filepath")
            
            # Add this file index to the directory's list
            if [ -z "${dir_files[$dirpath]}" ]; then
                dir_files[$dirpath]="$i"
            else
                dir_files[$dirpath]="${dir_files[$dirpath]} $i"
            fi
        done
        
        # Link files within same directory only
        for dirpath in "${!dir_files[@]}"; do
            # Convert space-separated indices to array
            indices=(${dir_files[$dirpath]})
            
            # Create circular links within this directory
            for ((j=0; j<${#indices[@]}; j++)); do
                idx=${indices[$j]}
                next_j=$(((j + 1) % ${#indices[@]}))
                next_idx=${indices[$next_j]}
                
                # Only link if there's more than 1 file in directory
                if [ $idx -ne $next_idx ]; then
                    echo "${ALL_FILE_NAMES[$next_idx]}" >> "${ALL_FILES[$idx]}"
                fi
            done
        done
        
        echo "[SUCCESS] Forest: Files only link within same directory"
        ;;
    
    # ------------------------------------------------------------------------
    # FULL STRUCTURE
    # ------------------------------------------------------------------------
    # PATH_MAX "Each file contained within the files directory must be connected
    #        to all other files"
    #
    # IMPLEMENTATION:
    #   Every file mentions every other file (except itself)
    #
    # RESULT: Complete graph - maximum connectivity
    # WARNING: Creates many links! (N files = N*(N-1) total links)
    # ------------------------------------------------------------------------
    "full")
        for ((i=0; i<${#ALL_FILES[@]}; i++)); do
            current_file="${ALL_FILES[$i]}"
            
            # Mention every other file
            for ((j=0; j<${#ALL_FILES[@]}; j++)); do
                # Don't mention self
                if [ $i -ne $j ]; then
                    echo "${ALL_FILE_NAMES[$j]}" >> "$current_file"
                fi
            done
        done
        
        echo "[SUCCESS] Full: Every file mentions every other file"
        ;;
    
    # ------------------------------------------------------------------------
    # RANDOM STRUCTURE
    # ------------------------------------------------------------------------
    # PATH_MAX "Each file can be connected to a random number of files within
    #        the files directory. A file may also not be connected to any
    #        other file."
    #
    # IMPLEMENTATION:
    #   For each file, randomly decide how many links to create (0 to N-1)
    #
    # RESULT: Unpredictable graph - may have dangling nodes (PageRank test!)
    # ------------------------------------------------------------------------
    "random")
        for ((i=0; i<${#ALL_FILES[@]}; i++)); do
            current_file="${ALL_FILES[$i]}"
            
            # Random number of outlinks (0 to all other files)
            num_links=$((RANDOM % ${#ALL_FILES[@]}))
            
            # Create random links
            for ((k=0; k<num_links; k++)); do
                random_idx=$((RANDOM % ${#ALL_FILES[@]}))
                # Don't link to self
                if [ $random_idx -ne $i ]; then
                    echo "${ALL_FILE_NAMES[$random_idx]}" >> "$current_file"
                fi
            done
        done
        
        echo "[SUCCESS] Random: Random connections (may have dangling nodes)"
        ;;
    
    *)
        echo "Error: Unknown structure '$DIR_STRUCTURE'"
        echo "Valid options: forest, connected, full, random"
        exit 1
        ;;
esac

# ============================================================================
# SUMMARY AND VERIFICATION
# ============================================================================

echo ""
echo "=== Generation Complete ==="
echo "Output directory: ./files/"
echo "Total files: ${#ALL_FILES[@]}"
echo "Total directories: $((DIR_COUNTER + 1))"  # +1 for root 'files' dir
echo ""

# Display directory structure
echo "Directory structure:"
ls -R files/

echo ""
echo "Sample file contents:"
if [ ${#ALL_FILES[@]} -gt 0 ]; then
    echo "--- ${ALL_FILE_NAMES[0]} ---"
    cat "${ALL_FILES[0]}"
fi
