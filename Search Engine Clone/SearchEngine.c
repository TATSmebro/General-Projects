#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <errno.h>

#include "CSR.h"
#include "PageRank.h"

#define LINE_LEN 4096

static const char *CSR_PATH   = "data/P_CSR.bin";
static const char *NODES_PATH = "data/nodes.txt";
static const char *RANK_PATH  = "data/pi/rank_iter.bin";

static void trim_newline(char *s) {
    if (!s) return;
    s[strcspn(s, "\r\n")] = 0;
}

static int print_ranks(const char *nodes_path,
                       const char *rank_path,
                       int NPROC,
                       int MAX_ITERS,
                       double alpha)
{
    // Count nodes 
    FILE *fn = fopen(nodes_path, "r");
    if (!fn) {
        fprintf(stderr, "Cannot open nodes file '%s': %s\n", nodes_path, strerror(errno));
        return -1;
    }

    int32_t n = 0;
    char line[LINE_LEN];
    while (fgets(line, sizeof(line), fn)) n++;
    fclose(fn);

    if (n <= 0) {
        fprintf(stderr, "Nodes file '%s' is empty\n", nodes_path);
        return -1;
    }

    // Read ranks 
    FILE *fr = fopen(rank_path, "rb");
    if (!fr) {
        fprintf(stderr, "Cannot open rank file '%s': %s\n", rank_path, strerror(errno));
        return -1;
    }

    double *r = (double *)malloc((size_t)n * sizeof(double));
    if (!r) {
        fprintf(stderr, "Out of memory reading ranks\n");
        fclose(fr);
        return -1;
    }

    size_t got = fread(r, sizeof(double), (size_t)n, fr);
    fclose(fr);

    if (got != (size_t)n) {
        fprintf(stderr, "rank_iter.bin short read (expected %d doubles, got %zu)\n", (int)n, got);
        free(r);
        return -1;
    }


    printf("\n=== PAGERANK RUN ===\n");
    printf("CSR:   %s\n", CSR_PATH);
    printf("Nodes: %s\n", nodes_path);
    printf("Ranks: %s\n", rank_path);
    printf("Params: NPROC=%d MAX_ITERS=%d alpha=%g\n\n", NPROC, MAX_ITERS, alpha);

    printf("%-4s  %-13s   %s\n", "idx", "pagerank", "file(path|name)");
    printf("----  -------------   -------------------------\n");


    fn = fopen(nodes_path, "r");
    if (!fn) {
        fprintf(stderr, "Cannot reopen nodes file '%s': %s\n", nodes_path, strerror(errno));
        free(r);
        return -1;
    }

    double sum = 0.0;
    for (int32_t i = 0; i < n; i++) {
        if (!fgets(line, sizeof(line), fn)) break;
        trim_newline(line);
        printf("%-4d  %-13.10f   %s\n", (int)i, r[i], line);
        sum += r[i];
    }
    fclose(fn);

    printf("\nSum(PageRank) = %.10f\n", sum);
    printf("====================\n\n");

    free(r);
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc != 5 && argc != 6) {
        fprintf(stderr,
                "Usage: %s <STRUCT_links.txt> <NPROC> <MAX_ITERS> <alpha> [DEBUG]\n",
                argv[0]);
        return 1;
    }

    const char *default_struct = argv[1];
    int NPROC = atoi(argv[2]);
    int MAX_ITERS = atoi(argv[3]);
    double alpha = atof(argv[4]);

    (void)argc;

    if (NPROC <= 0 || MAX_ITERS <= 0 || alpha < 0.0 || alpha > 1.0) {
        fprintf(stderr, "Invalid args: require NPROC>0, MAX_ITERS>0, 0<=alpha<=1\n");
        return 1;
    }

    int csr_ready = 0;
    char struct_path[LINE_LEN];

    snprintf(struct_path, sizeof(struct_path), "%s", default_struct);

    char cmd[LINE_LEN];

    printf("SearchEngine ready\n");
    printf("Commands: PAGERANK SETUP | PAGERANK RUN | QUIT\n");

    while (1) {
        printf("> ");
        if (!fgets(cmd, sizeof(cmd), stdin)) break;
        trim_newline(cmd);

        if (strcmp(cmd, "QUIT") == 0) {
            break;
        }

        if (strcmp(cmd, "PAGERANK SETUP") == 0) {
            printf("Path to STRUCT file (Enter = %s):\n", struct_path);
            printf("path> ");

            if (!fgets(cmd, sizeof(cmd), stdin)) continue;
            trim_newline(cmd);

            if (strlen(cmd) > 0) {
                snprintf(struct_path, sizeof(struct_path), "%s", cmd);
            }

            FILE *fp = fopen(struct_path, "r");
            if (!fp) {
                fprintf(stderr, "Invalid STRUCT file path '%s': %s\n", struct_path, strerror(errno));
                continue;
            }
            fclose(fp);

            if (csr_build_from_struct(struct_path, CSR_PATH, NODES_PATH) != 0) {
                fprintf(stderr, "CSR build failed\n");
                csr_ready = 0;
                continue;
            }

            csr_ready = 1;
            printf("SETUP complete\n");
            continue;
        }

        if (strcmp(cmd, "PAGERANK RUN") == 0) {
            if (!csr_ready) {
                printf("Run PAGERANK SETUP first\n");
                continue;
            }

            if (pagerank_run(CSR_PATH, NPROC, MAX_ITERS, alpha) != 0) {
                fprintf(stderr, "PageRank failed\n");
                continue;
            }


            print_ranks(NODES_PATH, RANK_PATH, NPROC, MAX_ITERS, alpha);
            continue;
        }

        printf("Unknown command\n");
    }

    printf("Goodbye\n");
    return 0;
}
