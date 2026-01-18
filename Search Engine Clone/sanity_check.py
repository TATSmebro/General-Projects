import os
import sys
import subprocess
import collections
import struct
import shutil
from pathlib import Path
import time

# ANSI color codes
class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    CYAN = '\033[0;36m'
    MAGENTA = '\033[0;35m'
    NC = '\033[0m'  # No Color

class TestStats:
    def __init__(self):
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.skipped = 0
    
    def add_pass(self):
        self.total += 1
        self.passed += 1
    
    def add_fail(self):
        self.total += 1
        self.failed += 1
    
    def add_skip(self):
        self.total += 1
        self.skipped += 1

stats = TestStats()

def print_header(text):
    print(f"\n{Colors.CYAN}{'='*60}{Colors.NC}")
    print(f"{Colors.CYAN}{text}{Colors.NC}")
    print(f"{Colors.CYAN}{'='*60}{Colors.NC}")

def print_test(test_name):
    print(f"\n{Colors.MAGENTA}[TEST] {test_name}{Colors.NC}")

def print_pass(msg="PASS"):
    print(f"{Colors.GREEN}[✓] {msg}{Colors.NC}")
    stats.add_pass()

def print_fail(msg="FAIL"):
    print(f"{Colors.RED}[✗] {msg}{Colors.NC}")
    stats.add_fail()

def print_skip(msg="SKIP"):
    print(f"{Colors.YELLOW}[⊘] {msg}{Colors.NC}")
    stats.add_skip()

def print_warn(msg):
    print(f"{Colors.YELLOW}[⚠] {msg}{Colors.NC}")

def run_command(cmd, timeout=30, check=True):
    """Run a shell command and return (returncode, stdout, stderr)"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        if check and result.returncode != 0:
            return (result.returncode, result.stdout, result.stderr)
        return (result.returncode, result.stdout, result.stderr)
    except subprocess.TimeoutExpired:
        return (124, "", "Timeout")
    except Exception as e:
        return (-1, "", str(e))

# ============================================================================
# PART 1: MULTITHREADED.C TESTS
# ============================================================================

def parse_links_string(link_str):
    """Parse string like '[file1.txt,file2.txt]' into a set."""
    content = link_str.strip()[1:-1]  # Remove [ and ]
    if not content:
        return set()
    return set(x.strip() for x in content.split(','))

def get_ground_truth(files_root):
    """Build expected graph from ./files directory."""
    truth = collections.defaultdict(lambda: {'in': set(), 'out': set(), 'path': ''})
    
    for root, _, files in os.walk(files_root):
        for filename in files:
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, start=".")
            
            truth[filename]['path'] = rel_path
            
            try:
                with open(filepath, 'r') as f:
                    for line in f:
                        target = line.strip()
                        if not target:
                            continue
                        if target == filename:  # Exclude self-links
                            continue
                        
                        truth[filename]['out'].add(target)
                        truth[target]['in'].add(filename)
            except Exception as e:
                print_fail(f"Error reading ground truth file {filepath}: {e}")
                return None
    
    return truth

def verify_multithreaded_output(output_file, truth):
    """Verify multithreaded.c output against ground truth."""
    try:
        with open(output_file, 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print_fail(f"Output file not found: {output_file}")
        return False
    
    if len(lines) != len(truth):
        print_fail(f"Count mismatch. Expected {len(truth)} files, got {len(lines)}")
        return False
    
    errors = 0
    for line in lines:
        parts = line.strip().split('|')
        if len(parts) != 4:
            print_fail(f"Malformed line: {line.strip()}")
            errors += 1
            continue
        
        path, name, in_str, out_str = parts
        actual_in = parse_links_string(in_str)
        actual_out = parse_links_string(out_str)
        
        if name not in truth:
            print_fail(f"Unknown file in output: {name}")
            errors += 1
            continue
        
        expected = truth[name]
        
        if actual_in != expected['in']:
            print_fail(f"Inlink mismatch for {name}")
            print(f"   Expected: {sorted(list(expected['in']))}")
            print(f"   Got:      {sorted(list(actual_in))}")
            errors += 1
        
        if actual_out != expected['out']:
            print_fail(f"Outlink mismatch for {name}")
            print(f"   Expected: {sorted(list(expected['out']))}")
            print(f"   Got:      {sorted(list(actual_out))}")
            errors += 1
    
    return errors == 0

def test_part1_compilation():
    """Test compilation of multithreaded.c"""
    print_test("Part 1: Compile multithreaded.c")
    
    ret, stdout, stderr = run_command(
        "gcc -o multithreaded multithreaded.c -pthread -Wall",
        check=False
    )
    
    if ret != 0:
        print_fail(f"Compilation failed")
        print(stderr)
        return False
    
    if stderr:
        print_warn(f"Compilation warnings detected")
        print(stderr)
    
    print_pass("Compilation successful")
    return True

def test_part1_functional():
    """Test multithreaded.c functional correctness"""
    print_header("PART 1: MULTITHREADED.C FUNCTIONAL TESTS")
    
    if not os.path.exists("multithreaded"):
        print_skip("multithreaded binary not found. Compile first.")
        return
    
    structures = ["connected", "forest", "full", "random"]
    thread_counts = [1, 2, 4, 8]
    
    # Save existing part-1-outputs if it exists
    backup_dir = None
    if os.path.exists("part-1-outputs"):
        backup_dir = f"part-1-outputs.backup.{int(time.time())}"
        os.rename("part-1-outputs", backup_dir)
        print(f"Backed up existing part-1-outputs to {backup_dir}")
    
    os.makedirs("part-1-outputs", exist_ok=True)
    
    for structure in structures:
        print(f"\n{Colors.CYAN}Testing structure: {structure}{Colors.NC}")
        
        # Generate test files
        ret, _, _ = run_command(
            f"./files_generator.sh 5 2 2 {structure} > /dev/null 2>&1",
            check=False
        )
        
        if ret != 0:
            print_fail(f"File generator failed for {structure}")
            continue
        
        # Get ground truth
        truth = get_ground_truth("files")
        if truth is None:
            print_fail(f"Failed to build ground truth for {structure}")
            continue
        
        for threads in thread_counts:
            print_test(f"{structure} with {threads} threads")
            
            output_file = f"part-1-outputs/{structure}_{threads}_file_links.txt"
            
            ret, stdout, stderr = run_command(
                f"./multithreaded {threads} {structure}",
                timeout=30,
                check=False
            )
            
            if ret == 124:
                print_fail(f"Program timed out (30s)")
                continue
            elif ret != 0:
                print_fail(f"Program crashed (exit code: {ret})")
                if stderr:
                    print(f"Error: {stderr}")
                continue
            
            if not os.path.exists(output_file):
                print_fail(f"Output file not created: {output_file}")
                continue
            
            # Verify output
            if verify_multithreaded_output(output_file, truth):
                print_pass(f"Verified {structure} with {threads} threads")
            else:
                print_fail(f"Verification failed for {structure} with {threads} threads")
    
    # Move test outputs to sanity-check-outputs and restore original
    if os.path.exists("part-1-outputs"):
        os.makedirs("sanity-check-outputs", exist_ok=True)
        for f in Path("part-1-outputs").glob("*"):
            shutil.move(str(f), f"sanity-check-outputs/{f.name}")
        os.rmdir("part-1-outputs")
    
    # Restore original part-1-outputs
    if backup_dir and os.path.exists(backup_dir):
        os.rename(backup_dir, "part-1-outputs")
        print(f"Restored original part-1-outputs")

def test_part1_formatting():
    """Test output formatting and logic constraints"""
    print_header("PART 1: FORMATTING & LOGIC CHECKS")
    
    output_files = list(Path("sanity-check-outputs").glob("*_file_links.txt"))
    
    if not output_files:
        print_skip("No output files found")
        return
    
    test_file = str(output_files[0])
    print(f"Analyzing: {test_file}")
    
    # Test 1: Format compliance
    print_test("Format compliance (path|name|[in]|[out])")
    try:
        with open(test_file, 'r') as f:
            lines = f.readlines()
        
        malformed = []
        import re
        pattern = r'^files/.*\|[^|]+\|\[.*\]\|\[.*\]$'
        
        for line in lines:
            if not re.match(pattern, line.strip()):
                malformed.append(line.strip())
        
        if not malformed:
            print_pass("All lines properly formatted")
        else:
            print_fail(f"Found {len(malformed)} malformed lines")
            for line in malformed[:3]:
                print(f"  {line}")
    except Exception as e:
        print_fail(f"Error checking format: {e}")
    
    # Test 2: Self-link exclusion
    print_test("Self-link exclusion")
    try:
        self_links = 0
        with open(test_file, 'r') as f:
            for line in f:
                parts = line.strip().split('|')
                if len(parts) == 4:
                    path, name, inlinks, outlinks = parts
                    if name in inlinks or name in outlinks:
                        self_links += 1
        
        if self_links == 0:
            print_pass("No self-links found")
        else:
            print_fail(f"Found {self_links} self-links")
    except Exception as e:
        print_fail(f"Error checking self-links: {e}")
    
    # Test 3: Empty list format
    print_test("Empty list format ([])")
    try:
        bad_empty = []
        with open(test_file, 'r') as f:
            for line in f:
                # Check for malformed empty lists like "[ ]"
                if '[ ]' in line or '[\t]' in line:
                    bad_empty.append(line.strip())
        
        if not bad_empty:
            print_pass("Empty lists properly formatted")
        else:
            print_fail(f"Found {len(bad_empty)} malformed empty lists")
    except Exception as e:
        print_fail(f"Error checking empty lists: {e}")

def test_part1_stress():
    """Stress test for race conditions and deadlocks"""
    print_header("PART 1: STRESS TEST")
    
    if not os.path.exists("multithreaded"):
        print_skip("multithreaded binary not found")
        return
    
    print_test("Running 20 iterations with 8 threads")
    
    # Backup part-1-outputs again if it exists (to prevent stress test from modifying it)
    backup_dir = None
    if os.path.exists("part-1-outputs"):
        backup_dir = f"part-1-outputs.stress.backup.{int(time.time())}"
        os.rename("part-1-outputs", backup_dir)
    
    os.makedirs("part-1-outputs", exist_ok=True)
    
    # Generate test files
    run_command("./files_generator.sh 5 3 3 connected > /dev/null 2>&1", check=False)
    
    for i in range(1, 21):
        print(f"  Iteration {i}/20...", end='\r')
        ret, _, _ = run_command(
            "./multithreaded 8 connected > /dev/null 2>&1",
            timeout=10,
            check=False
        )
        
        if ret != 0:
            print_fail(f"Crashed or timed out on iteration {i}")
            # Restore before returning on failure
            if os.path.exists("part-1-outputs"):
                shutil.rmtree("part-1-outputs")
            if backup_dir and os.path.exists(backup_dir):
                os.rename(backup_dir, "part-1-outputs")
            return
    
    print_pass("All 20 iterations completed successfully")
    
    # Clean up stress test outputs and restore original
    if os.path.exists("part-1-outputs"):
        shutil.rmtree("part-1-outputs")
    
    if backup_dir and os.path.exists(backup_dir):
        os.rename(backup_dir, "part-1-outputs")

# ============================================================================
# PART 2: CSR.C TESTS
# ============================================================================

def test_part2_csr_compilation():
    """Compile and run test_csr2.c"""
    print_header("PART 2: CSR TESTS")
    
    print_test("Compiling test_csr2.c")
    
    ret, stdout, stderr = run_command(
        "gcc -o test_csr2 test_csr2.c CSR.c -lm -Wall",
        check=False
    )
    
    if ret != 0:
        print_fail("CSR test compilation failed")
        print(stderr)
        return False
    
    print_pass("CSR test compiled successfully")
    return True

def test_part2_csr_execution():
    """Run CSR tests"""
    if not os.path.exists("test_csr2"):
        print_skip("test_csr2 binary not found")
        return
    
    print_test("Running CSR comprehensive tests")
    
    ret, stdout, stderr = run_command("./test_csr2", timeout=60, check=False)
    
    print(stdout)
    
    if ret == 0:
        print_pass("All CSR tests passed")
    else:
        print_fail("Some CSR tests failed")

def test_part2_csr_build():
    """Test CSR build from struct file"""
    print_test("CSR build from struct file")
    
    # First, ensure we have a test file from Part 1
    if not os.path.exists("sanity-check-outputs"):
        print_skip("No Part 1 outputs found. Run Part 1 tests first.")
        return
    
    output_files = list(Path("sanity-check-outputs").glob("*_file_links.txt"))
    if not output_files:
        print_skip("No Part 1 output files found")
        return
    
    test_struct_file = str(output_files[0])
    
    # Create a simple test program to verify CSR build
    test_code = """
#include <stdio.h>
#include "CSR.h"

int main() {
    int ret = csr_build_from_struct("%s", "test_csr_output.bin", "test_nodes_output.txt");
    if (ret != 0) {
        fprintf(stderr, "csr_build_from_struct failed\\n");
        return 1;
    }
    
    CSR g;
    ret = load_full("test_csr_output.bin", &g);
    if (ret != 0) {
        fprintf(stderr, "load_full failed\\n");
        return 1;
    }
    
    printf("CSR built successfully: n=%%d, nnz=%%d\\n", g.n, g.nnz);
    csr_free(&g);
    return 0;
}
""" % test_struct_file
    
    with open("test_csr_build_tmp.c", "w") as f:
        f.write(test_code)
    
    # Compile
    ret, _, stderr = run_command(
        "gcc -o test_csr_build_tmp test_csr_build_tmp.c CSR.c -lm",
        check=False
    )
    
    if ret != 0:
        print_fail("Failed to compile CSR build test")
        return
    
    # Run
    ret, stdout, stderr = run_command("./test_csr_build_tmp", check=False)
    
    if ret == 0:
        print_pass(f"CSR build successful: {stdout.strip()}")
    else:
        print_fail(f"CSR build failed: {stderr}")
    
    # Cleanup
    for f in ["test_csr_build_tmp.c", "test_csr_build_tmp", "test_csr_output.bin", "test_nodes_output.txt"]:
        if os.path.exists(f):
            os.remove(f)

# ============================================================================
# PART 3: PAGERANK.C TESTS
# ============================================================================

def test_part3_pagerank_compilation():
    """Compile PageRank.c"""
    print_header("PART 3: PAGERANK TESTS")
    
    print_test("Compiling PageRank.c")
    
    # Create wrapper main() for PageRank since it only has pagerank_run()
    wrapper_code = '''#include <stdio.h>
#include <stdlib.h>
int pagerank_run(const char *csr_path, int NPROC, int MAX_ITERS, double alpha);
int main(int argc, char **argv) {
    if (argc != 5) {
        fprintf(stderr, "Usage: %s <csr_path> <nproc> <iters> <alpha>\\n", argv[0]);
        return 2;
    }
    return (pagerank_run(argv[1], atoi(argv[2]), atoi(argv[3]), atof(argv[4])) == 0) ? 0 : 1;
}
'''
    
    with open("pagerank_wrapper.c", "w") as f:
        f.write(wrapper_code)
    
    ret, stdout, stderr = run_command(
        "gcc -o PageRank pagerank_wrapper.c PageRank.c CSR.c -lm -Wall",
        check=False
    )
    
    if ret != 0:
        print_fail("PageRank compilation failed")
        print(stderr)
        if os.path.exists("pagerank_wrapper.c"):
            os.remove("pagerank_wrapper.c")
        return False
    
    print_pass("PageRank compiled successfully")
    return True

def test_part3_pagerank_basic():
    """Test basic PageRank execution"""
    if not os.path.exists("PageRank"):
        print_skip("PageRank binary not found")
        return
    
    print_test("PageRank basic execution test")
    
    # Check if we have necessary input files
    struct_files = list(Path("sanity-check-outputs").glob("*_file_links.txt"))
    
    if not struct_files:
        print_skip("No struct files found. Run Part 1 tests first.")
        return
    
    struct_file = str(struct_files[0])
    
    # Create test directories
    os.makedirs("data/tmp", exist_ok=True)
    os.makedirs("data/pi", exist_ok=True)
    
    print(f"Using struct file: {struct_file}")
    
    # Step 1: Build CSR from struct file
    print("  Step 1/2: Building CSR from struct file...")
    
    # Create CSR builder wrapper if needed
    csr_wrapper = '''#include <stdio.h>
#include "CSR.h"
int main(int argc, char **argv) {
    if (argc != 4) {
        fprintf(stderr, "Usage: %s <struct_file> <csr_out> <nodes_out>\\n", argv[0]);
        return 2;
    }
    return (csr_build_from_struct(argv[1], argv[2], argv[3]) == 0) ? 0 : 1;
}
'''
    
    with open("csr_builder_tmp.c", "w") as f:
        f.write(csr_wrapper)
    
    ret, _, stderr = run_command(
        "gcc -o csr_builder_tmp csr_builder_tmp.c CSR.c -lm",
        check=False
    )
    
    if ret != 0:
        print_fail("Failed to compile CSR builder")
        print(stderr)
        return
    
    csr_binary = "data/P_CSR.bin"
    nodes_file = "data/nodes.txt"
    
    ret, stdout, stderr = run_command(
        f"./csr_builder_tmp {struct_file} {csr_binary} {nodes_file}",
        timeout=30,
        check=False
    )
    
    if ret != 0:
        print_fail("CSR build failed")
        print(stderr)
        # Cleanup
        for f in ["csr_builder_tmp.c", "csr_builder_tmp"]:
            if os.path.exists(f):
                os.remove(f)
        return
    
    print_pass("  CSR built successfully")
    
    # Step 2: Run PageRank with CSR binary
    print("  Step 2/2: Running PageRank...")
    
    ret, stdout, stderr = run_command(
        f"./PageRank {csr_binary} 2 5 0.85",
        timeout=60,
        check=False
    )
    
    # Cleanup temporary files
    for f in ["csr_builder_tmp.c", "csr_builder_tmp"]:
        if os.path.exists(f):
            os.remove(f)
    
    if ret == 0:
        print_pass("PageRank executed successfully")
        if stdout:
            print(stdout)
        
        # Check if output files were created
        if os.path.exists("data/P_CSR.bin"):
            print_pass("  CSR binary exists")
        else:
            print_warn("  CSR binary not found")
        
        if os.path.exists("data/nodes.txt"):
            print_pass("  Nodes file exists")
        else:
            print_warn("  Nodes file not found")
        
        rank_files = list(Path("data/pi").glob("rank_iter_*.bin"))
        if rank_files:
            print_pass(f"  Found {len(rank_files)} rank iteration files")
        else:
            print_warn("  No rank iteration files found")
    else:
        print_fail(f"PageRank execution failed (exit code: {ret})")
        if stderr:
            print(f"Error: {stderr}")

def test_part3_pagerank_convergence():
    """Test PageRank convergence properties"""
    print_test("PageRank convergence test")
    
    if not os.path.exists("data/pi"):
        print_skip("No PageRank output directory found")
        return
    
    # Read the final concatenated rank vector
    final_rank_file = "data/pi/rank_iter.bin"
    
    if not os.path.exists(final_rank_file):
        print_skip("Final rank vector not found")
        return
    
    try:
        # Read final ranks
        with open(final_rank_file, "rb") as f:
            data = f.read()
            num_doubles = len(data) // 8
            final_ranks = struct.unpack(f"{num_doubles}d", data)
        
        # Check sum is approximately 1.0
        rank_sum = sum(final_ranks)
        if abs(rank_sum - 1.0) < 0.001:
            print_pass(f"Rank sum is normalized: {rank_sum:.6f}")
        else:
            print_warn(f"Rank sum deviation: {rank_sum:.6f} (expected: 1.0)")
        
        # Check that all ranks are non-negative
        if all(r >= 0 for r in final_ranks):
            print_pass("All ranks are non-negative")
        else:
            print_fail("Found negative rank values")
        
        # Check for reasonable distribution (no single node dominates)
        max_rank = max(final_ranks)
        min_rank = min(final_ranks)
        print(f"  Rank distribution: min={min_rank:.6f}, max={max_rank:.6f}")
        
        # For convergence, check last two reducer outputs from different iterations
        # Get all iteration numbers
        reducer_files = sorted(Path("data/pi").glob("rank_iter_*_0.bin"))
        
        if len(reducer_files) >= 2:
            # Reconstruct last two full vectors by concatenating all reducers
            last_iter = int(reducer_files[-1].stem.split('_')[2])
            prev_iter = int(reducer_files[-2].stem.split('_')[2])
            
            # Get number of reducers
            nproc = len(list(Path("data/pi").glob(f"rank_iter_{last_iter}_*.bin")))
            
            # Read last iteration
            curr_full = []
            for r in range(nproc):
                filepath = f"data/pi/rank_iter_{last_iter}_{r}.bin"
                with open(filepath, "rb") as f:
                    data = f.read()
                    num_doubles = len(data) // 8
                    curr_full.extend(struct.unpack(f"{num_doubles}d", data))
            
            # Read previous iteration
            prev_full = []
            for r in range(nproc):
                filepath = f"data/pi/rank_iter_{prev_iter}_{r}.bin"
                with open(filepath, "rb") as f:
                    data = f.read()
                    num_doubles = len(data) // 8
                    prev_full.extend(struct.unpack(f"{num_doubles}d", data))
            
            if len(curr_full) == len(prev_full):
                max_diff = max(abs(curr_full[i] - prev_full[i]) for i in range(len(curr_full)))
                print(f"  Convergence: max rank change between iterations {prev_iter} and {last_iter}: {max_diff:.6e}")
                
                if max_diff < 0.01:
                    print_pass("Ranks are converging")
                else:
                    print_warn("Ranks show significant change between iterations")
        else:
            print_skip("Not enough iterations to test convergence")
        
    except Exception as e:
        print_fail(f"Error checking convergence: {e}")

# ============================================================================
# PART 4: SEARCHENGINE.C TESTS
# ============================================================================

def test_part4_searchengine_compilation():
    """Compile SearchEngine.c"""
    print_header("PART 4: SEARCHENGINE TESTS")
    
    print_test("Compiling SearchEngine.c")
    
    ret, stdout, stderr = run_command(
        "gcc -o SearchEngine SearchEngine.c CSR.c PageRank.c -lm -Wall",
        check=False
    )
    
    if ret != 0:
        print_fail("SearchEngine compilation failed")
        print(stderr)
        return False
    
    if stderr:
        print_warn("Compilation warnings detected")
        print(stderr)
    
    print_pass("SearchEngine compiled successfully")
    return True

def test_part4_searchengine_basic():
    """Test basic SearchEngine execution"""
    if not os.path.exists("SearchEngine"):
        print_skip("SearchEngine binary not found")
        return
    
    print_test("SearchEngine interactive test")
    
    # Check if we have necessary input files
    struct_files = list(Path("sanity-check-outputs").glob("*_file_links.txt"))
    
    if not struct_files:
        print_skip("No struct files found. Run Part 1 tests first.")
        return
    
    struct_file = str(struct_files[0])
    
    # Create test directories
    os.makedirs("data/tmp", exist_ok=True)
    os.makedirs("data/pi", exist_ok=True)
    
    print(f"Using struct file: {struct_file}")
    
    # Create interactive commands
    commands = f"PAGERANK SETUP\n{struct_file}\nPAGERANK RUN\nQUIT\n"
    
    # Run SearchEngine with automated input
    try:
        result = subprocess.run(
            ["./SearchEngine", struct_file, "2", "5", "0.85"],
            input=commands,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        stdout = result.stdout
        stderr = result.stderr
        ret = result.returncode
        
        if ret != 0:
            print_fail(f"SearchEngine execution failed (exit code: {ret})")
            if stderr:
                print(f"Error: {stderr}")
            return
        
        # Check if expected output patterns are present
        expected_patterns = [
            "SearchEngine ready",
            "SETUP complete",
            "PAGERANK RUN",
            "Sum(PageRank)",
            "Goodbye"
        ]
        
        missing = []
        for pattern in expected_patterns:
            if pattern not in stdout:
                missing.append(pattern)
        
        if not missing:
            print_pass("SearchEngine executed successfully")
            print_pass("  All expected output patterns found")
        else:
            print_warn(f"Missing output patterns: {missing}")
        
        # Check if rank sum is approximately 1.0
        if "Sum(PageRank)" in stdout:
            for line in stdout.split('\n'):
                if "Sum(PageRank)" in line:
                    try:
                        rank_sum_str = line.split('=')[-1].strip()
                        rank_sum = float(rank_sum_str)
                        if abs(rank_sum - 1.0) < 0.001:
                            print_pass(f"  PageRank sum normalized: {rank_sum:.6f}")
                        else:
                            print_warn(f"  PageRank sum deviation: {rank_sum:.6f}")
                    except:
                        pass
        
        # Check if output files were created
        if os.path.exists("data/P_CSR.bin"):
            print_pass("  CSR binary created")
        
        if os.path.exists("data/nodes.txt"):
            print_pass("  Nodes file created")
        
        rank_files = list(Path("data/pi").glob("rank_iter_*.bin"))
        if rank_files:
            print_pass(f"  Found {len(rank_files)} rank iteration files")
        
    except subprocess.TimeoutExpired:
        print_fail("SearchEngine timed out (60s)")
    except Exception as e:
        print_fail(f"Error running SearchEngine: {e}")

def test_part4_searchengine_quit():
    """Test SearchEngine QUIT command"""
    if not os.path.exists("SearchEngine"):
        print_skip("SearchEngine binary not found")
        return
    
    print_test("SearchEngine QUIT command test")
    
    struct_files = list(Path("sanity-check-outputs").glob("*_file_links.txt"))
    if not struct_files:
        print_skip("No struct files found")
        return
    
    struct_file = str(struct_files[0])
    
    # Test immediate quit
    try:
        result = subprocess.run(
            ["./SearchEngine", struct_file, "2", "5", "0.85"],
            input="QUIT\n",
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 and "Goodbye" in result.stdout:
            print_pass("QUIT command works correctly")
        else:
            print_fail("QUIT command failed")
            
    except subprocess.TimeoutExpired:
        print_fail("SearchEngine did not respond to QUIT (timeout)")
    except Exception as e:
        print_fail(f"Error testing QUIT: {e}")

# ============================================================================
# MEMORY & THREAD SAFETY TESTS (VALGRIND)
# ============================================================================

def test_valgrind():
    """Run Valgrind memory and thread safety checks"""
    print_header("MEMORY & THREAD SAFETY (VALGRIND)")
    
    if shutil.which("valgrind") is None:
        print_skip("Valgrind not found. Skipping memory/thread safety tests.")
        return
    
    # Test Part 1 with Valgrind
    if os.path.exists("multithreaded"):
        # Backup part-1-outputs to prevent Valgrind tests from modifying it
        backup_dir = None
        if os.path.exists("part-1-outputs"):
            backup_dir = f"part-1-outputs.valgrind.backup.{int(time.time())}"
            os.rename("part-1-outputs", backup_dir)
        
        os.makedirs("part-1-outputs", exist_ok=True)
        
        print_test("Valgrind memcheck on multithreaded")
        
        # Generate small test case
        run_command("./files_generator.sh 3 2 2 forest > /dev/null 2>&1", check=False)
        
        ret, stdout, stderr = run_command(
            "valgrind --tool=memcheck --leak-check=full --error-exitcode=1 "
            "--log-file=valgrind_mem.log ./multithreaded 2 forest > /dev/null 2>&1",
            timeout=60,
            check=False
        )
        
        if ret == 0:
            print_pass("No memory leaks detected")
        else:
            print_fail("Memory leaks detected. See valgrind_mem.log")
        
        print_test("Valgrind helgrind on multithreaded")
        
        ret, stdout, stderr = run_command(
            "valgrind --tool=helgrind --error-exitcode=1 "
            "--log-file=valgrind_race.log ./multithreaded 2 forest > /dev/null 2>&1",
            timeout=60,
            check=False
        )
        
        if ret == 0:
            print_pass("No race conditions detected")
        else:
            print_fail("Race conditions detected. See valgrind_race.log")
        
        # Clean up Valgrind test outputs and restore original
        if os.path.exists("part-1-outputs"):
            shutil.rmtree("part-1-outputs")
        
        if backup_dir and os.path.exists(backup_dir):
            os.rename(backup_dir, "part-1-outputs")

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def main():
    print(f"{Colors.CYAN}")
    print("=" * 60)
    print("CS 140 PROJECT 2 - COMPREHENSIVE SANITY CHECK")
    print("=" * 60)
    print(f"Testing: multithreaded.c, CSR.c, PageRank.c, SearchEngine.c")
    print(f"Start Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{Colors.NC}")
    
    # Clean old PageRank data to avoid corrupted file issues
    if os.path.exists("data/pi"):
        shutil.rmtree("data/pi")
        print(f"{Colors.CYAN}Cleaned data/pi directory{Colors.NC}")
    if os.path.exists("data/tmp"):
        shutil.rmtree("data/tmp")
        print(f"{Colors.CYAN}Cleaned data/tmp directory{Colors.NC}")
    
    # PART 1: MULTITHREADED.C
    if test_part1_compilation():
        test_part1_functional()
        test_part1_formatting()
        test_part1_stress()
    
    # PART 2: CSR.C
    if test_part2_csr_compilation():
        test_part2_csr_execution()
        test_part2_csr_build()
    
    # PART 3: PAGERANK.C
    if test_part3_pagerank_compilation():
        test_part3_pagerank_basic()
        test_part3_pagerank_convergence()
    
    # PART 4: SEARCHENGINE.C
    if test_part4_searchengine_compilation():
        test_part4_searchengine_basic()
        test_part4_searchengine_quit()
    
    # MEMORY SAFETY
    test_valgrind()
    
    # FINAL SUMMARY
    print_header("FINAL TEST SUMMARY")
    print(f"Total Tests:   {stats.total}")
    print(f"{Colors.GREEN}Passed:        {stats.passed}{Colors.NC}")
    print(f"{Colors.RED}Failed:        {stats.failed}{Colors.NC}")
    print(f"{Colors.YELLOW}Skipped:       {stats.skipped}{Colors.NC}")
    print(f"\nEnd Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    if stats.failed == 0:
        print(f"\n{Colors.GREEN}{'='*60}")
        print("ALL TESTS PASSED!")
        print(f"{'='*60}{Colors.NC}")
        return 0
    else:
        print(f"\n{Colors.RED}{'='*60}")
        print("SOME TESTS FAILED")
        print(f"{'='*60}{Colors.NC}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
