import os
import sys
import collections

def parse_links_string(link_str):
    """
    Parses string like "[file1.txt,file2.txt]" into a set of strings.
    Handles empty brackets "[]" correctly.
    """
    content = link_str.strip()[1:-1] # Remove [ and ]
    if not content:
        return set()
    return set(x.strip() for x in content.split(','))

def get_ground_truth(files_root):
    """
    Walks the ./files directory to build the expected graph.
    Returns: dict { filename: { 'in': set(), 'out': set(), 'path': str } }
    """
    truth = collections.defaultdict(lambda: {'in': set(), 'out': set(), 'path': ''})
    
    # 1. Walk directory to find all files and their outlinks (contents)
    for root, _, files in os.walk(files_root):
        for filename in files:
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, start=".") # relative to current dir
            
            truth[filename]['path'] = rel_path
            
            try:
                with open(filepath, 'r') as f:
                    for line in f:
                        target = line.strip()
                        if not target: continue
                        
                        # Spec: exclude self-links
                        if target == filename: continue
                        
                        # Record Outlink: source -> target
                        truth[filename]['out'].add(target)
                        
                        # Record Inlink: target <- source
                        truth[target]['in'].add(filename)
                        
            except Exception as e:
                print(f"Error reading ground truth file {filepath}: {e}")
                sys.exit(1)
                
    return truth

def verify_output(output_file, truth):
    """
    Parses the output file from multithreaded.c and compares with truth.
    Format: path|name|[in1,in2]|[out1,out2]
    """
    try:
        with open(output_file, 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Output file not found: {output_file}")
        return False

    # Check 1: File Count
    # Truth might contain unlinked files, but output should contain ALL files found
    if len(lines) != len(truth):
        print(f"FAIL: Count mismatch. Ground truth has {len(truth)} files, output has {len(lines)}")
        return False

    errors = 0
    
    for line in lines:
        parts = line.strip().split('|')
        if len(parts) != 4:
            print(f"FAIL: Malformed line format: {line.strip()}")
            errors += 1
            continue
            
        path, name, in_str, out_str = parts
        
        # Parse sets
        actual_in = parse_links_string(in_str)
        actual_out = parse_links_string(out_str)
        
        if name not in truth:
            print(f"FAIL: Unknown file in output: {name}")
            errors += 1
            continue
            
        expected = truth[name]
        
        # Check Inlinks
        if actual_in != expected['in']:
            print(f"FAIL: Inlink mismatch for {name}")
            print(f"   Expected: {sorted(list(expected['in']))}")
            print(f"   Got:      {sorted(list(actual_in))}")
            errors += 1
            
        # Check Outlinks
        if actual_out != expected['out']:
            print(f"FAIL: Outlink mismatch for {name}")
            print(f"   Expected: {sorted(list(expected['out']))}")
            print(f"   Got:      {sorted(list(actual_out))}")
            errors += 1

    if errors == 0:
        print(f"SUCCESS: Verified {len(lines)} files. All links match.")
        return True
    else:
        print(f"FAILED: Found {errors} errors.")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 part_1_sanityhelper_verifylinks.py <output_file>")
        sys.exit(1)
        
    output_path = sys.argv[1]
    # Assume files directory is in current working directory
    ground_truth = get_ground_truth("files") 
    
    success = verify_output(output_path, ground_truth)
    sys.exit(0 if success else 1)