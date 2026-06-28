"""Correctness checks and the empirical experiment matrix for the two Quicksort variants. Each sort reports both its
running time and its maximum recursion depth, the latter standing in for the call-stack space the in-place sort uses.
"""

import random
import sys
import time

from deterministic_quicksort import deterministic_quicksort
from randomized_quicksort import randomized_quicksort

INPUT_SIZES = [100, 500, 1000, 2500, 5000, 10000]
TRIALS_PER_MEASUREMENT = 3
REPEATED_VALUE_POOL_SIZE = 10

# The first-element pivot recurses n levels deep on sorted / reverse-sorted
# input, so the interpreter's recursion guard is raised well above the largest
# input size to keep the worst case from aborting the run.
RECURSION_LIMIT = max(INPUT_SIZES) + 2000

VARIANTS = {
    "Deterministic": deterministic_quicksort,
    "Randomized": randomized_quicksort,
}


def run_benchmark():
    sys.setrecursionlimit(RECURSION_LIMIT)
    _verify_correctness()
    return _measure_experiment_matrix()


def _verify_correctness():
    print("=== Correctness checks ===")
    test_cases = {
        "empty array": [],
        "single element": [42],
        "random array": _random_array(200),
        "repeated elements": _repeated_elements_array(200),
        "sorted array": _sorted_array(200),
        "reverse-sorted array": _reverse_sorted_array(200),
        "all equal elements": [7] * 100,
    }
    for case_name, case_input in test_cases.items():
        expected = sorted(case_input)
        results = []
        for sort_function in VARIANTS.values():
            array = list(case_input)
            sort_function(array)
            results.append(array == expected)
        verdict = "PASS" if all(results) else "FAIL"
        print(f"  {case_name:<22} {verdict}")


def _measure_experiment_matrix():
    input_generators = {
        "Random": _random_array,
        "Sorted": _sorted_array,
        "Reverse-sorted": _reverse_sorted_array,
        "Repeated elements": _repeated_elements_array,
    }
    print(
        "\n=== Experiment matrix (time in milliseconds and maximum recursion "
        f"depth, average of {TRIALS_PER_MEASUREMENT} trials) ==="
    )
    measurements = {}
    for distribution_name, generate_input in input_generators.items():
        measurements[distribution_name] = _measure_distribution(
            distribution_name, generate_input
        )
    return measurements


def _measure_distribution(distribution_name, generate_input):
    print(f"\n--- {distribution_name} input ---")
    header = (
        f"{'n':>6} | {'Det. (ms)':>12} | {'Rand. (ms)':>12} | "
        f"{'Det. depth':>11} | {'Rand. depth':>11}"
    )
    print(header)
    print("-" * len(header))

    per_variant = {name: {"time_ms": [], "depth": []} for name in VARIANTS}
    for size in INPUT_SIZES:
        for name, sort_function in VARIANTS.items():
            milliseconds, depth = _measure(sort_function, generate_input, size)
            per_variant[name]["time_ms"].append(milliseconds)
            per_variant[name]["depth"].append(depth)
        print(
            f"{size:>6} | "
            f"{per_variant['Deterministic']['time_ms'][-1]:>12.3f} | "
            f"{per_variant['Randomized']['time_ms'][-1]:>12.3f} | "
            f"{per_variant['Deterministic']['depth'][-1]:>11.0f} | "
            f"{per_variant['Randomized']['depth'][-1]:>11.0f}"
        )
    return per_variant


def _measure(sort_function, generate_input, size):
    total_seconds = 0.0
    total_depth = 0
    for _ in range(TRIALS_PER_MEASUREMENT):
        array = generate_input(size)
        start = time.perf_counter()
        depth = sort_function(array)
        total_seconds += time.perf_counter() - start
        total_depth += depth
    average_ms = total_seconds / TRIALS_PER_MEASUREMENT * 1000
    average_depth = total_depth / TRIALS_PER_MEASUREMENT
    return average_ms, average_depth


def _random_array(size):
    return [random.randint(0, size) for _ in range(size)]


def _repeated_elements_array(size):
    # A small fixed value pool yields many duplicates of each key, which is the
    # input that a two-region partition handles poorly.
    return [random.randint(0, REPEATED_VALUE_POOL_SIZE - 1) for _ in range(size)]


def _sorted_array(size):
    return list(range(size))


def _reverse_sorted_array(size):
    return list(range(size, 0, -1))


if __name__ == "__main__":
    run_benchmark()
