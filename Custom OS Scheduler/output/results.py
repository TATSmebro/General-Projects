from __future__ import annotations
from dataclasses import dataclass
import os
import re
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

LOGDIR = "../runner_logs"

# Updated regex to capture state
PROC_RE = re.compile(
    r"""
    \[(\d+)\]        # [pid]
    (\w+)            # name
    :(\d+)           # :state
    \((\d+)\)        # (quantum)
    """,
    re.VERBOSE,
)

PROGRAMS = ["tbg", "test_io", "tfkcpu", "tfkio"]
POLICIES = ["RR", "MQSS", "MLFQ"]
METRICS = [
    "context_switches",
    "response_time",
    "total_running_time",
    "turnaround_time",
    "percentage_of_cpu_time",
]


@dataclass(frozen=True)
class ProcEntry:
    pid: int
    name: str
    state: int
    quantum: int


@dataclass(frozen=True)
class TickState:
    tick: int
    procs: list[ProcEntry]


@dataclass(frozen=True)
class ProcessMetrics:
    pid: int
    program: str
    policy: str
    run: int
    first_execution_tick: int
    arrival_tick: int
    ending_tick: int
    response_time: int
    turnaround_time: int
    percentage_of_cpu_time: float
    total_running_time: int
    context_switches: int


@dataclass(frozen=True)
class MetricStats:
    pid: int
    program: str
    policy: str
    metric: str
    mean: float
    median: float
    range: float
    sd: float


def parse_log(path: str) -> list[TickState]:
    ticks: list[TickState] = []

    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            parts = line.split("|")
            if len(parts) < 3:
                continue

            try:
                tick = int(parts[0])
            except ValueError:
                continue

            procs_str = "|".join(parts[2:])
            entries: list[ProcEntry] = []

            for pid_str, name, state_str, q_str in PROC_RE.findall(procs_str):
                try:
                    pid = int(pid_str)
                    state = int(state_str)
                    q = int(q_str)
                except ValueError:
                    continue

                entries.append(ProcEntry(pid=pid, name=name, state=state, quantum=q))

            ticks.append(TickState(tick=tick, procs=entries))

    return ticks


def get_test_pids(ticks: list[TickState], program: str) -> set[int]:
    test_pids = set()
    
    for t in ticks:
        for p in t.procs:
            # Skip system processes
            if p.name in ("init", "sh"):
                continue
            
            if program in p.name or p.name in program:
                test_pids.add(p.pid)
    
    return test_pids


class MetricComputer:

    def get_arrival_tick(self, ticks: list[TickState], pids: set[int]) -> int:
        for t in ticks:
            for p in t.procs:
                if p.pid in pids:
                    return t.tick
        raise RuntimeError(f"PIDs {pids} have no arrival tick")

    def get_first_execution_tick(self, ticks: list[TickState], pids: set[int]) -> int:
        for t in ticks:
            for p in t.procs:
                if p.pid in pids and p.state == 4:
                    return t.tick
        raise RuntimeError(f"PIDs {pids} have no first execution tick")

    def get_ending_tick(self, ticks: list[TickState], pids: set[int]) -> int:
        last_tick = None
        for t in ticks:
            for p in t.procs:
                if p.pid in pids:
                    last_tick = t.tick
        if last_tick is None:
            raise RuntimeError(f"PIDs {pids} have no ending tick")
        return last_tick

    def get_response_time(self, ticks: list[TickState], pids: set[int]) -> int:
        return self.get_first_execution_tick(ticks, pids) - self.get_arrival_tick(
            ticks, pids
        )

    def get_turnaround_time(self, ticks: list[TickState], pids: set[int]) -> int:
        return self.get_ending_tick(ticks, pids) - self.get_arrival_tick(ticks, pids)

    def get_total_running_time(self, ticks: list[TickState], pids: set[int]) -> int:
        running_ticks = set()
        for t in ticks:
            for p in t.procs:
                if p.pid in pids and p.state == 4:
                    running_ticks.add(t.tick)
                    break  
        return len(running_ticks)

    def get_percentage_of_cpu_time(
        self, ticks: list[TickState], pids: set[int]
    ) -> float:
        arrival = self.get_arrival_tick(ticks, pids)
        ending = self.get_ending_tick(ticks, pids)
        duration = ending - arrival

        if duration == 0:
            return 100.0

        total_running_time = self.get_total_running_time(ticks, pids)
        return (total_running_time / duration) * 100.0

    def get_context_switches(self, ticks: list[TickState], pids: set[int]) -> int:
        prev_running_pid = None
        ctx_switches = 0
        
        for t in ticks:
            running_pid = None
            for p in t.procs:
                if p.pid in pids and p.state == 4:
                    running_pid = p.pid
                    break
            
            if running_pid is not None and running_pid != prev_running_pid:
                ctx_switches += 1
            
            prev_running_pid = running_pid
        
        return ctx_switches

    def get_process_metrics(
        self, ticks: list[TickState], pids: set[int], program: str, policy: str, run: int
    ) -> ProcessMetrics:
        # Use the lowest PID for reporting
        representative_pid = min(pids) if pids else 0
        
        return ProcessMetrics(
            pid=representative_pid,
            program=program,
            policy=policy,
            run=run,
            first_execution_tick=self.get_first_execution_tick(ticks, pids),
            arrival_tick=self.get_arrival_tick(ticks, pids),
            response_time=self.get_response_time(ticks, pids),
            ending_tick=self.get_ending_tick(ticks, pids),
            turnaround_time=self.get_turnaround_time(ticks, pids),
            percentage_of_cpu_time=self.get_percentage_of_cpu_time(ticks, pids),
            total_running_time=self.get_total_running_time(ticks, pids),
            context_switches=self.get_context_switches(ticks, pids),
        )


def discover_logs() -> dict[tuple[str, str], list[str]]:

    log_pattern = re.compile(r"^(\w+)_(\w+)_run\d+\.log$")
    logs_by_program_policy: dict[tuple[str, str], list[str]] = {}

    if not os.path.exists(LOGDIR):
        print(f"[ERROR] Directory {LOGDIR} does not exist")
        return {}

    for filename in os.listdir(LOGDIR):
        match = log_pattern.match(filename)
        if match:
            program = match.group(1)
            policy = match.group(2)
            key = (program, policy)
            
            if key not in logs_by_program_policy:
                logs_by_program_policy[key] = []
            
            logs_by_program_policy[key].append(os.path.join(LOGDIR, filename))

    return logs_by_program_policy


def collect_metrics() -> list[ProcessMetrics]:
    metrics_list: list[ProcessMetrics] = []
    computer = MetricComputer()

    logs_by_program_policy = discover_logs()
    
    if not logs_by_program_policy:
        print(f"[ERROR] No log files found in {LOGDIR}")
        print(f"[INFO] Log files should match pattern: program_policy_runXXX.log")
        return []

    print(f"[INFO] Found {len(logs_by_program_policy)} program/policy combinations")

    for (program, policy), log_paths in sorted(logs_by_program_policy.items()):
        print(f"[INFO] Processing {program} with {policy}: {len(log_paths)} runs")
        
        for run_num, logpath in enumerate(sorted(log_paths), start=1):
            filename = os.path.basename(logpath)
            
            ticks = parse_log(logpath)
            if not ticks:
                print(f"[WARN] Empty log: {filename}")
                continue

            test_pids = get_test_pids(ticks, program)

            if not test_pids:
                print(f"[WARN] No test processes found in {filename}")
                continue

            try:
                metrics = computer.get_process_metrics(
                    ticks, test_pids, program, policy, run_num
                )
                metrics_list.append(metrics)
            except RuntimeError as e:
                print(f"[WARN] Failed to compute metrics for {filename}: {e}")
                continue

    return metrics_list


def get_data_stats(df: pd.DataFrame) -> pd.DataFrame:
    stats: list[MetricStats] = []

    programs = df["program"].unique()
    policies = df["policy"].unique()

    for program in programs:
        for policy in policies:
            for metric in METRICS:
                filtered = df[(df["program"] == program) & (df["policy"] == policy)]

                if filtered.empty:
                    continue

                mean = filtered[metric].mean()
                median = filtered[metric].median()

                data_min = filtered[metric].min()
                data_max = filtered[metric].max()
                data_range = data_max - data_min

                sd = filtered[metric].std()

                pid = filtered["pid"].iloc[0] if not filtered.empty else 0

                stats.append(
                    MetricStats(
                        pid=pid,
                        program=program,
                        policy=policy,
                        metric=metric,
                        mean=mean,
                        median=median,
                        range=data_range,
                        sd=sd,
                    )
                )

    return pd.DataFrame(stats)


def plot_metrics(df: pd.DataFrame) -> None:
    sns.set_theme(style="ticks", palette="pastel")

    for metric in METRICS:
        plt.figure(figsize=(10, 6))
        sns.barplot(
            data=df,
            x="program",
            y=metric,
            hue="policy",
            errorbar="sd",
            palette="dark",
            alpha=0.6,
        )
        plt.title(f"{metric.replace('_', ' ').title()}")
        plt.xlabel("Program")
        plt.ylabel(metric.replace("_", " ").title())
        plt.xticks(rotation=45)
        plt.legend(title="Policy")
        plt.tight_layout()
        plt.savefig(f"{metric}_barplot.png")
        plt.close()
        print(f"[OK] Saved {metric}_barplot.png")

        plt.figure(figsize=(10, 6))
        sns.boxplot(
            data=df,
            x="program",
            y=metric,
            hue="policy",
        )
        plt.title(f"{metric.replace('_', ' ').title()} Distribution")
        plt.xlabel("Program")
        plt.ylabel(metric.replace("_", " ").title())
        plt.xticks(rotation=45)
        plt.legend(title="Policy")
        plt.tight_layout()
        plt.savefig(f"{metric}_boxplot.png")
        plt.close()
        print(f"[OK] Saved {metric}_boxplot.png")


def main() -> None:
    print("Collecting metrics from log files...")
    metrics_list = collect_metrics()

    if not metrics_list:
        print("No valid results parsed from logs in", LOGDIR)
        return

    df = pd.DataFrame([vars(m) for m in metrics_list])

    print("\n" + "=" * 80)
    print("Individual Run Results:")
    print("=" * 80)
    for m in metrics_list:
        print(
            f"{m.program:10s} {m.policy:6s} run{m.run:03d} "
            f"pid={m.pid} "
            f"resp={m.response_time:4d} "
            f"turn={m.turnaround_time:4d} "
            f"run={m.total_running_time:4d} "
            f"cpu%={m.percentage_of_cpu_time:6.2f} "
            f"ctx={m.context_switches:d}"
        )

    print("\n" + "=" * 80)
    print("Statistical Summary:")
    print("=" * 80)
    stats_df = get_data_stats(df)
    print(stats_df.to_string(index=False))

    print("\n" + "=" * 80)
    print("Generating plots...")
    print("=" * 80)
    plot_metrics(df)

    print("\nDone!")


if __name__ == "__main__":
    main()
