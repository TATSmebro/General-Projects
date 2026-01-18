#!/bin/bash
# side_by_side.sh - Show logs and timing together

# Setup
rm -rf files/ part-1-outputs/connected_*.txt
mkdir -p files/subdir part-1-outputs
echo "file_B.txt" > files/file_A.txt
echo "file_C.txt" > files/file_B.txt
echo "file_A.txt" > files/subdir/file_C.txt
gcc -o multithreaded multithreaded.c -pthread -Wall 2>/dev/null

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            Execution Log & Timing Comparison                  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 1 THREAD
echo "┌───────────────────────────────────────────────────────────────┐"
echo "│  1 THREAD                                                     │"
echo "└───────────────────────────────────────────────────────────────┘"
start=$(date +%s%3N)
./multithreaded 1 connected FALSE 2>&1 | grep -E "(===|Found|T-0|T-1|SUCCESS)" | head -20
end=$(date +%s%3N)
time_1=$((end - start))
echo ""
echo "⏱️  Time: ${time_1}ms"
echo ""
echo ""

# 10 THREADS
echo "┌───────────────────────────────────────────────────────────────┐"
echo "│  10 THREADS                                                   │"
echo "└───────────────────────────────────────────────────────────────┘"
start=$(date +%s%3N)
./multithreaded 10 connected FALSE 2>&1 | grep -E "(===|Found|T-0|T-1|SUCCESS)" | head -20
end=$(date +%s%3N)
time_10=$((end - start))
echo ""
echo "⏱️  Time: ${time_10}ms"
echo ""

# Summary
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                          SUMMARY                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
printf "  %-15s %8s\n" "Configuration" "Time"
echo "  ─────────────────────────────"
printf "  %-15s %6sms\n" "1 thread" "$time_1"
printf "  %-15s %6sms\n" "10 threads" "$time_10"
echo ""

if [ $time_10 -lt $time_1 ]; then
    speedup=$(echo "scale=2; $time_1 / $time_10" | bc)
    echo "  ✓ Speedup: ${speedup}x"
else
    echo "  ⚠ 10 threads slower (overhead dominates for 3 files)"
