#ifndef CSR_H
#define CSR_H

#include <stdint.h>

// Compressed Sparse Row (CSR) matrix structure
// Stores only non-zero elements for efficient sparse matrix operations
typedef struct {
    int32_t n;           // number of files (rows)
    int32_t nnz;         // number of non-zero edges
    int32_t *row_ptr;    // length n+1, stores row start indices in col_idx
    int32_t *col_idx;    // length nnz, stores column indices of non-zero elements
    int32_t *outdeg;     // length n, stores outdegree for each node
} CSR;

/**
 * Build CSR matrix from Part 1 output file and write to binary files.
 * 
 * @param struct_path Path to the STRUCT_N_file_links.txt file from Part 1
 * @param csr_out_path Path where binary CSR matrix will be written (e.g., "data/P_CSR.bin")
 * @param nodes_out_path Path where nodes mapping file will be written (e.g., "data/nodes.txt")
 * @return 0 on success, -1 on failure
 */
int csr_build_from_struct(const char *struct_path,
                         const char *csr_out_path,
                         const char *nodes_out_path);

/**
 * Load the entire CSR matrix from binary file into memory.
 * 
 * @param csr_path Path to the binary CSR file (e.g., "data/P_CSR.bin")
 * @param g_out Pointer to CSR structure to populate (will allocate memory)
 * @return 0 on success, -1 on failure
 */
int load_full(const char *csr_path, CSR *g_out);

/**
 * Load a partial range of rows from CSR binary file into memory.
 * Creates a self-contained CSR structure for the specified row range.
 * 
 * @param csr_path Path to the binary CSR file (e.g., "data/P_CSR.bin")
 * @param start_row Starting row index (inclusive)
 * @param end_row Ending row index (exclusive)
 * @param g_partial_out Pointer to CSR structure to populate (will allocate memory)
 *                      Note: g_partial_out->n will be (end_row - start_row)
 *                            and row_ptr[0] will be 0 (self-contained)
 * @return 0 on success, -1 on failure
 */
int load_rows(const char *csr_path,
             int32_t start_row,
             int32_t end_row,
             CSR *g_partial_out);

/**
 * Free all dynamically allocated memory in a CSR structure.
 * 
 * @param g Pointer to CSR structure to free
 */
void csr_free(CSR *g);

/**
 * Compute P * pi for all rows using the full CSR matrix.
 * This performs sparse matrix-vector multiplication.
 * 
 * @param g Pointer to full CSR matrix
 * @param pi_in Input PageRank vector (length g->n)
 * @param pi_out Output result vector (length g->n, must be pre-zeroed)
 * @param dangling_out Pointer to store dangling mass (sum of pi_in for dangling nodes)
 *                     Can be NULL if dangling mass is not needed
 */
void ppi_step_full(const CSR *g,
                  const double *pi_in,
                  double *pi_out,
                  double *dangling_out);

/**
 * Compute P * pi for a partial range of rows [start_row, end_row).
 * This is used by map workers to compute their portion of the matrix multiplication.
 * 
 * @param g Pointer to partial CSR matrix (created via load_rows)
 * @param pi_in Input PageRank vector (length = total number of nodes, not g->n)
 * @param start_row Starting global row index (inclusive)
 * @param end_row Ending global row index (exclusive)
 * @param pi_out Output result vector (length = total n, ADDITIVE - values are accumulated)
 * @param dangling_out Pointer to store local dangling mass contribution
 *                     Can be NULL if dangling mass is not needed
 */
void ppi_step_partial(const CSR *g,
                     const double *pi_in,
                     int32_t start_row,
                     int32_t end_row,
                     double *pi_out,
                     double *dangling_out);

#endif // CSR_H