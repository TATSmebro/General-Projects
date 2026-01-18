#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/wait.h>

#include "CSR.h"

static void path_join(char *out, size_t out_sz, const char *dir, const char *file) {
    size_t len = strlen(dir);
    int needs_slash = (len > 0 && dir[len - 1] != '/');
    snprintf(out, out_sz, "%s%s%s", dir, needs_slash ? "/" : "", file);
}

static int ensure_dir(const char *dir) {
    if (mkdir(dir, 0777) == 0) return 0;
    if (errno == EEXIST) return 0;
    fprintf(stderr, "mkdir('%s') failed: %s\n", dir, strerror(errno));
    return -1;
}

static int file_exists(const char *path) {
    return access(path, F_OK) == 0;
}

static int32_t read_n_from_csr(const char *csr_path) {
    FILE *fp = fopen(csr_path, "rb");
    if (!fp) {
        fprintf(stderr, "Failed to open CSR '%s': %s\n", csr_path, strerror(errno));
        return -1;
    }
    int32_t n = -1, nnz = 0;
    if (fread(&n, sizeof(int32_t), 1, fp) != 1 ||
        fread(&nnz, sizeof(int32_t), 1, fp) != 1) {
        fprintf(stderr, "Failed to read CSR header from '%s'\n", csr_path);
        fclose(fp);
        return -1;
    }
    fclose(fp);
    return n;
}

static int write_uniform_rank(const char *rank_iter_path, int32_t n) {
    FILE *fp = fopen(rank_iter_path, "wb");
    if (!fp) {
        fprintf(stderr, "Failed to create '%s': %s\n", rank_iter_path, strerror(errno));
        return -1;
    }
    double v = (n > 0) ? (1.0 / (double)n) : 0.0;
    for (int32_t i = 0; i < n; i++) {
        if (fwrite(&v, sizeof(double), 1, fp) != 1) {
            fprintf(stderr, "Failed writing uniform rank\n");
            fclose(fp);
            return -1;
        }
    }
    fclose(fp);
    return 0;
}

static int concat_reduce_outputs(int iter_k_plus1,
                                 int NPROC,
                                 const char *rank_out_dir,
                                 const char *rank_iter_path)
{
    FILE *out = fopen(rank_iter_path, "wb");
    if (!out) {
        fprintf(stderr, "Failed to open '%s' for write: %s\n", rank_iter_path, strerror(errno));
        return -1;
    }

    unsigned char buf[1 << 16];
    char inpath[512];

    for (int r = 0; r < NPROC; r++) {
        snprintf(inpath, sizeof(inpath), "%s/rank_iter_%d_%d.bin", rank_out_dir, iter_k_plus1, r);

        FILE *in = fopen(inpath, "rb");
        if (!in) {
            fprintf(stderr, "Failed to open reduce output '%s': %s\n", inpath, strerror(errno));
            fclose(out);
            return -1;
        }

        size_t nread;
        while ((nread = fread(buf, 1, sizeof(buf), in)) > 0) {
            if (fwrite(buf, 1, nread, out) != nread) {
                fprintf(stderr, "Failed concatenating into '%s'\n", rank_iter_path);
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

void pr_map(int worker_id,
            int NPROC,
            int iter_k,
            const char *csr_path,
            const char *rank_iter_path,
            const char *tmp_dir)
{
    int32_t n_total = read_n_from_csr(csr_path);
    if (n_total <= 0) {
        fprintf(stderr, "pr_map[%d]: invalid n_total=%d\n", worker_id, (int)n_total);
        return;
    }

    int32_t start_row = (int32_t)((int64_t)worker_id * n_total / NPROC);
    int32_t end_row   = (int32_t)((int64_t)(worker_id + 1) * n_total / NPROC);

    CSR g_local;
    memset(&g_local, 0, sizeof(g_local));
    if (load_rows(csr_path, start_row, end_row, &g_local) != 0) {
        fprintf(stderr, "pr_map[%d]: load_rows(%d,%d) failed\n",
                worker_id, (int)start_row, (int)end_row);
        return;
    }

    double *pi_in = (double *)malloc((size_t)n_total * sizeof(double));
    if (!pi_in) {
        fprintf(stderr, "pr_map[%d]: malloc pi_in failed\n", worker_id);
        csr_free(&g_local);
        return;
    }

    FILE *fp_rank = fopen(rank_iter_path, "rb");
    if (!fp_rank) {
        fprintf(stderr, "pr_map[%d]: open '%s' failed: %s\n",
                worker_id, rank_iter_path, strerror(errno));
        free(pi_in);
        csr_free(&g_local);
        return;
    }

    if (fread(pi_in, sizeof(double), (size_t)n_total, fp_rank) != (size_t)n_total) {
        fprintf(stderr, "pr_map[%d]: short read '%s'\n", worker_id, rank_iter_path);
        fclose(fp_rank);
        free(pi_in);
        csr_free(&g_local);
        return;
    }
    fclose(fp_rank);

    double *pi_partial = (double *)calloc((size_t)n_total, sizeof(double));
    if (!pi_partial) {
        fprintf(stderr, "pr_map[%d]: calloc pi_partial failed\n", worker_id);
        free(pi_in);
        csr_free(&g_local);
        return;
    }

    double local_dangling = 0.0;
    ppi_step_partial(&g_local, pi_in, start_row, end_row, pi_partial, &local_dangling);

    char path_vec[512];
    snprintf(path_vec, sizeof(path_vec), "%s/map_%d_%d.bin", tmp_dir, iter_k, worker_id);

    FILE *fp_out = fopen(path_vec, "wb");
    if (!fp_out) {
        fprintf(stderr, "pr_map[%d]: open '%s' failed: %s\n",
                worker_id, path_vec, strerror(errno));
        free(pi_partial);
        free(pi_in);
        csr_free(&g_local);
        return;
    }

    fwrite(pi_partial, sizeof(double), (size_t)n_total, fp_out);
    fclose(fp_out);

    char path_d[512];
    snprintf(path_d, sizeof(path_d), "%s/map_%d_%d_dangling.bin", tmp_dir, iter_k, worker_id);

    FILE *fp_d = fopen(path_d, "wb");
    if (!fp_d) {
        fprintf(stderr, "pr_map[%d]: open '%s' failed: %s\n",
                worker_id, path_d, strerror(errno));
        free(pi_partial);
        free(pi_in);
        csr_free(&g_local);
        return;
    }

    fwrite(&local_dangling, sizeof(double), 1, fp_d);
    fclose(fp_d);

    free(pi_partial);
    free(pi_in);
    csr_free(&g_local);
}

void pr_reduce(int reducer_id,
               int NPROC,
               int iter_k,
               int32_t n_total,
               double alpha,
               const char *tmp_dir,
               const char *rank_out_dir)
{
    int32_t start_idx = (int32_t)((int64_t)reducer_id * n_total / NPROC);
    int32_t end_idx   = (int32_t)((int64_t)(reducer_id + 1) * n_total / NPROC);
    int32_t L = end_idx - start_idx;

    double *link_sum = (L > 0) ? (double *)calloc((size_t)L, sizeof(double)) : NULL;
    if (L > 0 && !link_sum) {
        fprintf(stderr, "pr_reduce[%d]: calloc link_sum failed\n", reducer_id);
        return;
    }

    double *pi_partial = (double *)malloc((size_t)n_total * sizeof(double));
    if (!pi_partial) {
        fprintf(stderr, "pr_reduce[%d]: malloc pi_partial failed\n", reducer_id);
        free(link_sum);
        return;
    }

    double total_dangling = 0.0;

    for (int W = 0; W < NPROC; W++) {
        char path_vec[512];
        snprintf(path_vec, sizeof(path_vec), "%s/map_%d_%d.bin", tmp_dir, iter_k, W);

        FILE *fp = fopen(path_vec, "rb");
        if (!fp) {
            fprintf(stderr, "pr_reduce[%d]: open '%s' failed: %s\n",
                    reducer_id, path_vec, strerror(errno));
            free(pi_partial);
            free(link_sum);
            return;
        }

        if (fread(pi_partial, sizeof(double), (size_t)n_total, fp) != (size_t)n_total) {
            fprintf(stderr, "pr_reduce[%d]: short read '%s'\n", reducer_id, path_vec);
            fclose(fp);
            free(pi_partial);
            free(link_sum);
            return;
        }
        fclose(fp);

        for (int32_t j = start_idx; j < end_idx; j++) {
            link_sum[j - start_idx] += pi_partial[j];
        }

        char path_d[512];
        snprintf(path_d, sizeof(path_d), "%s/map_%d_%d_dangling.bin", tmp_dir, iter_k, W);

        FILE *fd = fopen(path_d, "rb");
        if (!fd) {
            fprintf(stderr, "pr_reduce[%d]: open '%s' failed: %s\n",
                    reducer_id, path_d, strerror(errno));
            free(pi_partial);
            free(link_sum);
            return;
        }

        double dW = 0.0;
        if (fread(&dW, sizeof(double), 1, fd) != 1) {
            fprintf(stderr, "pr_reduce[%d]: read dangling failed '%s'\n",
                    reducer_id, path_d);
            fclose(fd);
            free(pi_partial);
            free(link_sum);
            return;
        }
        fclose(fd);

        total_dangling += dW;
    }

    double n_inv = 1.0 / (double)n_total;
    double random_part   = alpha * n_inv;
    double dangling_part = (1.0 - alpha) * total_dangling * n_inv;

    char path_out[512];
    snprintf(path_out, sizeof(path_out), "%s/rank_iter_%d_%d.bin", rank_out_dir, iter_k + 1, reducer_id);

    FILE *fo = fopen(path_out, "wb");
    if (!fo) {
        fprintf(stderr, "pr_reduce[%d]: open '%s' failed: %s\n",
                reducer_id, path_out, strerror(errno));
        free(pi_partial);
        free(link_sum);
        return;
    }

    for (int32_t t = 0; t < L; t++) {
        double val = random_part + dangling_part + (1.0 - alpha) * link_sum[t];
        fwrite(&val, sizeof(double), 1, fo);
    }

    fclose(fo);
    free(pi_partial);
    free(link_sum);
}

int pagerank_run(const char *csr_path, int NPROC, int MAX_ITERS, double alpha) {
    const char *tmp_dir = "data/tmp";
    const char *pi_dir  = "data/pi";
    const char *rank_iter_path = "data/pi/rank_iter.bin";

    if (ensure_dir("data") != 0) return -1;
    if (ensure_dir(tmp_dir) != 0) return -1;
    if (ensure_dir(pi_dir) != 0) return -1;

    int32_t n_total = read_n_from_csr(csr_path);
    if (n_total <= 0) return -1;

    if (!file_exists(rank_iter_path)) {
        if (write_uniform_rank(rank_iter_path, n_total) != 0) return -1;
    }

    // ==============================
    // Fork a dedicated MASTER process
    // ==============================
    pid_t master_pid = fork();
    if (master_pid < 0) {
        perror("fork(master)");
        return -1;
    }

    if (master_pid == 0) {
        // ==============================
        // MASTER PROCESS: orchestrates k iterations
        // ==============================
        for (int k = 0; k < MAX_ITERS; k++) {
            pid_t pids[256];

            if (NPROC > (int)(sizeof(pids) / sizeof(pids[0]))) {
                fprintf(stderr, "pagerank_run(master): NPROC too large\n");
                _exit(1);
            }

            // ---- MAP PHASE ----
            for (int w = 0; w < NPROC; w++) {
                pid_t pid = fork();
                if (pid == 0) {
                    pr_map(w, NPROC, k, csr_path, rank_iter_path, tmp_dir);
                    _exit(0);
                }
                if (pid < 0) {
                    perror("fork(map)");
                    _exit(1);
                }
                pids[w] = pid;
            }

            for (int w = 0; w < NPROC; w++) {
                int st = 0;
                if (waitpid(pids[w], &st, 0) < 0) {
                    perror("waitpid(map)");
                    _exit(1);
                }
                if (!WIFEXITED(st) || WEXITSTATUS(st) != 0) {
                    fprintf(stderr, "pagerank_run(master): map worker %d failed\n", w);
                    _exit(1);
                }
            }

            // ---- REDUCE PHASE ----
            for (int r = 0; r < NPROC; r++) {
                pid_t pid = fork();
                if (pid == 0) {
                    pr_reduce(r, NPROC, k, n_total, alpha, tmp_dir, pi_dir);
                    _exit(0);
                }
                if (pid < 0) {
                    perror("fork(reduce)");
                    _exit(1);
                }
                pids[r] = pid;
            }

            for (int r = 0; r < NPROC; r++) {
                int st = 0;
                if (waitpid(pids[r], &st, 0) < 0) {
                    perror("waitpid(reduce)");
                    _exit(1);
                }
                if (!WIFEXITED(st) || WEXITSTATUS(st) != 0) {
                    fprintf(stderr, "pagerank_run(master): reduce worker %d failed\n", r);
                    _exit(1);
                }
            }

            // Consolidate rank_iter_{k+1}_R.bin -> rank_iter.bin
            if (concat_reduce_outputs(k + 1, NPROC, pi_dir, rank_iter_path) != 0) {
                _exit(1);
            }
        }

        // Master finished successfully
        _exit(0);
    }

    // ==============================
    // USER/MAIN PROCESS: waits for master
    // ==============================
    int st = 0;
    if (waitpid(master_pid, &st, 0) < 0) {
        perror("waitpid(master)");
        return -1;
    }
    if (!WIFEXITED(st) || WEXITSTATUS(st) != 0) {
        fprintf(stderr, "pagerank_run: master process failed\n");
        return -1;
    }

    return 0;
}
