#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <errno.h>
#include <sys/stat.h>

#include "CSR.h"

#define EPSILON 1e-6

void pr_map(int worker_id, int NPROC, int iter_k,
            const char *csr_path, const char *rank_iter_path, const char *tmp_dir);

void pr_reduce(int reducer_id, int NPROC, int iter_k,
               int32_t n_total, double alpha,
               const char *tmp_dir, const char *rank_out_dir);

void print_test_header(const char *test_name) {
    printf("\n========================================\n");
    printf("TEST: %s\n", test_name);
    printf("========================================\n");
}

void print_pass() { printf("PASSED\n"); }

void print_fail(const char *reason) { printf("FAILED: %s\n", reason); }

static int ensure_dir(const char *dir) {
    if (mkdir(dir, 0777) == 0) return 0;
    if (errno == EEXIST) return 0;
    return -1;
}

static int32_t read_n_from_csr(const char *csr_path) {
    FILE *fp = fopen(csr_path, "rb");
    if (!fp) return -1;
    int32_t n = -1, nnz = 0;
    if (fread(&n, sizeof(int32_t), 1, fp) != 1 ||
        fread(&nnz, sizeof(int32_t), 1, fp) != 1) {
        fclose(fp);
        return -1;
    }
    fclose(fp);
    return n;
}

static int write_uniform_rank(const char *rank_iter_path, int32_t n) {
    FILE *fp = fopen(rank_iter_path, "wb");
    if (!fp) return -1;
    double v = (n > 0) ? (1.0 / (double)n) : 0.0;
    for (int32_t i = 0; i < n; i++) {
        if (fwrite(&v, sizeof(double), 1, fp) != 1) {
            fclose(fp);
            return -1;
        }
    }
    fclose(fp);
    return 0;
}

static int concat_reduce_outputs(int iter_k_plus1, int NPROC,
                                 const char *rank_out_dir,
                                 const char *rank_iter_path)
{
    FILE *out = fopen(rank_iter_path, "wb");
    if (!out) return -1;

    unsigned char buf[1 << 16];
    for (int r = 0; r < NPROC; r++) {
        char inpath[512];
        snprintf(inpath, sizeof(inpath), "%s/rank_iter_%d_%d.bin",
                 rank_out_dir, iter_k_plus1, r);

        FILE *in = fopen(inpath, "rb");
        if (!in) { fclose(out); return -1; }

        size_t nread;
        while ((nread = fread(buf, 1, sizeof(buf), in)) > 0) {
            if (fwrite(buf, 1, nread, out) != nread) {
                fclose(in);
                fclose(out);
                return -1;
            }
        }
        fclose(in);
    }
    fclose(out);
    return 0;
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

static void test_pagerank_build_inputs(void) {
    print_test_header("PageRank: Build CSR + init directories");

    const char *test_file  = "test_file_links.txt";
    const char *csr_file   = "data/P_CSR.bin";
    const char *nodes_file = "test_nodes.txt";

    if (ensure_dir("data") != 0 || ensure_dir("data/tmp") != 0 || ensure_dir("data/pi") != 0) {
        print_fail("Could not create data/, data/tmp, data/pi");
        return;
    }

    if (create_test_file_links(test_file) != 0) {
        print_fail("Could not create test struct file");
        return;
    }

    if (csr_build_from_struct(test_file, csr_file, nodes_file) != 0) {
        print_fail("csr_build_from_struct returned error");
        return;
    }

    int32_t n = read_n_from_csr(csr_file);
    printf("CSR n = %d (expected: 5)\n", (int)n);

    if (n == 5) print_pass();
    else print_fail("CSR n mismatch");
}

static void test_pagerank_one_iter(void) {
    print_test_header("PageRank: 1 iteration (map+reduce+concat), alpha=0.15, NPROC=2");

    const char *csr_file = "data/P_CSR.bin";
    const char *rank_path = "data/pi/rank_iter.bin";
    const char *tmp_dir = "data/tmp";
    const char *pi_dir  = "data/pi";

    const int NPROC = 2;
    const int iter_k = 0;
    const double alpha = 0.15;

    int32_t n = read_n_from_csr(csr_file);
    if (n != 5) {
        print_fail("Expected CSR n=5; did you run build test first?");
        return;
    }

    if (write_uniform_rank(rank_path, n) != 0) {
        print_fail("Could not write initial rank_iter.bin");
        return;
    }

    for (int w = 0; w < NPROC; w++) {
        pr_map(w, NPROC, iter_k, csr_file, rank_path, tmp_dir);
    }

    for (int r = 0; r < NPROC; r++) {
        pr_reduce(r, NPROC, iter_k, n, alpha, tmp_dir, pi_dir);
    }

    if (concat_reduce_outputs(iter_k + 1, NPROC, pi_dir, rank_path) != 0) {
        print_fail("Concatenation failed");
        return;
    }

    double out[5] = {0};
    FILE *fp = fopen(rank_path, "rb");
    if (!fp) {
        print_fail("Could not open data/pi/rank_iter.bin");
        return;
    }
    if (fread(out, sizeof(double), 5, fp) != 5) {
        fclose(fp);
        print_fail("Short read of rank_iter.bin");
        return;
    }
    fclose(fp);

    // Expected for this graph, uniform pi_in, alpha=0.15:
    // pi_out = 0.85*(P*pi) + 0.03, with dangling=0
    double expected[5] = {
        77.0/300.0,
        103.0/600.0,
        57.0/200.0,
        103.0/600.0,
        23.0/200.0
    };

    double sum = 0.0;
    for (int i = 0; i < 5; i++) sum += out[i];

    printf("Computed pi(1): [%.9f, %.9f, %.9f, %.9f, %.9f]\n",
           out[0], out[1], out[2], out[3], out[4]);
    printf("Expected pi(1): [%.9f, %.9f, %.9f, %.9f, %.9f]\n",
           expected[0], expected[1], expected[2], expected[3], expected[4]);
    printf("Sum(pi(1)) = %.12f (expected ~1.0)\n", sum);

    int pass = 1;
    for (int i = 0; i < 5; i++) {
        if (fabs(out[i] - expected[i]) > EPSILON) {
            pass = 0;
            printf("Mismatch at index %d: got %.9f, expected %.9f\n",
                   i, out[i], expected[i]);
        }
    }
    if (fabs(sum - 1.0) > 1e-6) pass = 0;

    if (pass) print_pass();
    else print_fail("PageRank 1-iter output mismatch");
}

static void test_pagerank_with_dangling(void) {
    print_test_header("PageRank: Dangling node mass is handled (2-node graph)");

    const char *struct_file = "test_dangling_links.txt";
    const char *csr_file    = "data/dangling_P_CSR.bin";
    const char *nodes_file  = "test_dangling_nodes.txt";

    const char *tmp_dir = "data/tmp";
    const char *pi_dir  = "data/pi";
    const char *rank_path = "data/pi/rank_iter.bin"; // reused

    const int NPROC = 2;
    const int iter_k = 0;
    const double alpha = 0.15;

    FILE *fp = fopen(struct_file, "w");
    if (!fp) { print_fail("Could not create dangling struct file"); return; }

    fprintf(fp, "files/0.txt|0.txt|[1.txt]|[1.txt]\n");
    fprintf(fp, "files/1.txt|1.txt|[0.txt]|[]\n");
    fclose(fp);

    if (csr_build_from_struct(struct_file, csr_file, nodes_file) != 0) {
        print_fail("csr_build_from_struct failed for dangling graph");
        return;
    }

    int32_t n = read_n_from_csr(csr_file);
    if (n != 2) {
        print_fail("Dangling CSR n != 2");
        return;
    }

    if (write_uniform_rank(rank_path, n) != 0) {
        print_fail("Could not write initial rank_iter.bin for dangling test");
        return;
    }

    for (int w = 0; w < NPROC; w++) pr_map(w, NPROC, iter_k, csr_file, rank_path, tmp_dir);
    for (int r = 0; r < NPROC; r++) pr_reduce(r, NPROC, iter_k, n, alpha, tmp_dir, pi_dir);
    if (concat_reduce_outputs(iter_k + 1, NPROC, pi_dir, rank_path) != 0) {
        print_fail("Concatenation failed (dangling)");
        return;
    }

    double out[2] = {0};
    FILE *fr = fopen(rank_path, "rb");
    if (!fr) { print_fail("Could not open rank_iter.bin (dangling)"); return; }
    if (fread(out, sizeof(double), 2, fr) != 2) {
        fclose(fr);
        print_fail("Short read rank_iter.bin (dangling)");
        return;
    }
    fclose(fr);

    double sum = out[0] + out[1];
    printf("Computed pi(1): [%.9f, %.9f]\n", out[0], out[1]);
    printf("Sum(pi(1)) = %.12f (expected ~1.0)\n", sum);

    if (out[0] < -EPSILON || out[1] < -EPSILON) {
        print_fail("Negative pagerank detected");
        return;
    }
    if (fabs(sum - 1.0) > 1e-6) {
        print_fail("Sum not ~1.0 (dangling)");
        return;
    }

    print_pass();
}

int main(void) {
    printf("========================================\n");
    printf("PageRank Implementation Unit Tests\n");
    printf("========================================\n");

    test_pagerank_build_inputs();
    test_pagerank_one_iter();
    test_pagerank_with_dangling();

    printf("\n========================================\n");
    printf("ALL TESTS COMPLETED\n");
    printf("========================================\n");

    printf("\nCleanup: Removing test files...\n");
    remove("test_file_links.txt");
    remove("test_nodes.txt");
    remove("test_dangling_links.txt");
    remove("test_dangling_nodes.txt");
    remove("data/P_CSR.bin");
    remove("data/dangling_P_CSR.bin");

    return 0;
}
