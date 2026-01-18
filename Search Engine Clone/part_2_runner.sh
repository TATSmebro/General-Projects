#!/bin/bash

# ============================================================================
# CS 140 Project 2 - Part 2 Runner Script
# ============================================================================
# PURPOSE: For each STRUCT_1 links.txt generated in 4.4.1, run PageRank with
#          NPROC = 1..8, save logs, append runtime, and generate graphs.
#
# OUTPUTS: part-2-outputs/
#   - logs: <dataset>_NPROC<k>.log
#   - timings: timings.csv
#   - graphs:  <structure>_timings.png
#
# USAGE: ./part2_runner.sh
# ============================================================================

# Colors for outputs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "============================================"
echo "CS 140 Project 2 - Part 2 Runner"
echo "============================================"
echo ""

# ============================================================================
# CONFIG
# ============================================================================
# Where part1 outputs live (containing generated STRUCT dirs and links.txt)
PART1_OUTDIR="part-1-outputs"

# Required output folder for part2
OUTDIR="part-2-outputs"
BUILDDIR=".runner_build_p2"

CSR_SRC="CSR.c"
CSR_HDR="CSR.h"
PAGERANK_SRC="PageRank.c"

# PageRank parameters
ALPHA="0.15"
ITERS="20"

# NPROC range
NPROC_MIN=1
NPROC_MAX=8

# ============================================================================
# STEP 1/5: BASIC CHECKS
# ============================================================================
echo "[STEP 1/5] Checking required files/folders..."

fail=0
if [ ! -d "$PART1_OUTDIR" ]; then
  echo -e "${RED}[FAIL]${NC} Missing: $PART1_OUTDIR (expected Part 1 outputs folder)"
  fail=1
fi
if [ ! -f "$CSR_SRC" ]; then
  echo -e "${RED}[FAIL]${NC} Missing: $CSR_SRC"
  fail=1
fi
if [ ! -f "$CSR_HDR" ]; then
  echo -e "${RED}[FAIL]${NC} Missing: $CSR_HDR"
  fail=1
fi
if [ ! -f "$PAGERANK_SRC" ]; then
  echo -e "${RED}[FAIL]${NC} Missing: $PAGERANK_SRC"
  fail=1
fi
if [ $fail -ne 0 ]; then
  echo ""
  exit 1
fi

echo -e "${GREEN}[PASS]${NC} Inputs look good"
echo ""

# ============================================================================
# STEP 2/5: SETUP OUTPUT DIRECTORY
# ============================================================================
echo "[STEP 2/5] Setting up output directory..."

mkdir -p "$OUTDIR"
mkdir -p "$BUILDDIR"

echo -e "${GREEN}[PASS]${NC} Created/verified $OUTDIR/"
echo ""

# ============================================================================
# STEP 3/5: COMPILATION (build CSR tool + pagerank tool)
# ============================================================================
echo "[STEP 3/5] Compiling Part 2 tools..."

cat > "${BUILDDIR}/csr_main.c" <<'EOF'
#include <stdio.h>
#include "CSR.h"
// Usage: csr_build <links.txt> <csr_out.bin> <nodes_out.txt>
int main(int argc, char **argv) {
  if (argc != 4) {
    fprintf(stderr, "Usage: %s <struct_links.txt> <csr_out.bin> <nodes_out.txt>\n", argv[0]);
    return 2;
  }
  return (csr_build_from_struct(argv[1], argv[2], argv[3]) == 0) ? 0 : 1;
}
EOF

cat > "${BUILDDIR}/pagerank_main.c" <<'EOF'
#include <stdio.h>
#include <stdlib.h>
int pagerank_run(const char *csr_path, int NPROC, int MAX_ITERS, double alpha);
// Usage: pagerank_run <csr_path> <nproc> <iters> <alpha>
int main(int argc, char **argv) {
  if (argc != 5) {
    fprintf(stderr, "Usage: %s <csr_path> <nproc> <iters> <alpha>\n", argv[0]);
    return 2;
  }
  const char *csr_path = argv[1];
  int nproc = atoi(argv[2]);
  int iters = atoi(argv[3]);
  double alpha = atof(argv[4]);
  if (nproc <= 0 || iters < 0) return 2;
  return (pagerank_run(csr_path, nproc, iters, alpha) == 0) ? 0 : 1;
}
EOF

CFLAGS="-O2 -Wall -Wextra -std=gnu11 -D_GNU_SOURCE -I."
LDFLAGS="-lm"

# Compile CSR builder
gcc $CFLAGS \
  -o "${BUILDDIR}/csr_build" \
  "${BUILDDIR}/csr_main.c" "$CSR_SRC" $LDFLAGS 2>&1 | tee "${BUILDDIR}/compile_csr.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo -e "${RED}[FAIL]${NC} CSR compile failed"
  exit 1
fi

# Compile pagerank runner
gcc $CFLAGS \
  -o "${BUILDDIR}/pagerank_run" \
  "${BUILDDIR}/pagerank_main.c" "$PAGERANK_SRC" "$CSR_SRC" $LDFLAGS 2>&1 | tee "${BUILDDIR}/compile_pr.log"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo -e "${RED}[FAIL]${NC} PageRank compile failed"
  exit 1
fi

# Warn on warnings
if [ -s "${BUILDDIR}/compile_csr.log" ] || [ -s "${BUILDDIR}/compile_pr.log" ]; then
  echo -e "${YELLOW}[WARN]${NC} Compilation produced warnings (see ${BUILDDIR}/compile_*.log)"
else
  echo -e "${GREEN}[PASS]${NC} Compilation successful"
fi
echo ""

# ============================================================================
# STEP 4/5: RUN EXPERIMENTS (STRUCT_1 links.txt, NPROC 1..8)
# ============================================================================
echo "[STEP 4/5] Running PageRank benchmarks..."
echo ""

mapfile -t DATASETS < <(
  ls -1 "$PART1_OUTDIR"/connected_*_file_links.txt \
        "$PART1_OUTDIR"/forest_*_file_links.txt \
        "$PART1_OUTDIR"/full_*_file_links.txt \
        "$PART1_OUTDIR"/random_*_file_links.txt 2>/dev/null \
  | sort -V | awk '
      /connected_/ {c=$0}
      /forest_/    {f=$0}
      /full_/      {u=$0}
      /random_/    {r=$0}
      END {
        if (c!="") print c;
        if (f!="") print f;
        if (u!="") print u;
        if (r!="") print r;
      }'
)

if [ ${#DATASETS[@]} -eq 0 ]; then
  echo -e "${RED}[FAIL]${NC} No *_file_links.txt found under $PART1_OUTDIR"
  exit 1
fi

TIMINGS_CSV="${OUTDIR}/timings.csv"
echo "structure,dataset,nproc,runtime_sec" > "$TIMINGS_CSV"

TOTAL_RUNS=0
PASSED_RUNS=0
FAILED_RUNS=0

for links in "${DATASETS[@]}"; do
  ds_dir="$(dirname "$links")"

  # Try to infer structure label from path (connected/forest/full/random),
  # else use the parent dir name.
  structure="$(echo "$links" | grep -Eo '(connected|forest|full|random)' | head -n1)"
  if [ -z "$structure" ]; then
    structure="$(basename "$ds_dir")"
  fi

  # Stable dataset name for filenames
  ds_name="$(echo "$ds_dir" | tr '/ ' '__')"

  echo "----------------------------------------"
  echo "Dataset: $links"
  echo "Structure: $structure"
  echo "----------------------------------------"

  for nproc in $(seq $NPROC_MIN $NPROC_MAX); do
    ((TOTAL_RUNS++))
    log="${OUTDIR}/${ds_name}_NPROC${nproc}.log"

    echo -n "  NPROC=$nproc ... "

    # Reset between runs so rank_iter.bin doesn't carry over.
    rm -rf data
    mkdir -p data/tmp data/pi

    CSR_OUT="data/P_CSR.bin"
    NODES_OUT="data/nodes.txt"

    {
      echo "========================================"
      echo "DATASET: $links"
      echo "STRUCTURE: $structure"
      echo "NPROC: $nproc"
      echo "ITERS: $ITERS"
      echo "ALPHA: $ALPHA"
      echo "========================================"
      echo ""
      echo "[1/2] Building CSR..."
    } > "$log"

    timeout 300 "${BUILDDIR}/csr_build" "$links" "$CSR_OUT" "$NODES_OUT" >> "$log" 2>&1
    rc=$?

    if [ $rc -eq 124 ]; then
      echo -e "${RED}[TIMEOUT]${NC}"
      ((FAILED_RUNS++))
      echo "RUNTIME_SEC: TIMEOUT" >> "$log"
      echo "$structure,$ds_name,$nproc,NaN" >> "$TIMINGS_CSV"
      continue
    elif [ $rc -ne 0 ]; then
      echo -e "${RED}[CSR FAIL]${NC}"
      ((FAILED_RUNS++))
      echo "RUNTIME_SEC: CSR_FAIL" >> "$log"
      echo "$structure,$ds_name,$nproc,NaN" >> "$TIMINGS_CSV"
      continue
    fi

    echo "" >> "$log"
    echo "[2/2] Running PageRank..." >> "$log"

    # Measure runtime (prefer /usr/bin/time if present)
    if command -v /usr/bin/time >/dev/null 2>&1; then
      { /usr/bin/time -p timeout 600 "${BUILDDIR}/pagerank_run" "$CSR_OUT" "$nproc" "$ITERS" "$ALPHA"; } >> "$log" 2>&1
      rc=${PIPESTATUS[0]}
      real_sec="$(grep -E '^real ' "$log" | tail -n1 | awk '{print $2}')"
      if [ $rc -eq 0 ] && [ -n "$real_sec" ]; then
        echo "" >> "$log"
        echo "RUNTIME_SEC: $real_sec" >> "$log"
        echo "$structure,$ds_name,$nproc,$real_sec" >> "$TIMINGS_CSV"
        echo -e "${GREEN}[PASS]${NC} (${real_sec}s)"
        ((PASSED_RUNS++))
      else
        echo -e "${RED}[PR FAIL]${NC}"
        ((FAILED_RUNS++))
        echo "" >> "$log"
        echo "RUNTIME_SEC: PR_FAIL" >> "$log"
        echo "$structure,$ds_name,$nproc,NaN" >> "$TIMINGS_CSV"
      fi
    else
      start_ns=$(date +%s%N)
      timeout 600 "${BUILDDIR}/pagerank_run" "$CSR_OUT" "$nproc" "$ITERS" "$ALPHA" >> "$log" 2>&1
      rc=$?
      end_ns=$(date +%s%N)

      if [ $rc -eq 0 ]; then
        dur_ms=$(( (end_ns - start_ns) / 1000000 ))
        real_sec="$(awk -v ms="$dur_ms" 'BEGIN{printf "%.6f", ms/1000.0}')"
        echo "" >> "$log"
        echo "RUNTIME_SEC: $real_sec" >> "$log"
        echo "$structure,$ds_name,$nproc,$real_sec" >> "$TIMINGS_CSV"
        echo -e "${GREEN}[PASS]${NC} (${real_sec}s)"
        ((PASSED_RUNS++))
      else
        echo -e "${RED}[PR FAIL]${NC}"
        ((FAILED_RUNS++))
        echo "" >> "$log"
        echo "RUNTIME_SEC: PR_FAIL" >> "$log"
        echo "$structure,$ds_name,$nproc,NaN" >> "$TIMINGS_CSV"
      fi
    fi
  done

  echo ""
done

# ============================================================================
# STEP 5/5: GENERATE GRAPHS
# ============================================================================
echo "[STEP 5/5] Generating graphs from timings.csv..."

if command -v python3 >/dev/null 2>&1; then
  python3 plot_part2.py "$TIMINGS_CSV" "$OUTDIR" > "${OUTDIR}/plot.log" 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}[PASS]${NC} Graphs generated in $OUTDIR/"
  else
    echo -e "${YELLOW}[WARN]${NC} Graph generation failed (see ${OUTDIR}/plot.log)"
  fi
else
  echo -e "${YELLOW}[WARN]${NC} python3 not found; skipping graph generation."
fi

echo ""
echo "============================================"
echo "[SUMMARY]"
echo "Total runs: $TOTAL_RUNS"
echo -e "Passed: ${GREEN}$PASSED_RUNS${NC}"
echo -e "Failed: ${RED}$FAILED_RUNS${NC}"
echo "Logs + CSV: $OUTDIR/"
echo "============================================"

if [ $FAILED_RUNS -eq 0 ]; then
  exit 0
else
  exit 1
fi
