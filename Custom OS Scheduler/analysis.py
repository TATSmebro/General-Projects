#!/usr/bin/env python3
from __future__ import annotations
from dataclasses import dataclass
import os
import re
import pandas as pd
import scipy.stats as stats

LOGDIR = "runner_logs"

# ============================
# Parsing (same as results.py)
# ============================

PROC_RE = re.compile(
    r"""
    \[(\d+)\]        # [pid]
    (\w+)            # name
    :?               # optional colon
    \w*              # optional field (state/priority)
    \((\d+)\)        # (quantum)
    """,
    re.VERBOSE
)

@dataclass(frozen=True)
class ProcEntry:
    pid: int
    name: str
    quantum: int

@dataclass(frozen=True)
class TickState:
    tick: int
    procs: list[ProcEntry]


def parse_log(path: str) -> list[TickState]:
    ticks = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            # Only schedlog lines start with: digit + '|'
            if not re.match(r"^\d+\|", line):
                continue

            # Split into 3 parts: tick | set | everything else
            parts = line.split("|", 2)
            if len(parts) < 3:
                continue

            tick = int(parts[0])
            procstr = parts[2]  # may be empty or contain processes

            entries = []
            for pid, name, q in PROC_RE.findall(procstr):
                entries.append(ProcEntry(int(pid), name, int(q)))

            ticks.append(TickState(tick, entries))

    return ticks


# ============================
# Metric Extraction
# ============================

def compute_metrics(ticks: list[TickState]):
    """
    Extract metrics for the *test process*, defined as:
    the first process whose name is NOT init or sh.
    """
    test_pid = None

    # Identify test process PID
    for t in ticks:
        for p in t.procs:
            if p.name not in ("init", "sh"):
                test_pid = p.pid
                break
        if test_pid is not None:
            break

    if test_pid is None:
        return None

    first = None
    last = None
    cpu_ticks = 0
    ctx = 0

    prev_running_pid = None

    for t in ticks:
        # Determine "running" process = p.procs[0] (highest priority)
        if t.procs:
            running = t.procs[0].pid
            if prev_running_pid is not None and running != prev_running_pid:
                ctx += 1
            prev_running_pid = running

        for p in t.procs:
            if p.pid == test_pid:
                if first is None:
                    first = t.tick
                last = t.tick
                if p.quantum > 0:   # Means CPU was consumed this tick
                    cpu_ticks += 1

    turnaround = last - first
    response = first
    cpu_percent = (cpu_ticks / len(ticks)) * 100 if ticks else 0.0

    return {
        "pid": test_pid,
        "response": response,
        "turnaround": turnaround,
        "cpu_percent": cpu_percent,
        "ctx_switches": ctx
    }


# ============================
# Collect All Runs
# ============================

def collect_all():
    rows = []

    for fname in os.listdir(LOGDIR):
        if not fname.endswith(".log"):
            continue

        full = os.path.join(LOGDIR, fname)
        ticks = parse_log(full)
        metrics = compute_metrics(ticks)
        if metrics is None:
            continue

        base = fname.replace(".log", "")
        parts = base.split("_")
        # Format: <program>_<policy>_<runXX>
        if len(parts) < 3:
            continue

        run = parts[-1]
        policy = parts[-2]
        program = "_".join(parts[:-2])

        rows.append({
            "program": program,
            "policy": policy,
            "run": run,
            "pid": metrics["pid"],
            "response": metrics["response"],
            "turnaround": metrics["turnaround"],
            "cpu_percent": metrics["cpu_percent"],
            "ctx_switches": metrics["ctx_switches"],
        })

    return pd.DataFrame(rows)


# ============================
# Hypothesis Testing (RR vs MQSS)
# ============================

def run_tests(df: pd.DataFrame):
    metrics = ["response", "turnaround", "cpu_percent", "ctx_switches"]

    programs = sorted(df["program"].unique())

    print("\n==========================================")
    print("     MANN-WHITNEY U-TEST: RR vs MQSS      ")
    print("==========================================\n")

    for prog in programs:
        print(f"--- Program: {prog} ---")
        df_prog = df[df["program"] == prog]

        for metric in metrics:
            rr_vals = df_prog[df_prog["policy"] == "RR"][metric]
            mq_vals = df_prog[df_prog["policy"] == "MQSS"][metric]

            if rr_vals.empty or mq_vals.empty:
                print(f"{metric:15s}  NO DATA")
                continue

            u = stats.mannwhitneyu(rr_vals, mq_vals, alternative="two-sided")
            print(f"{metric:15s}  U={u.statistic:.2f}  p={u.pvalue:.6f}")

        print()


# ============================
# Main
# ============================

def main():
    df = collect_all()

    print("Loaded metrics:")
    print(df.head())

    run_tests(df)


if __name__ == "__main__":
    main()
