#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <sys/stat.h>
#include "CSR.h"

#define EPSILON 1e-6
#define EPSILON_MIN 1e-5

int tests_passed = 0;
int tests_failed = 0;

void print_test_header(const char *test_name) {
    printf("\n========================================\n");
    printf("TEST: %s\n", test_name);
    printf("========================================\n");
}

void print_pass(const char *test_name) {
    printf("PASSED: %s\n", test_name);
    tests_passed++;
}

void print_fail(const char *test_name, const char *reason) {
    printf("FAILED: %s - %s\n", test_name, reason);
    tests_failed++;
}

int create_test_file_links(const char *filename) {
    FILE *fp = fopen(filename, "w");
    if (!fp) return -1;
    
    fprintf(fp, "files/0.txt|0.txt|[2.txt,3.txt,4.txt]|[2.txt,3.txt]\n");
    fprintf(fp, "files/1.txt|1.txt|[2.txt,4.txt]|[2.txt]\n");
    fprintf(fp, "files/2.txt|2.txt|[0.txt,1.txt]|[0.txt,1.txt,3.txt]\n");
    fprintf(fp, "files/3.txt|3.txt|[0.txt,2.txt]|[0.txt,4.txt]\n");
    fprintf(fp, "files/4.txt|4.txt|[0.txt,1.txt,3.txt]|[0.txt,1.txt]\n");
    
    fclose(fp);
    return 0;
}

void test_1_basic_csr_build() {
    print_test_header("1. Basic CSR Build from Struct File");
    
    const char *test_file = "test_file_links.txt";
    const char *csr_file = "test_P_CSR.bin";
    const char *nodes_file = "test_nodes.txt";
    
    if (create_test_file_links(test_file) != 0) {
        print_fail("Basic CSR Build", "Could not create test file");
        return;
    }
    
    int result = csr_build_from_struct(test_file, csr_file, nodes_file);
    
    if (result != 0) {
        print_fail("Basic CSR Build", "csr_build_from_struct returned error");
        return;
    }
    
    FILE *fp = fopen(csr_file, "rb");
    if (!fp) {
        print_fail("Basic CSR Build", "CSR file not created");
        return;
    }
    
    int32_t n, nnz;
    fread(&n, sizeof(int32_t), 1, fp);
    fread(&nnz, sizeof(int32_t), 1, fp);
    fclose(fp);
    
    printf("n = %d (expected: 5)\n", n);
    printf("nnz = %d (expected: 10)\n", nnz);
    
    FILE *nodes_fp = fopen(nodes_file, "r");
    if (!nodes_fp) {
        print_fail("Basic CSR Build", "Nodes file not created");
        return;
    }
    
    int node_count = 0;
    char line[512];
    while (fgets(line, sizeof(line), nodes_fp)) {
        node_count++;
    }
    fclose(nodes_fp);
    
    printf("Node count in nodes file: %d (expected: 5)\n", node_count);
    
    if (n == 5 && nnz == 10 && node_count == 5) {
        print_pass("Basic CSR Build");
    } else {
        print_fail("Basic CSR Build", "Incorrect n, nnz, or node count");
    }
}

void test_2_load_full_csr() {
    print_test_header("2. Load Full CSR Matrix");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g;
    
    int result = load_full(csr_file, &g);
    
    if (result != 0) {
        print_fail("Load Full CSR", "load_full returned error");
        return;
    }
    
    printf("Loaded CSR: n=%d, nnz=%d\n", g.n, g.nnz);
    
    int32_t expected_row_ptr[] = {0, 2, 3, 6, 8, 10};
    int32_t expected_col_idx[] = {2, 3, 2, 0, 1, 3, 0, 4, 0, 1};
    int32_t expected_outdeg[] = {2, 1, 3, 2, 2};
    
    int pass = 1;
    
    if (g.row_ptr == NULL || g.col_idx == NULL || g.outdeg == NULL) {
        print_fail("Load Full CSR", "NULL pointers in CSR structure");
        csr_free(&g);
        return;
    }
    
    for (int i = 0; i <= g.n; i++) {
        if (g.row_ptr[i] != expected_row_ptr[i]) {
            printf("row_ptr[%d] = %d, expected %d\n", i, g.row_ptr[i], expected_row_ptr[i]);
            pass = 0;
        }
    }
    
    for (int i = 0; i < g.nnz; i++) {
        if (g.col_idx[i] != expected_col_idx[i]) {
            printf("col_idx[%d] = %d, expected %d\n", i, g.col_idx[i], expected_col_idx[i]);
            pass = 0;
        }
    }
    
    for (int i = 0; i < g.n; i++) {
        if (g.outdeg[i] != expected_outdeg[i]) {
            printf("outdeg[%d] = %d, expected %d\n", i, g.outdeg[i], expected_outdeg[i]);
            pass = 0;
        }
    }
    
    if (pass) {
        print_pass("Load Full CSR");
    } else {
        print_fail("Load Full CSR", "CSR data does not match expected values");
    }
    
    csr_free(&g);
}

void test_3_load_partial_rows() {
    print_test_header("3. Load Partial Rows [1, 3)");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g_partial;
    
    int result = load_rows(csr_file, 1, 3, &g_partial);
    
    if (result != 0) {
        print_fail("Load Partial Rows [1,3)", "load_rows returned error");
        return;
    }
    
    printf("Partial CSR: n=%d (expected: 2), nnz=%d (expected: 4)\n", 
           g_partial.n, g_partial.nnz);
    
    if (g_partial.n != 2 || g_partial.nnz != 4) {
        print_fail("Load Partial Rows [1,3)", "Incorrect n or nnz");
        csr_free(&g_partial);
        return;
    }
    
    if (g_partial.row_ptr[0] != 0) {
        print_fail("Load Partial Rows [1,3)", "row_ptr[0] should be 0 (self-contained)");
        csr_free(&g_partial);
        return;
    }
    
    if (g_partial.row_ptr[g_partial.n] != g_partial.nnz) {
        print_fail("Load Partial Rows [1,3)", "row_ptr[n] should equal nnz");
        csr_free(&g_partial);
        return;
    }
    
    print_pass("Load Partial Rows [1,3)");
    csr_free(&g_partial);
}

void test_4_load_partial_edge_cases() {
    print_test_header("4. Load Partial Rows Edge Cases");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g_partial;
    
    printf("Test 4a: Load first row only [0, 1)\n");
    if (load_rows(csr_file, 0, 1, &g_partial) == 0) {
        if (g_partial.n == 1 && g_partial.row_ptr[0] == 0) {
            printf("  PASS: First row loaded correctly\n");
            csr_free(&g_partial);
        } else {
            print_fail("Load First Row", "Incorrect dimensions");
            csr_free(&g_partial);
            return;
        }
    } else {
        print_fail("Load First Row", "Failed to load");
        return;
    }
    
    printf("Test 4b: Load last row only [4, 5)\n");
    if (load_rows(csr_file, 4, 5, &g_partial) == 0) {
        if (g_partial.n == 1 && g_partial.row_ptr[0] == 0) {
            printf("  PASS: Last row loaded correctly\n");
            csr_free(&g_partial);
        } else {
            print_fail("Load Last Row", "Incorrect dimensions");
            csr_free(&g_partial);
            return;
        }
    } else {
        print_fail("Load Last Row", "Failed to load");
        return;
    }
    
    printf("Test 4c: Load all rows [0, 5)\n");
    if (load_rows(csr_file, 0, 5, &g_partial) == 0) {
        if (g_partial.n == 5 && g_partial.nnz == 10) {
            printf("  PASS: All rows loaded correctly\n");
            csr_free(&g_partial);
        } else {
            print_fail("Load All Rows", "Incorrect dimensions");
            csr_free(&g_partial);
            return;
        }
    } else {
        print_fail("Load All Rows", "Failed to load");
        return;
    }
    
    print_pass("Load Partial Rows Edge Cases");
}

void test_5_ppi_step_full() {
    print_test_header("5. Full P * pi Multiplication");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g;
    
    if (load_full(csr_file, &g) != 0) {
        print_fail("Full P*pi", "Could not load CSR");
        return;
    }
    
    double pi_in[5] = {0.2, 0.2, 0.2, 0.2, 0.2};
    double pi_out[5] = {0};
    double dangling = 0.0;
    
    ppi_step_full(&g, pi_in, pi_out, &dangling);
    
    printf("Input pi: [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_in[0], pi_in[1], pi_in[2], pi_in[3], pi_in[4]);
    printf("Output P*pi: [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_out[0], pi_out[1], pi_out[2], pi_out[3], pi_out[4]);
    printf("Dangling mass: %.3f\n", dangling);
    
    // Compute expected values based on the graph structure:
    // Outlinks: 0→[2,3], 1→[2], 2→[0,1,3], 3→[0,4], 4→[0,1]
    // Node 0 receives from: 2(outdeg=3), 3(outdeg=2), 4(outdeg=2)
    // Node 1 receives from: 2(outdeg=3), 4(outdeg=2)
    // Node 2 receives from: 0(outdeg=2), 1(outdeg=1)
    // Node 3 receives from: 0(outdeg=2), 2(outdeg=3)
    // Node 4 receives from: 3(outdeg=2)
    double expected[] = {
        0.2/3.0 + 0.2/2.0 + 0.2/2.0,  // 0.26666...
        0.2/3.0 + 0.2/2.0,              // 0.16666...
        0.2/2.0 + 0.2/1.0,              // 0.3
        0.2/2.0 + 0.2/3.0,              // 0.16666...
        0.2/2.0                         // 0.1
    };
    
    int pass = 1;
    for (int i = 0; i < 5; i++) {
        if (fabs(pi_out[i] - expected[i]) > EPSILON_MIN) {
            pass = 0;
            printf("Mismatch at index %d: got %.6f, expected %.6f\n", 
                   i, pi_out[i], expected[i]);
        }
    }
    
    if (fabs(dangling) > EPSILON) {
        print_fail("Full P*pi", "Unexpected dangling mass (should be 0)");
        csr_free(&g);
        return;
    }
    
    if (pass) {
        print_pass("Full P*pi");
    } else {
        print_fail("Full P*pi", "Output does not match expected values");
    }
    
    csr_free(&g);
}

void test_6_ppi_step_partial() {
    print_test_header("6. Partial P * pi Multiplication");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g_partial;
    
    if (load_rows(csr_file, 1, 3, &g_partial) != 0) {
        print_fail("Partial P*pi", "Could not load partial CSR");
        return;
    }
    
    double pi_in[5] = {0.2, 0.2, 0.2, 0.2, 0.2};
    double pi_out[5] = {0};
    double dangling = 0.0;
    
    ppi_step_partial(&g_partial, pi_in, 1, 3, pi_out, &dangling);
    
    printf("Partial output (rows 1-2): [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_out[0], pi_out[1], pi_out[2], pi_out[3], pi_out[4]);
    printf("Partial dangling mass: %.3f\n", dangling);
    
    int non_zero_count = 0;
    for (int i = 0; i < 5; i++) {
        if (pi_out[i] > EPSILON) non_zero_count++;
    }
    
    printf("Non-zero entries in output: %d\n", non_zero_count);
    
    if (non_zero_count > 0) {
        print_pass("Partial P*pi");
    } else {
        print_fail("Partial P*pi", "No contributions from partial multiplication");
    }
    
    csr_free(&g_partial);
}

void test_7_dangling_nodes() {
    print_test_header("7. CSR with Dangling Nodes");
    
    FILE *fp = fopen("test_dangling_links.txt", "w");
    fprintf(fp, "files/0.txt|0.txt|[1.txt]|[1.txt]\n");
    fprintf(fp, "files/1.txt|1.txt|[0.txt]|[]\n");
    fclose(fp);
    
    csr_build_from_struct("test_dangling_links.txt", 
                         "test_dangling_CSR.bin", 
                         "test_dangling_nodes.txt");
    
    CSR g;
    load_full("test_dangling_CSR.bin", &g);
    
    printf("n=%d, nnz=%d\n", g.n, g.nnz);
    printf("outdeg: [%d, %d]\n", g.outdeg[0], g.outdeg[1]);
    
    if (g.outdeg[1] != 0) {
        print_fail("Dangling Nodes", "Node 1 should have outdeg=0");
        csr_free(&g);
        return;
    }
    
    double pi_in[2] = {0.5, 0.5};
    double pi_out[2] = {0};
    double dangling = 0.0;
    
    ppi_step_full(&g, pi_in, pi_out, &dangling);
    
    printf("Output P*pi: [%.3f, %.3f]\n", pi_out[0], pi_out[1]);
    printf("Dangling mass: %.3f (expected: 0.5)\n", dangling);
    
    if (fabs(dangling - 0.5) < EPSILON) {
        print_pass("Dangling Nodes");
    } else {
        print_fail("Dangling Nodes", "Dangling mass not calculated correctly");
    }
    
    csr_free(&g);
}

void test_8_multiple_dangling_nodes() {
    print_test_header("8. Multiple Dangling Nodes");
    
    FILE *fp = fopen("test_multi_dangling.txt", "w");
    fprintf(fp, "files/0.txt|0.txt|[]|[]\n");
    fprintf(fp, "files/1.txt|1.txt|[]|[]\n");
    fprintf(fp, "files/2.txt|2.txt|[]|[]\n");
    fclose(fp);
    
    csr_build_from_struct("test_multi_dangling.txt", 
                         "test_multi_dangling_CSR.bin", 
                         "test_multi_dangling_nodes.txt");
    
    CSR g;
    load_full("test_multi_dangling_CSR.bin", &g);
    
    printf("All nodes are dangling: outdeg = [%d, %d, %d]\n", 
           g.outdeg[0], g.outdeg[1], g.outdeg[2]);
    
    double pi_in[3] = {0.333, 0.333, 0.334};
    double pi_out[3] = {0};
    double dangling = 0.0;
    
    ppi_step_full(&g, pi_in, pi_out, &dangling);
    
    printf("Dangling mass: %.3f (expected: 1.0)\n", dangling);
    
    if (fabs(dangling - 1.0) < 0.001) {
        print_pass("Multiple Dangling Nodes");
    } else {
        print_fail("Multiple Dangling Nodes", "Dangling mass should sum to 1.0");
    }
    
    csr_free(&g);
}

void test_9_mapreduce_simulation() {
    print_test_header("9. MapReduce Simulation (Multiple Partial Workers)");
    
    const char *csr_file = "test_P_CSR.bin";
    int NPROC = 3;
    int n = 5;
    
    double pi_in[5] = {0.2, 0.2, 0.2, 0.2, 0.2};
    double pi_out[5] = {0};
    double total_dangling = 0.0;
    
    printf("Simulating %d map workers...\n", NPROC);
    
    for (int worker = 0; worker < NPROC; worker++) {
        int start = (worker * n) / NPROC;
        int end = ((worker + 1) * n) / NPROC;
        
        printf("Worker %d: rows [%d, %d)\n", worker, start, end);
        
        CSR g_partial;
        if (load_rows(csr_file, start, end, &g_partial) != 0) {
            print_fail("MapReduce Simulation", "Failed to load rows for worker");
            return;
        }
        
        double local_dangling = 0.0;
        ppi_step_partial(&g_partial, pi_in, start, end, pi_out, &local_dangling);
        
        total_dangling += local_dangling;
        
        csr_free(&g_partial);
    }
    
    printf("Combined output: [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_out[0], pi_out[1], pi_out[2], pi_out[3], pi_out[4]);
    printf("Total dangling: %.3f\n", total_dangling);
    
    CSR g_full;
    load_full(csr_file, &g_full);
    double pi_full[5] = {0};
    double dangling_full = 0.0;
    ppi_step_full(&g_full, pi_in, pi_full, &dangling_full);
    
    int pass = 1;
    for (int i = 0; i < 5; i++) {
        if (fabs(pi_out[i] - pi_full[i]) > EPSILON) {
            printf("Mismatch at index %d: partial=%.3f, full=%.3f\n", 
                   i, pi_out[i], pi_full[i]);
            pass = 0;
        }
    }
    
    if (fabs(total_dangling - dangling_full) > EPSILON) {
        printf("Dangling mass mismatch: partial=%.3f, full=%.3f\n", 
               total_dangling, dangling_full);
        pass = 0;
    }
    
    if (pass) {
        print_pass("MapReduce Simulation");
    } else {
        print_fail("MapReduce Simulation", "Partial results don't match full calculation");
    }
    
    csr_free(&g_full);
}

void test_10_csr_free_no_crash() {
    print_test_header("10. CSR Free Memory Safety");
    
    CSR g;
    g.n = 0;
    g.nnz = 0;
    g.row_ptr = NULL;
    g.col_idx = NULL;
    g.outdeg = NULL;
    
    printf("Calling csr_free on empty CSR...\n");
    csr_free(&g);
    printf("No crash - safe to free NULL pointers\n");
    
    if (load_full("test_P_CSR.bin", &g) == 0) {
        printf("Calling csr_free on loaded CSR...\n");
        csr_free(&g);
        printf("Memory freed successfully\n");
        
        printf("Calling csr_free again on same CSR...\n");
        csr_free(&g);
        printf("Double-free safe\n");
        
        print_pass("CSR Free Memory Safety");
    } else {
        print_fail("CSR Free Memory Safety", "Could not load CSR for testing");
    }
}

void test_11_zero_vector() {
    print_test_header("11. P * pi with Zero Vector");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g;
    
    if (load_full(csr_file, &g) != 0) {
        print_fail("Zero Vector Test", "Could not load CSR");
        return;
    }
    
    double pi_in[5] = {0, 0, 0, 0, 0};
    double pi_out[5] = {0};
    double dangling = 0.0;
    
    ppi_step_full(&g, pi_in, pi_out, &dangling);
    
    printf("Output P*pi: [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_out[0], pi_out[1], pi_out[2], pi_out[3], pi_out[4]);
    printf("Dangling mass: %.3f\n", dangling);
    
    int pass = 1;
    for (int i = 0; i < 5; i++) {
        if (fabs(pi_out[i]) > EPSILON) {
            pass = 0;
        }
    }
    
    if (pass && fabs(dangling) < EPSILON) {
        print_pass("Zero Vector Test");
    } else {
        print_fail("Zero Vector Test", "Output should be all zeros");
    }
    
    csr_free(&g);
}

void test_12_normalized_vector() {
    print_test_header("12. P * pi Maintains Probability Sum");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g;
    
    if (load_full(csr_file, &g) != 0) {
        print_fail("Normalized Vector Test", "Could not load CSR");
        return;
    }
    
    double pi_in[5] = {0.2, 0.2, 0.2, 0.2, 0.2};
    double pi_out[5] = {0};
    double dangling = 0.0;
    
    ppi_step_full(&g, pi_in, pi_out, &dangling);
    
    double sum_in = 0.0, sum_out = 0.0;
    for (int i = 0; i < 5; i++) {
        sum_in += pi_in[i];
        sum_out += pi_out[i];
    }
    sum_out += dangling;
    
    printf("Sum of input pi: %.6f\n", sum_in);
    printf("Sum of output P*pi + dangling: %.6f\n", sum_out);
    
    if (fabs(sum_in - sum_out) < EPSILON) {
        print_pass("Normalized Vector Test");
    } else {
        print_fail("Normalized Vector Test", "Probability mass not conserved");
    }
    
    csr_free(&g);
}

int main() {
    printf("========================================\n");
    printf("CSR Implementation Comprehensive Tests\n");
    printf("Based on CS140 Project 2 Specifications\n");
    printf("========================================\n");
    
    #ifdef _WIN32
    mkdir("data");
    #else
    mkdir("data", 0755);
    #endif
    
    test_1_basic_csr_build();
    test_2_load_full_csr();
    test_3_load_partial_rows();
    test_4_load_partial_edge_cases();
    test_5_ppi_step_full();
    test_6_ppi_step_partial();
    test_7_dangling_nodes();
    test_8_multiple_dangling_nodes();
    test_9_mapreduce_simulation();
    test_10_csr_free_no_crash();
    test_11_zero_vector();
    test_12_normalized_vector();
    
    printf("\n========================================\n");
    printf("TEST SUMMARY\n");
    printf("========================================\n");
    printf("Tests Passed: %d\n", tests_passed);
    printf("Tests Failed: %d\n", tests_failed);
    printf("Total Tests:  %d\n", tests_passed + tests_failed);
    printf("========================================\n");
    
    if (tests_failed == 0) {
        printf("ALL TESTS PASSED!\n");
    } else {
        printf("SOME TESTS FAILED - Review output above\n");
    }
    
    printf("\nCleanup: Removing test files...\n");
    remove("test_file_links.txt");
    remove("test_P_CSR.bin");
    remove("test_nodes.txt");
    remove("test_dangling_links.txt");
    remove("test_dangling_CSR.bin");
    remove("test_dangling_nodes.txt");
    remove("test_multi_dangling.txt");
    remove("test_multi_dangling_CSR.bin");
    remove("test_multi_dangling_nodes.txt");
    
    return tests_failed > 0 ? 1 : 0;
}