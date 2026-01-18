#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include "CSR.h"

#define EPSILON 1e-6

void print_test_header(const char *test_name) {
    printf("\n========================================\n");
    printf("TEST: %s\n", test_name);
    printf("========================================\n");
}

void print_pass() {
    printf("PASSED\n");
}

void print_fail(const char *reason) {
    printf("FAILED: %s\n", reason);
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

void test_csr_build() {
    print_test_header("CSR Build from Struct File");
    
    const char *test_file = "test_file_links.txt";
    const char *csr_file = "test_P_CSR.bin";
    const char *nodes_file = "test_nodes.txt";
    
    if (create_test_file_links(test_file) != 0) {
        print_fail("Could not create test file");
        return;
    }
    
    int result = csr_build_from_struct(test_file, csr_file, nodes_file);
    
    if (result != 0) {
        print_fail("csr_build_from_struct returned error");
        return;
    }
    
    FILE *fp = fopen(csr_file, "rb");
    if (!fp) {
        print_fail("CSR file not created");
        return;
    }
    
    int32_t n, nnz;
    fread(&n, sizeof(int32_t), 1, fp);
    fread(&nnz, sizeof(int32_t), 1, fp);
    fclose(fp);
    
    printf("n = %d (expected: 5)\n", n);
    printf("nnz = %d (expected: 10)\n", nnz);
    
    if (n == 5 && nnz == 10) {
        print_pass();
    } else {
        print_fail("Incorrect n or nnz values");
    }
}

void test_load_full() {
    print_test_header("Load Full CSR Matrix");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g;
    
    int result = load_full(csr_file, &g);
    
    if (result != 0) {
        print_fail("load_full returned error");
        return;
    }
    
    printf("Loaded CSR: n=%d, nnz=%d\n", g.n, g.nnz);
    
    printf("\nrow_ptr: [");
    for (int i = 0; i <= g.n; i++) {
        printf("%d", g.row_ptr[i]);
        if (i < g.n) printf(", ");
    }
    printf("]\n");
    
    printf("col_idx: [");
    for (int i = 0; i < g.nnz; i++) {
        printf("%d", g.col_idx[i]);
        if (i < g.nnz - 1) printf(", ");
    }
    printf("]\n");
    
    printf("outdeg: [");
    for (int i = 0; i < g.n; i++) {
        printf("%d", g.outdeg[i]);
        if (i < g.n - 1) printf(", ");
    }
    printf("]\n");
    
    int32_t expected_row_ptr[] = {0, 2, 3, 6, 8, 10};
    int32_t expected_col_idx[] = {2, 3, 2, 0, 1, 3, 0, 4, 0, 1};
    int32_t expected_outdeg[] = {2, 1, 3, 2, 2};
    
    int pass = 1;
    for (int i = 0; i <= g.n; i++) {
        if (g.row_ptr[i] != expected_row_ptr[i]) {
            pass = 0;
            break;
        }
    }
    
    for (int i = 0; i < g.nnz; i++) {
        if (g.col_idx[i] != expected_col_idx[i]) {
            pass = 0;
            break;
        }
    }
    
    for (int i = 0; i < g.n; i++) {
        if (g.outdeg[i] != expected_outdeg[i]) {
            pass = 0;
            break;
        }
    }
    
    if (pass) {
        print_pass();
    } else {
        print_fail("CSR data does not match expected values");
    }
    
    csr_free(&g);
}

void test_load_rows() {
    print_test_header("Load Partial Rows [1, 3)");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g_partial;
    
    int result = load_rows(csr_file, 1, 3, &g_partial);
    
    if (result != 0) {
        print_fail("load_rows returned error");
        return;
    }
    
    printf("Partial CSR: n=%d (expected: 2), nnz=%d (expected: 4)\n", 
           g_partial.n, g_partial.nnz);
    
    printf("row_ptr: [");
    for (int i = 0; i <= g_partial.n; i++) {
        printf("%d", g_partial.row_ptr[i]);
        if (i < g_partial.n) printf(", ");
    }
    printf("]\n");
    
    printf("col_idx: [");
    for (int i = 0; i < g_partial.nnz; i++) {
        printf("%d", g_partial.col_idx[i]);
        if (i < g_partial.nnz - 1) printf(", ");
    }
    printf("]\n");
    
    if (g_partial.n == 2 && g_partial.nnz == 4 && 
        g_partial.row_ptr[0] == 0 && g_partial.row_ptr[2] == 4) {
        print_pass();
    } else {
        print_fail("Partial CSR data incorrect");
    }
    
    csr_free(&g_partial);
}

void test_ppi_step_full() {
    print_test_header("Full P * pi Multiplication");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g;
    
    if (load_full(csr_file, &g) != 0) {
        print_fail("Could not load CSR");
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
    
    double expected[] = {4.0/15.0, 1.0/6.0, 0.3, 1.0/6.0, 0.1};
    
    int pass = 1;
    for (int i = 0; i < 5; i++) {
        if (fabs(pi_out[i] - expected[i]) > EPSILON) {
            pass = 0;
            printf("Mismatch at index %d: got %.3f, expected %.3f\n", 
                   i, pi_out[i], expected[i]);
        }
    }
    
    if (fabs(dangling) > EPSILON) {
        printf("Note: No dangling nodes in this graph (all nodes have outlinks)\n");
    }
    
    if (pass) {
        print_pass();
    } else {
        print_fail("Output does not match expected values");
    }
    
    csr_free(&g);
}

void test_ppi_step_partial() {
    print_test_header("Partial P * pi Multiplication [1, 3)");
    
    const char *csr_file = "test_P_CSR.bin";
    CSR g_partial;
    
    if (load_rows(csr_file, 1, 3, &g_partial) != 0) {
        print_fail("Could not load partial CSR");
        return;
    }
    
    double pi_in[5] = {0.2, 0.2, 0.2, 0.2, 0.2};
    double pi_out[5] = {0};
    double dangling = 0.0;
    
    ppi_step_partial(&g_partial, pi_in, 1, 3, pi_out, &dangling);
    
    printf("Input pi: [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_in[0], pi_in[1], pi_in[2], pi_in[3], pi_in[4]);
    printf("Partial output (rows 1-2): [%.3f, %.3f, %.3f, %.3f, %.3f]\n", 
           pi_out[0], pi_out[1], pi_out[2], pi_out[3], pi_out[4]);
    printf("Partial dangling mass: %.3f\n", dangling);
    
    int non_zero_count = 0;
    for (int i = 0; i < 5; i++) {
        if (pi_out[i] > EPSILON) non_zero_count++;
    }
    
    printf("Non-zero entries in output: %d\n", non_zero_count);
    
    if (non_zero_count > 0) {
        print_pass();
    } else {
        print_fail("No contributions from partial multiplication");
    }
    
    csr_free(&g_partial);
}

void test_with_dangling_node() {
    print_test_header("CSR with Dangling Node");
    
    FILE *fp = fopen("test_dangling_links.txt", "w");
    fprintf(fp, "files/0.txt|0.txt|[1.txt]|[1.txt]\n");
    fprintf(fp, "files/1.txt|1.txt|[0.txt]|[]\n");
    fclose(fp);
    
    csr_build_from_struct("test_dangling_links.txt", 
                         "test_dangling_CSR.bin", 
                         "test_dangling_nodes.txt");
    
    CSR g;
    load_full("test_dangling_CSR.bin", &g);
    
    printf("Loaded CSR with dangling node\n");
    printf("n=%d, nnz=%d\n", g.n, g.nnz);
    printf("outdeg: [%d, %d]\n", g.outdeg[0], g.outdeg[1]);
    
    double pi_in[2] = {0.5, 0.5};
    double pi_out[2] = {0};
    double dangling = 0.0;
    
    ppi_step_full(&g, pi_in, pi_out, &dangling);
    
    printf("Output P*pi: [%.3f, %.3f]\n", pi_out[0], pi_out[1]);
    printf("Dangling mass: %.3f (expected: 0.5)\n", dangling);
    
    if (fabs(dangling - 0.5) < EPSILON && g.outdeg[1] == 0) {
        print_pass();
    } else {
        print_fail("Dangling node not handled correctly");
    }
    
    csr_free(&g);
}

int main() {
    printf("========================================\n");
    printf("CSR Implementation Unit Tests\n");
    printf("========================================\n");
    
    test_csr_build();
    test_load_full();
    test_load_rows();
    test_ppi_step_full();
    test_ppi_step_partial();
    test_with_dangling_node();
    
    printf("\n========================================\n");
    printf("ALL TESTS COMPLETED\n");
    printf("========================================\n");
    
    printf("\nCleanup: Removing test files...\n");
    remove("test_file_links.txt");
    remove("test_P_CSR.bin");
    remove("test_nodes.txt");
    remove("test_dangling_links.txt");
    remove("test_dangling_CSR.bin");
    remove("test_dangling_nodes.txt");
    
    return 0;
}