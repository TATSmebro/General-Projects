#!/usr/bin/env python3
import sys
import csv
from collections import defaultdict

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def main():
    if len(sys.argv) != 3:
        print("Usage: plot_part2.py <timings.csv> <outdir>", file=sys.stderr)
        return 2

    csv_path = sys.argv[1]
    outdir = sys.argv[2]

    # structure -> nproc -> list[runtimes]
    data = defaultdict(lambda: defaultdict(list))

    with open(csv_path, newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            structure = row["structure"]
            nproc = int(row["nproc"])
            try:
                rt = float(row["runtime_sec"])
            except ValueError:
                continue
            data[structure][nproc].append(rt)

    if not data:
        print("No numeric timings found to plot.", file=sys.stderr)
        return 1

    for structure, by_nproc in data.items():
        xs = sorted(by_nproc.keys())
        ys = []
        for x in xs:
            vals = by_nproc[x]
            # If multiple datasets exist per structure, plot the average time for that NPROC.
            ys.append(sum(vals) / len(vals))

        plt.figure()
        plt.plot(xs, ys, marker="o")
        plt.xlabel("NPROC")
        plt.ylabel("Duration (seconds)")
        plt.title(f"PageRank Duration vs NPROC ({structure})")
        plt.xticks(xs)
        plt.grid(True, which="both", linestyle="--", linewidth=0.5)

        outpath = f"{outdir}/{structure}_timings.png"
        plt.savefig(outpath, dpi=150, bbox_inches="tight")
        plt.close()

    print("OK")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
