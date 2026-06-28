# Overview

This folder includes the implementation and analysis of two Quicksort variants that share an identical Lomuto partition and differ only in how the pivot is selected.

- **Deterministic** — always uses the first element of the subarray as the pivot. Sorted and reverse sorted input force the most unbalanced split at every level, so the running time degrades to Theta(n^2) and the recursion reaches depth n.
- **Randomized** — selects the pivot uniformly at random. No fixed input ordering can repeatedly force the bad split, so the expected running time stays O(n log n) and the expected depth O(log n).

Each sort runs in place and returns the maximum recursion depth it reaches, which is the call-stack space the in-place sort actually uses.

# Execution

At the root folder run

```bash
python3 assignment-5/main.py
```

The script runs the correctness checks, then the timing and depth benchmarks, prints the four distribution tables to the console, and writes the running-time figure to `performance.png`. Requires Python 3 and `matplotlib`.

# Structure

- [Deterministic Quicksort](./deterministic_quicksort.py) - Implementation of the deterministic quicksort variant
- [Randomized Quicksort](./randomized_quicksort.py) - Implementation of the randomized quicksort variant
- [Benchmark](./benchmark.py) - Correctness checks and the timing and depth experiment matrix
- [Plot](./plot.py) - Saves the linear-axis running-time figure to `performance.png`
- [Main](./main.py) - Entry point that runs the benchmark and saves the plot
- [Analysis](./analysis.md) - Detailed analysis of Quicksort run time
