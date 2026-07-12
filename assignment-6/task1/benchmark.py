"""Correctness checks and the empirical experiment matrix for Task 1's two selection algorithms. Each measured run
records both wall-clock time and maximum call-stack depth, the latter standing in for the recursion-driven space
overhead discussed in the analysis (CLRS Chapter 9)."""

import random
import sys
import time

from correctness import run_correctness_checks
from deterministic_select import deterministic_select
from randomized_select import randomized_select

INPUT_SIZES = [100, 500, 1000, 2500, 5000, 10000]
TRIALS_PER_MEASUREMENT = 3
REPEATED_VALUE_POOL_SIZE = 10

# All-duplicate input drives the Lomuto partition to its most unbalanced split, so the recursion guard is raised
# well above the largest input size to keep that run from aborting.
RECURSION_LIMIT = max(INPUT_SIZES) + 2000

VARIANTS = {
    "Randomized": randomized_select,
    "Deterministic": deterministic_select,
}


def run_benchmark():
    sys.setrecursionlimit(RECURSION_LIMIT)
    if not run_correctness_checks():
        print("\nCorrectness checks failed; aborting before the timed benchmark.")
        return None
    return _measure_experiment_matrix()


def _measure_experiment_matrix():
    input_generators = {
        "Random": _random_array,
        "Sorted": _sorted_array,
        "Reverse-sorted": _reverse_sorted_array,
        "Repeated elements": _repeated_elements_array,
    }
    print(
        "\n=== Experiment matrix (time in milliseconds and maximum call-stack depth, average of "
        f"{TRIALS_PER_MEASUREMENT} trials, k = n // 2) ==="
    )
    measurements = {}
    for distribution_name, generate_input in input_generators.items():
        measurements[distribution_name] = _measure_distribution(distribution_name, generate_input)
    return measurements


def _measure_distribution(distribution_name, generate_input):
    print(f"\n--- {distribution_name} input ---")
    header = f"{'n':>6} | {'Rand. (ms)':>12} | {'Det. (ms)':>12} | {'Rand. depth':>11} | {'Det. depth':>11}"
    print(header)
    print("-" * len(header))

    per_variant = {name: {"time_ms": [], "depth": []} for name in VARIANTS}
    for size in INPUT_SIZES:
        for name, select_function in VARIANTS.items():
            milliseconds, depth = _measure(select_function, generate_input, size)
            per_variant[name]["time_ms"].append(milliseconds)
            per_variant[name]["depth"].append(depth)
        print(
            f"{size:>6} | "
            f"{per_variant['Randomized']['time_ms'][-1]:>12.3f} | "
            f"{per_variant['Deterministic']['time_ms'][-1]:>12.3f} | "
            f"{per_variant['Randomized']['depth'][-1]:>11.0f} | "
            f"{per_variant['Deterministic']['depth'][-1]:>11.0f}"
        )
    return per_variant


def _measure(select_function, generate_input, size):
    k = size // 2
    total_seconds = 0.0
    total_depth = 0
    for _ in range(TRIALS_PER_MEASUREMENT):
        array = generate_input(size)
        start = time.perf_counter()
        select_function(list(array), k)
        total_seconds += time.perf_counter() - start
        total_depth += _measure_max_call_depth(select_function, list(array), k)
    average_ms = total_seconds / TRIALS_PER_MEASUREMENT * 1000
    average_depth = total_depth / TRIALS_PER_MEASUREMENT
    return average_ms, average_depth


def _measure_max_call_depth(select_function, array, k):
    """Return the deepest the Python call stack reaches while select_function(array, k) runs.

    A trace function counts stack frames as they open and close instead of timing the call, so the recursion
    depth this reports never pollutes the wall-clock measurement taken alongside it.
    """
    depth = 0
    max_depth = 0

    def _tracer(frame, event, arg):
        nonlocal depth, max_depth
        if event == "call":
            depth += 1
            max_depth = max(max_depth, depth)
        elif event == "return":
            depth -= 1
        return _tracer

    sys.settrace(_tracer)
    try:
        select_function(array, k)
    finally:
        sys.settrace(None)
    return max_depth


def _random_array(size):
    return [random.randint(0, size) for _ in range(size)]


def _repeated_elements_array(size):
    # A small fixed value pool yields many duplicates of each key, which is the input that a two-region partition
    # handles poorly.
    return [random.randint(0, REPEATED_VALUE_POOL_SIZE - 1) for _ in range(size)]


def _sorted_array(size):
    return list(range(size))


def _reverse_sorted_array(size):
    return list(range(size, 0, -1))


if __name__ == "__main__":
    run_benchmark()
