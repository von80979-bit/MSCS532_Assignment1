"""Correctness checks and run-time comparison of heapsort against randomized
quicksort and mergesort across several input sizes and distributions.

Run from inside the task1 folder:
    python3 benchmark.py
The script prints a table per distribution and saves the plot as
performance_metrics.png.
"""

import random
import sys
import time

import matplotlib

# Use a non-interactive backend so the plot saves without a display.
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from heapsort import heapsort
from merge_sort import merge_sort
from randomized_quicksort import randomized_quicksort

INPUT_SIZES = [1000, 2500, 5000, 10000, 20000, 30000, 40000, 50000]
TRIALS_PER_MEASUREMENT = 3
PLOT_FILENAME = "performance_metrics.png"

# Randomized quicksort recurses at most a few dozen levels deep on these inputs,
# but the limit is raised as a safety net against an unlucky run.
sys.setrecursionlimit(50000)

SORTERS = {
    "Heapsort": heapsort,
    "Randomized quicksort": randomized_quicksort,
    "Mergesort": merge_sort,
}


def run_benchmark():
    _verify_correctness()
    measurements = _measure_running_times()
    _plot_measurements(measurements)


def _verify_correctness():
    print("=== Correctness checks ===")
    test_cases = {
        "empty array": [],
        "single element": [42],
        "random array": _random_array(200),
        "repeated elements": _repeated_elements_array(200),
        "all equal elements": [7] * 100,
        "sorted array": _sorted_array(200),
        "reverse-sorted array": _reverse_sorted_array(200),
    }
    for case_name, case_input in test_cases.items():
        expected = sorted(case_input)
        results = [sort(list(case_input)) == expected for sort in SORTERS.values()]
        verdict = "PASS" if all(results) else "FAIL"
        print(f"  {case_name:<22} {verdict}")


def _measure_running_times():
    input_generators = {
        "Random": _random_array,
        "Sorted": _sorted_array,
        "Reverse-sorted": _reverse_sorted_array,
        "Repeated elements": _repeated_elements_array,
    }
    measurements = {}
    print(
        "\n=== Running-time comparison (milliseconds, average of "
        f"{TRIALS_PER_MEASUREMENT} trials) ==="
    )
    for distribution_name, generate_input in input_generators.items():
        print(f"\n--- {distribution_name} input ---")
        header = f"{'n':>7} | " + " | ".join(f"{name:>20}" for name in SORTERS)
        print(header)
        print("-" * len(header))
        per_algorithm = {name: [] for name in SORTERS}
        for size in INPUT_SIZES:
            row = [f"{size:>7}"]
            for name, sort in SORTERS.items():
                milliseconds = _average_sort_time_ms(sort, generate_input, size)
                per_algorithm[name].append(milliseconds)
                row.append(f"{milliseconds:>20.3f}")
            print(" | ".join(row))
        measurements[distribution_name] = per_algorithm
    return measurements


def _average_sort_time_ms(sort_function, generate_input, size):
    total_seconds = 0.0
    for _ in range(TRIALS_PER_MEASUREMENT):
        array = generate_input(size)
        start = time.perf_counter()
        sort_function(array)
        total_seconds += time.perf_counter() - start
    return total_seconds / TRIALS_PER_MEASUREMENT * 1000


def _plot_measurements(measurements):
    figure, axes = plt.subplots(2, 2, figsize=(12, 9))
    figure.suptitle(
        "Sorting run time by input distribution", fontsize=14, fontweight="bold"
    )
    for axis, (distribution_name, per_algorithm) in zip(
        axes.flat, measurements.items()
    ):
        for name, times in per_algorithm.items():
            axis.plot(INPUT_SIZES, times, marker="o", label=name)
        axis.set_title(distribution_name)
        axis.set_xlabel("Input size (n)")
        axis.set_ylabel("Time (ms)")
        axis.legend()
        axis.grid(True, linestyle=":", alpha=0.6)
    figure.tight_layout(rect=(0, 0, 1, 0.97))
    figure.savefig(PLOT_FILENAME, dpi=150)
    print(f"\nSaved plot to {PLOT_FILENAME}")


def _random_array(size):
    return [random.randint(0, size) for _ in range(size)]


def _repeated_elements_array(size):
    # A small pool relative to size yields about ten copies of each value, which
    # exercises duplicate handling without forcing quicksort into deep recursion.
    pool_size = max(10, size // 10)
    return [random.randint(0, pool_size) for _ in range(size)]


def _sorted_array(size):
    return list(range(size))


def _reverse_sorted_array(size):
    return list(range(size, 0, -1))


if __name__ == "__main__":
    run_benchmark()
