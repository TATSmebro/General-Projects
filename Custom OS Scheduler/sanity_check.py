import sys
import re
import subprocess
import pexpect
from dataclasses import dataclass
from typing import List, Dict, Tuple
from collections import defaultdict

# ==============================
# Build helpers
# ==============================

BUILT_POLICIES = set()
DEFAULT_BUILT = False


def run_cmd(cmd: str, cwd: str = ".", timeout: int = 300) -> str:
    print(f"[CMD] {cmd}", file=sys.stderr)
    result = subprocess.run(
        cmd, shell=True, cwd=cwd,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, timeout=timeout
    )
    if result.returncode != 0:
        print("[ERROR] Command failed:", file=sys.stderr)
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise RuntimeError(f"Command failed: {cmd}")
    return result.stdout


def build_xv6(policy: str):
    if policy in BUILT_POLICIES:
        print(f"[build_xv6] Policy {policy} already built, skipping rebuild.",
              file=sys.stderr)
        return

    print(f"[build_xv6] Building xv6 for policy={policy} ...", file=sys.stderr)
    cmd = f"make clean && make CPUS=1 SCHEDULING_POLICY={policy}"
    run_cmd(cmd)
    BUILT_POLICIES.add(policy)


def build_xv6_default():
    global DEFAULT_BUILT
    if DEFAULT_BUILT:
        print("[build_xv6_default] Default build already done, skipping.",
              file=sys.stderr)
        return
    print("[build_xv6_default] Building xv6 (default / vanilla) ...",
          file=sys.stderr)
    run_cmd("make clean && make CPUS=1")
    DEFAULT_BUILT = True


# ==============================
# Run xv6 and capture
# ==============================

def run_xv6_and_capture(policy: str, user_command: str, timeout: int = 120) -> str:
    build_xv6(policy)
    qemu_cmd = ["make", "qemu", f"SCHEDULING_POLICY={policy}", "CPUS=1"]

    print(f"[run_xv6_and_capture] Spawning xv6 via: {' '.join(qemu_cmd)}",
          file=sys.stderr)

    child = pexpect.spawn(
        qemu_cmd[0], qemu_cmd[1:],
        encoding="utf-8", timeout=timeout
    )

    chunks = []

    try:
        child.expect("init: starting sh")
        chunks.append(child.before); chunks.append(child.after)

        child.expect_exact("$ ")
        chunks.append(child.before); chunks.append(child.after)

        child.sendline(user_command)

        child.expect_exact("$ ")
        chunks.append(child.before); chunks.append(child.after)

        print("[run_xv6_and_capture] Sending Ctrl-A x to exit qemu...",
              file=sys.stderr)
        child.send("\x01x")
        child.expect(pexpect.EOF)
        chunks.append(child.before)

    finally:
        try: child.close(force=True)
        except: pass

    return "".join(chunks)


def run_xv6_and_capture_default(user_command: str, timeout: int = 120) -> str:
    build_xv6_default()
    qemu_cmd = ["make", "qemu", "CPUS=1"]

    child = pexpect.spawn(
        qemu_cmd[0], qemu_cmd[1:],
        encoding="utf-8", timeout=timeout
    )

    chunks = []
    try:
        child.expect("init: starting sh")
        chunks.append(child.before); chunks.append(child.after)

        child.expect_exact("$ ")
        chunks.append(child.before); chunks.append(child.after)

        child.sendline(user_command)

        child.expect_exact("$ ")
        chunks.append(child.before); chunks.append(child.after)

        child.send("\x01x")
        child.expect(pexpect.EOF)
        chunks.append(child.before)

    finally:
        try: child.close(force=True)
        except: pass

    return "".join(chunks)


# ==============================
# Schedlog parsing
# ==============================

SCHEDLOG_LINE_RE = re.compile(
    r"^(?P<tick>\d+)\|"
    r"(?P<set>active|expired)\|"
    r"(?P<level>\d+)\("
    r"(?P<level_q>\d+)\)"
    r"(?P<procs>(?:,\[\d+\][^:]+:\d+\(\d+\))*)$"
)

PROC_ENTRY_RE = re.compile(
    r",\[(?P<pid>\d+)\](?P<name>[^:]+):(?P<state>\d+)\((?P<q>\d+)\)"
)


@dataclass
class ProcessEntry:
    pid: int
    name: str
    state: int
    proc_q: int


@dataclass
class LevelEntry:
    tick: int
    set_name: str
    level: int
    level_q: int
    procs: List[ProcessEntry]


def extract_schedlog_lines(output: str) -> List[str]:
    lines = []
    for line in output.splitlines():
        line = line.strip()
        if line and line[0].isdigit() and ("|active|" in line or "|expired|" in line):
            lines.append(line)
    return lines


def parse_schedlog_line(line: str) -> LevelEntry:
    match = SCHEDLOG_LINE_RE.match(line)
    if not match:
        raise ValueError(f"Bad schedlog format: {line}")

    tick = int(match.group("tick"))
    setname = match.group("set")
    level = int(match.group("level"))
    level_q = int(match.group("level_q"))

    procs_str = match.group("procs")
    procs = []
    pos = 0

    for m in PROC_ENTRY_RE.finditer(procs_str):
        if m.start() != pos:
            bad = procs_str[pos:m.start()]
            raise ValueError(f"Invalid text in process list: '{bad}' in line: {line}")
        pos = m.end()
        procs.append(
            ProcessEntry(
                pid=int(m.group("pid")),
                name=m.group("name"),
                state=int(m.group("state")),
                proc_q=int(m.group("q")),
            )
        )

    if pos != len(procs_str):
        raise ValueError(
            f"Trailing invalid text inside process list: '{procs_str[pos:]}'"
        )

    return LevelEntry(tick, setname, level, level_q, procs)


# ==============================
# MQSS check helpers
# ==============================

def check_mqss_schedlog_format(lines: List[str]) -> List[str]:
    errors = []
    last_tick = None

    for i, line in enumerate(lines, start=1):
        m = SCHEDLOG_LINE_RE.match(line)
        if not m:
            errors.append(f"Line {i}: invalid format: {line}")
            continue

        tick = int(m.group("tick"))
        level = int(m.group("level"))
        level_q = int(m.group("level_q"))

        if tick < 0: errors.append(f"Line {i}: negative tick")
        if level < 0: errors.append(f"Line {i}: negative level")
        if level_q < 0: errors.append(f"Line {i}: negative level_q")

        if last_tick is not None and tick < last_tick:
            errors.append(f"Line {i}: tick decreased {tick} < {last_tick}")

        last_tick = tick

    return errors


def check_active_expired(entries: List[LevelEntry]):
    per_tick = defaultdict(lambda: {"active": [], "expired": []})

    for e in entries:
        per_tick[e.tick][e.set_name].append(e)

    for tick, sets in per_tick.items():
        active_pids = {p.pid for lvl in sets["active"] for p in lvl.procs}
        expired_pids = {p.pid for lvl in sets["expired"] for p in lvl.procs}
        both = active_pids & expired_pids
        if both:
            raise AssertionError(
                f"Tick {tick}: PIDs present in BOTH active and expired: {sorted(both)}"
            )


def check_level_local(entries: List[LevelEntry]):
    groups = defaultdict(list)
    for e in entries:
        groups[(e.set_name, e.level)].append(e)

    for key, lst in groups.items():
        lst.sort(key=lambda e: e.tick)
        max_q = max(e.level_q for e in lst)

        prev_q = None
        prev_tick = None

        for e in lst:
            if prev_q is not None and e.tick != prev_tick:
                if e.level_q > prev_q and e.level_q != max_q:
                    raise AssertionError(
                        f"{key}: level_q increased {prev_q}->{e.level_q}"
                    )
            prev_q = e.level_q
            prev_tick = e.tick


def check_proc_quanta(entries: List[LevelEntry]):
    per_pid = defaultdict(list)
    for e in entries:
        for p in e.procs:
            per_pid[p.pid].append((e.tick, e.set_name, e.level, p.proc_q))

    for pid, hist in per_pid.items():
        hist.sort(key=lambda x: x[0])
        max_q = max(q for _, _, _, q in hist)

        prev = hist[0]
        for cur in hist[1:]:
            prev_tick, prev_set, prev_level, prev_q = prev
            tick, set_name, level, q = cur

            if set_name == prev_set and level == prev_level:
                if q > prev_q:
                    raise AssertionError(
                        f"pid {pid}: proc_q increased {prev_q}->{q}"
                    )
            else:
                if q != max_q:
                    raise AssertionError(
                        f"pid {pid}: expected proc_q reset to {max_q}, got {q}"
                    )

            prev = cur


# ==============================
# Test functions
# ==============================

def rr_schedlog_suite():
    full = run_xv6_and_capture("RR", "test")
    lines = extract_schedlog_lines(full)

    rr_re = re.compile(r"^\d+\|active\|0\(\d+\)(?:,\[\d+\][^:]+:\d+\(\d+\))*$")
    for line in lines:
        if not rr_re.match(line):
            raise AssertionError(f"RR format error: {line}")

    entries = [parse_schedlog_line(l) for l in lines]

    for e in entries:
        if e.set_name != "active":
            raise AssertionError("RR: found expired line")
        if e.level != 0:
            raise AssertionError("RR: found nonzero level")

    per_pid = defaultdict(list)
    for e in entries:
        for p in e.procs:
            per_pid[p.pid].append((e.tick, p.proc_q))

    for pid, hist in per_pid.items():
        hist.sort()
        prev_tick, prev_q = hist[0]
        for tick, q in hist[1:]:
            if q > prev_q:
                raise AssertionError(f"RR: pid {pid} proc_q increased")
            prev_tick, prev_q = tick, q


def mqss_schedlog_suite():
    full = run_xv6_and_capture("MQSS", "test")
    lines = extract_schedlog_lines(full)

    errors = check_mqss_schedlog_format(lines)
    if errors:
        raise AssertionError("MQSS format errors:\n" + "\n".join(errors))

    entries = [parse_schedlog_line(l) for l in lines]

    sets = {e.set_name for e in entries}
    if "active" not in sets or "expired" not in sets:
        raise AssertionError("MQSS missing active/expired sets")

    levels = {e.level for e in entries}
    if len(levels) < 2:
        raise AssertionError("MQSS missing multiple levels")

    check_active_expired(entries)
    check_level_local(entries)
    check_proc_quanta(entries)


# ==============================
# Vanilla fork()
# ==============================

def test_vanilla_fork():
    full = run_xv6_and_capture_default("test")

    if "Running Test" not in full:
        raise AssertionError("Vanilla: missing 'Running Test'")
    if "panic:" in full.lower():
        raise AssertionError("Vanilla: kernel panic")
    if "exec test failed" in full:
        raise AssertionError("Vanilla: exec test failed")


# ==============================
# priofork tests
# ==============================

def _find(prefix: str, output: str) -> str:
    for line in output.splitlines():
        if line.strip().startswith(prefix):
            return line.strip()
    raise AssertionError(f"Line starting with '{prefix}' not found")


def test_priofork_invalid():
    full = run_xv6_and_capture("MQSS", "prioforktest -1")
    line = _find("prioforktest: invalid_return=", full)
    if "-1" not in line:
        raise AssertionError(f"Invalid priofork returns: {line}")


def test_priofork_basic():
    full = run_xv6_and_capture("MQSS", "prioforktest 2")

    child = _find("prioforktest: child pid=", full)
    parent = _find("prioforktest: parent pid=", full)

    child_pid = int(child.split("child pid=")[1].split()[0])

    parts = parent.split("parent pid=")[1].split()
    parent_pid = int(parts[0])
    parsed_child = int([p for p in parts if p.startswith("child=")][0].split("=")[1])
    status = int([p for p in parts if p.startswith("status=")][0].split("=")[1])

    if parsed_child != child_pid:
        raise AssertionError("Parent/child pid mismatch")
    if status != 0:
        raise AssertionError(f"Child exit status != 0 ({status})")


# ==============================
# Main runner
# ==============================

def main():
    tests = [
        ("RR schedlog format & implementation", rr_schedlog_suite),
        ("MQSS schedlog format & implementation", mqss_schedlog_suite),

        ("Active vs expired invariants", lambda: check_active_expired(
            [parse_schedlog_line(l) for l in extract_schedlog_lines(
                run_xv6_and_capture("MQSS", "test")
            )]
        )),
        ("Level-local quanta", lambda: check_level_local(
            [parse_schedlog_line(l) for l in extract_schedlog_lines(
                run_xv6_and_capture("MQSS", "test")
            )]
        )),
        ("Process-local quanta replenishment", lambda: check_proc_quanta(
            [parse_schedlog_line(l) for l in extract_schedlog_lines(
                run_xv6_and_capture("MQSS", "test")
            )]
        )),

        ("Vanilla fork() / scheduler", test_vanilla_fork),

        ("priofork invalid arguments", test_priofork_invalid),
        ("priofork basic behavior", test_priofork_basic),
    ]

    fails = 0
    for name, fn in tests:
        print(f"\n=== {name} ===")
        try:
            fn()
            print(f"[PASS] {name}")
        except Exception as e:
            fails += 1
            print(f"[FAIL] {name}: {e}")

    if fails:
        print(f"\nSanity check finished with {fails} failing tests.")
        sys.exit(1)
    else:
        print("\nAll sanity checks passed.")
        sys.exit(0)


if __name__ == "__main__":
    main()
