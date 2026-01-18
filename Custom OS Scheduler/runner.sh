#!/bin/bash

set -u

# N - 20
N="${N:-20}"

# Test programs 
TESTS=(
  "test_cpu"
  "test_io"
  "tfkcpu"
  "tfkio"
  "tbg"
)

# Scheduling policies 
POLICIES=(
  "RR"
  "MQSS"
)

LOGDIR="runner_logs"
mkdir -p "$LOGDIR"

echo "  CS140 Runner (N = $N)"
echo "Programs: ${TESTS[*]}"
echo "Policies: ${POLICIES[*]}"
echo "Logs dir: $LOGDIR"
echo


run_xv6() {
  local policy="$1"
  local cmd1="$2"
  local cmd2="$3"
  local outfile="$4"

  local fifo=".xv6_fifo"
  rm -f "$fifo"
  mkfifo "$fifo"

  (
    sleep 2          
    echo "$cmd1"
    sleep 0.5
    echo "$cmd2"
  ) > "$fifo" &

  stdbuf -oL -eL make qemu CPUS=1 SCHEDULING_POLICY="$policy" \
        < "$fifo" 2>&1 | tee "$outfile"

  rm -f "$fifo"
}


#MAIN LOOP
for pol in "${POLICIES[@]}"; do
  echo ">>> Building xv6 for policy: $pol"

  make clean > /dev/null 2>&1
  make CPUS=1 SCHEDULING_POLICY="$pol" > /dev/null

  echo ">>> Warmup..."
  run_xv6 "$pol" "echo warmup" "shutdown" "/tmp/prime_${pol}.log"
  echo

  for prog in "${TESTS[@]}"; do
    echo "=== Program: $prog (policy $pol) ==="

    for ((i=1; i<=N; i++)); do
      run_id=$(printf "%02d" "$i")
      log_file="${LOGDIR}/${prog}_${pol}_run${run_id}.log"

      echo "  -> Run $run_id -> $log_file"
      run_xv6 "$pol" "$prog" "shutdown" "$log_file"
    done

    echo
  done

  echo "Finished $pol"
  echo
done

echo "All runs complete!"
echo "Logs saved in: $LOGDIR"
