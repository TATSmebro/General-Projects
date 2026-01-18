set -euo pipefail

# Move to the directory where this script lives (project root).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Important: all test/run scripts must use CPUS=1 (per project specs).
export CPUS=1

# Forward any extra args to the Python script (optional).
exec python3 sanity_check.py "$@"
