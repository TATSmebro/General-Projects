## Part 1 - Multithreaded Scripts

### `part_1_sanity_check.sh`
Quick sanity check script for development/debugging.
- Tests select thread counts (1, 2, 4, 8)
- Faster than full performance run
- Uses `part_1_sanityhelper_verifylinks.py` to verify connectess
- Note running this will overwrite files to `/part-1-outputs`! 
- logs to `/logs_multithreaded_sanity_checks`

Usage:
```bash
./part_1_sanity_check.sh
```

### `part_1_runner.sh`
Main performance measurement script as required by Section 4.4.1. Used to generate logs for analytics!
- Runs NUM_THREADS = 1-10 for all 4 directory structures
- Generates log files with timing information
- Note running this will overwrite files to `/part-1-outputs`! 
- Generates csv files for analytics in `/part-1-performance-data`

Usage:
```bash
./part_1_runner.sh 2>&1 | tee part_1_runner_terminal.log
```

### `part-1_plot_performance.py`
Python script to generate the graphs!
- outputs to `/part-1-performance-graphs`

Usage:
```bash
./part-1_plot_performance.py
```

### `files_tester_automatic.sh`
Checks if `files_generator.sh` works appropriately.
- Calls both  `files_generator.sh` and `files_gentest.sh` 


Usage:
```bash
./files_tester_automatic.sh
```
