#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <math.h>

#define EPSILON_MIN 1e-5

// CSR structure definition
typedef struct {
    int32_t n;           // number of files (rows)
    int32_t nnz;         // number of non-zero edges
    int32_t *row_ptr;    // length n+1
    int32_t *col_idx;    // length nnz
    int32_t *outdeg;     // length n
} CSR;

// Helper function to count lines in a file
static int32_t count_lines(const char *filepath) {
    FILE *fp = fopen(filepath, "r");
    if (!fp) return -1;
    
    int32_t count = 0;
    char buffer[4096];
    while (fgets(buffer, sizeof(buffer), fp)) {
        count++;
    }
    fclose(fp);
    return count;
}

// Helper function to parse a single line from struct file
// Returns: 0 on success, -1 on failure
static int parse_line(char *line, char *filepath, char *filename, 
                     char **outlinks, int32_t *outlink_count) {
    *outlink_count = 0;
    
    // Format: <file path>|<file name>|[<inlinks>]|[<outlinks>]
    char *token = strtok(line, "|");
    if (!token) return -1;
    strcpy(filepath, token);
    
    token = strtok(NULL, "|");
    if (!token) return -1;
    strcpy(filename, token);
    
    // Skip inlinks
    token = strtok(NULL, "|");
    if (!token) return -1;
    
    // Parse outlinks
    token = strtok(NULL, "|");
    if (!token) return -1;
    
    // Remove brackets and parse comma-separated values
    char *start = strchr(token, '[');
    char *end = strchr(token, ']');
    if (!start || !end) return -1;
    
    start++; // Skip opening bracket
    *end = '\0'; // Remove closing bracket
    
    if (start < end && *start != '\0') {
        char *outlink = strtok(start, ",");
        while (outlink && *outlink_count < 1000) { // Max 1000 outlinks
            // Trim whitespace
            while (*outlink == ' ') outlink++;
            outlinks[*outlink_count] = strdup(outlink);
            (*outlink_count)++;
            outlink = strtok(NULL, ",");
        }
    }
    
    return 0;
}

// Build CSR from Part 1 output, and write graph + nodes files
int csr_build_from_struct(const char *struct_path,
                         const char *csr_out_path,
                         const char *nodes_out_path) {
    // Count total number of files
    int32_t n = count_lines(struct_path);
    if (n <= 0) {
        fprintf(stderr, "Error: Could not read struct file\n");
        return -1;
    }
    
    // Allocate temporary storage
    char **filenames = malloc(n * sizeof(char*));
    if (!filenames) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        return -1;
    }
    
    char **filepaths = malloc(n * sizeof(char*));
    if (!filepaths) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(filenames);
        return -1;
    }
    
    char ***outlinks_array = malloc(n * sizeof(char**));
    if (!outlinks_array) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(filenames);
        free(filepaths);
        return -1;
    }
    
    int32_t *outlink_counts = calloc(n, sizeof(int32_t));
    if (!outlink_counts) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(filenames);
        free(filepaths);
        free(outlinks_array);
        return -1;
    }
    
    for (int i = 0; i < n; i++) {
        filenames[i] = malloc(256);
        if (!filenames[i]) {
            fprintf(stderr, "Error: Memory allocation failed\n");
            for (int j = 0; j < i; j++) {
                free(filenames[j]);
                free(filepaths[j]);
                free(outlinks_array[j]);
            }
            free(filenames);
            free(filepaths);
            free(outlinks_array);
            free(outlink_counts);
            return -1;
        }
        
        filepaths[i] = malloc(512);
        if (!filepaths[i]) {
            fprintf(stderr, "Error: Memory allocation failed\n");
            free(filenames[i]);
            for (int j = 0; j < i; j++) {
                free(filenames[j]);
                free(filepaths[j]);
                free(outlinks_array[j]);
            }
            free(filenames);
            free(filepaths);
            free(outlinks_array);
            free(outlink_counts);
            return -1;
        }
        
        outlinks_array[i] = malloc(1000 * sizeof(char*));
        if (!outlinks_array[i]) {
            fprintf(stderr, "Error: Memory allocation failed\n");
            free(filenames[i]);
            free(filepaths[i]);
            for (int j = 0; j < i; j++) {
                free(filenames[j]);
                free(filepaths[j]);
                free(outlinks_array[j]);
            }
            free(filenames);
            free(filepaths);
            free(outlinks_array);
            free(outlink_counts);
            return -1;
        }
    }
    
    // Read the struct file
    FILE *fp = fopen(struct_path, "r");
    if (!fp) {
        fprintf(stderr, "Error: Could not open struct file\n");
        return -1;
    }
    
    char line[8192];
    int32_t idx = 0;
    while (fgets(line, sizeof(line), fp) && idx < n) {
        // Remove newline
        line[strcspn(line, "\n")] = 0;
        
        if (parse_line(line, filepaths[idx], filenames[idx], 
                      outlinks_array[idx], &outlink_counts[idx]) != 0) {
            fprintf(stderr, "Error parsing line %d\n", idx);
        }
        idx++;
    }
    fclose(fp);
    
    // Write nodes file (index to filename/filepath mapping)
    FILE *nodes_fp = fopen(nodes_out_path, "w");
    if (!nodes_fp) {
        fprintf(stderr, "Error: Could not open nodes output file\n");
        return -1;
    }
    for (int i = 0; i < n; i++) {
        fprintf(nodes_fp, "%s|%s\n", filepaths[i], filenames[i]);
    }
    fclose(nodes_fp);
    
    // Build filename to index mapping
    // Using a hash table reduces complexity from O(n^2 * avg_outdeg) to O(n + nnz)
    int32_t table_size = n * 2; // 2x for good load factor
    typedef struct {
        char *key;
        int32_t value;
    } HashEntry;
    HashEntry *hash_table = calloc(table_size, sizeof(HashEntry));
    if (!hash_table) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        return -1;
    }
    
    // Insert all filenames into hash table
    for (int i = 0; i < n; i++) {
        // Simple hash function (djb2)
        unsigned long hash = 5381;
        const char *str = filenames[i];
        int c;
        while ((c = *str++))
            hash = ((hash << 5) + hash) + c;
        hash = hash % table_size;
        
        // Linear probing
        while (hash_table[hash].key != NULL) {
            hash = (hash + 1) % table_size;
        }
        hash_table[hash].key = filenames[i];
        hash_table[hash].value = i;
    }
    
    // Build CSR structure (transpose: P^T where we store outlinks as rows)
    // Count total non-zero entries
    int32_t nnz = 0;
    for (int i = 0; i < n; i++) {
        nnz += outlink_counts[i];
    }
    
    // Allocate CSR arrays
    int32_t *row_ptr = malloc((n + 1) * sizeof(int32_t));
    if (!row_ptr) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(hash_table);
        return -1;
    }
    
    int32_t *col_idx = malloc(nnz * sizeof(int32_t));
    if (!col_idx) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(row_ptr);
        free(hash_table);
        return -1;
    }
    
    int32_t *outdeg = malloc(n * sizeof(int32_t));
    if (!outdeg) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(row_ptr);
        free(col_idx);
        free(hash_table);
        return -1;
    }
    
    // Build row_ptr and col_idx using hash table lookup
    row_ptr[0] = 0;
    int32_t current_pos = 0;
    
    for (int i = 0; i < n; i++) {
        int32_t resolved_count = 0;
        
        // For each outlink, find its index using hash table
        for (int j = 0; j < outlink_counts[i]; j++) {
            // Hash lookup
            unsigned long hash = 5381;
            const char *str = outlinks_array[i][j];
            int c;
            while ((c = *str++))
                hash = ((hash << 5) + hash) + c;
            hash = hash % table_size;
            
            // Linear probing to find the key
            int32_t dest_idx = -1;
            while (hash_table[hash].key != NULL) {
                if (strcmp(hash_table[hash].key, outlinks_array[i][j]) == 0) {
                    dest_idx = hash_table[hash].value;
                    break;
                }
                hash = (hash + 1) % table_size;
            }
            
            if (dest_idx >= 0) {
                col_idx[current_pos++] = dest_idx;
                resolved_count++;
            }
        }
        
        // Store only resolved link count
        outdeg[i] = resolved_count;
        row_ptr[i + 1] = current_pos;
    }
    
    // Update nnz to actual number of edges stored (excluding unresolved links)
    nnz = current_pos;
    
    free(hash_table);
    
    // Write CSR to binary file
    FILE *csr_fp = fopen(csr_out_path, "wb");
    if (!csr_fp) {
        fprintf(stderr, "Error: Could not open CSR output file\n");
        return -1;
    }
    
    // Write header
    fwrite(&n, sizeof(int32_t), 1, csr_fp);
    fwrite(&nnz, sizeof(int32_t), 1, csr_fp);
    
    // Write arrays
    fwrite(row_ptr, sizeof(int32_t), n + 1, csr_fp);
    fwrite(col_idx, sizeof(int32_t), nnz, csr_fp);
    fwrite(outdeg, sizeof(int32_t), n, csr_fp);
    
    fclose(csr_fp);
    
    // Cleanup
    for (int i = 0; i < n; i++) {
        free(filenames[i]);
        free(filepaths[i]);
        for (int j = 0; j < outlink_counts[i]; j++) {
            free(outlinks_array[i][j]);
        }
        free(outlinks_array[i]);
    }
    free(filenames);
    free(filepaths);
    free(outlinks_array);
    free(outlink_counts);
    free(row_ptr);
    free(col_idx);
    free(outdeg);
    
    printf("CSR built successfully: n=%d, nnz=%d\n", n, nnz);
    return 0;
}

// Load the entire CSR from file into memory
int load_full(const char *csr_path, CSR *g_out) {
    FILE *fp = fopen(csr_path, "rb");
    if (!fp) {
        fprintf(stderr, "Error: Could not open CSR file\n");
        return -1;
    }
    
    // Read header
    fread(&g_out->n, sizeof(int32_t), 1, fp);
    fread(&g_out->nnz, sizeof(int32_t), 1, fp);
    
    // Allocate and read arrays
    g_out->row_ptr = malloc((g_out->n + 1) * sizeof(int32_t));
    if (!g_out->row_ptr) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        fclose(fp);
        return -1;
    }
    
    g_out->col_idx = malloc(g_out->nnz * sizeof(int32_t));
    if (!g_out->col_idx) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(g_out->row_ptr);
        fclose(fp);
        return -1;
    }
    
    g_out->outdeg = malloc(g_out->n * sizeof(int32_t));
    if (!g_out->outdeg) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(g_out->row_ptr);
        free(g_out->col_idx);
        fclose(fp);
        return -1;
    }
    
    fread(g_out->row_ptr, sizeof(int32_t), g_out->n + 1, fp);
    fread(g_out->col_idx, sizeof(int32_t), g_out->nnz, fp);
    fread(g_out->outdeg, sizeof(int32_t), g_out->n, fp);
    
    fclose(fp);
    return 0;
}

// Load partial CSR for rows [start_row, end_row)
int load_rows(const char *csr_path,
             int32_t start_row,
             int32_t end_row,
             CSR *g_partial_out) {
    FILE *fp = fopen(csr_path, "rb");
    if (!fp) {
        fprintf(stderr, "Error: Could not open CSR file\n");
        return -1;
    }
    
    // Read header to get total n and nnz
    int32_t total_n, total_nnz;
    fread(&total_n, sizeof(int32_t), 1, fp);
    fread(&total_nnz, sizeof(int32_t), 1, fp);
    
    if (start_row < 0 || end_row > total_n || start_row >= end_row) {
        fprintf(stderr, "Error: Invalid row range\n");
        fclose(fp);
        return -1;
    }
    
    // Read full row_ptr to determine offsets
    int32_t *full_row_ptr = malloc((total_n + 1) * sizeof(int32_t));
    if (!full_row_ptr) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        fclose(fp);
        return -1;
    }
    fread(full_row_ptr, sizeof(int32_t), total_n + 1, fp);
    
    // Determine size of partial data
    int32_t partial_n = end_row - start_row;
    int32_t start_nnz = full_row_ptr[start_row];
    int32_t end_nnz = full_row_ptr[end_row];
    int32_t partial_nnz = end_nnz - start_nnz;
    
    // Allocate partial arrays
    g_partial_out->n = partial_n;
    g_partial_out->nnz = partial_nnz;
    g_partial_out->row_ptr = malloc((partial_n + 1) * sizeof(int32_t));
    if (!g_partial_out->row_ptr) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(full_row_ptr);
        fclose(fp);
        return -1;
    }
    
    g_partial_out->col_idx = malloc(partial_nnz * sizeof(int32_t));
    if (!g_partial_out->col_idx) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(g_partial_out->row_ptr);
        free(full_row_ptr);
        fclose(fp);
        return -1;
    }
    
    g_partial_out->outdeg = malloc(partial_n * sizeof(int32_t));
    if (!g_partial_out->outdeg) {
        fprintf(stderr, "Error: Memory allocation failed\n");
        free(g_partial_out->row_ptr);
        free(g_partial_out->col_idx);
        free(full_row_ptr);
        fclose(fp);
        return -1;
    }
    
    // Copy and adjust row_ptr
    for (int32_t i = 0; i <= partial_n; i++) {
        g_partial_out->row_ptr[i] = full_row_ptr[start_row + i] - start_nnz;
    }
    
    // Seek to col_idx data and read partial
    long col_idx_offset = sizeof(int32_t) * 2 + sizeof(int32_t) * (total_n + 1) + 
                          sizeof(int32_t) * start_nnz;
    fseek(fp, col_idx_offset, SEEK_SET);
    fread(g_partial_out->col_idx, sizeof(int32_t), partial_nnz, fp);
    
    // Seek to outdeg data and read partial
    long outdeg_offset = sizeof(int32_t) * 2 + sizeof(int32_t) * (total_n + 1) + 
                         sizeof(int32_t) * total_nnz + sizeof(int32_t) * start_row;
    fseek(fp, outdeg_offset, SEEK_SET);
    fread(g_partial_out->outdeg, sizeof(int32_t), partial_n, fp);
    
    free(full_row_ptr);
    fclose(fp);
    return 0;
}

// Free CSR heap allocations
void csr_free(CSR *g) {
    if (g) {
        free(g->row_ptr);
        free(g->col_idx);
        free(g->outdeg);
        g->row_ptr = NULL;
        g->col_idx = NULL;
        g->outdeg = NULL;
        g->n = 0;
        g->nnz = 0;
    }
}

// Full P * pi (all rows), also returns dangling mass
void ppi_step_full(const CSR *g,
                  const double *pi_in,
                  double *pi_out,
                  double *dangling_out) {
    // Initialize output
    for (int32_t i = 0; i < g->n; i++) {
        pi_out[i] = 0.0;
    }
    
    double dangling = 0.0;
    
    // For each source row i
    for (int32_t i = 0; i < g->n; i++) {
        if (g->outdeg[i] == 0) {
            // Dangling node: accumulate its mass
            dangling += pi_in[i];
        } else {
            // Compute mass to distribute: pi_in[i] / outdeg[i]
            double mass = pi_in[i] / (double)g->outdeg[i];
            
            // Distribute to all destination nodes
            for (int32_t k = g->row_ptr[i]; k < g->row_ptr[i + 1]; k++) {
                int32_t j = g->col_idx[k];
                pi_out[j] += mass;
            }
        }
    }
    
    if (dangling_out) {
        *dangling_out = dangling;
    }
}

// Partial P * pi for rows [start_row, end_row)
void ppi_step_partial(const CSR *g,
                     const double *pi_in,
                     int32_t start_row,
                     int32_t end_row,
                     double *pi_out,
                     double *dangling_out) {
    double local_dangling = 0.0;
    
    // Note: g is a partial CSR with adjusted indices
    // So we iterate through local indices 0 to (end_row - start_row)
    int32_t local_n = end_row - start_row;
    
    for (int32_t local_i = 0; local_i < local_n; local_i++) {
        int32_t global_i = start_row + local_i;
        
        if (g->outdeg[local_i] == 0) {
            // Dangling node
            local_dangling += pi_in[global_i];
        } else {
            // Compute mass to distribute
            double mass = pi_in[global_i] / (double)g->outdeg[local_i];
            
            // Distribute to all destination nodes (using global indices)
            for (int32_t k = g->row_ptr[local_i]; k < g->row_ptr[local_i + 1]; k++) {
                int32_t j = g->col_idx[k]; // This is a global index
                pi_out[j] += mass;
            }
        }
    }
    
    if (dangling_out) {
        *dangling_out = local_dangling;
    }
}