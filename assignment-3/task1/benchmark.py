"""Correctness checks and run-time comparison of Randomized Quicksort
versus Deterministic (first-element pivot) Quicksort."""

import random
import sys
import time

from task1.deterministic_quicksort import deterministic_quicksort
from task1.randomized_quicksort import randomized_quicksort

INPUT_SIZES = [100, 500, 1000, 2500, 5000]
TRIALS_PER_MEASUREMENT = 3
REPEATED_VALUE_POOL_SIZE = 10

# The deterministic variant recurses n levels deep on sorted input,
# so increase the recursion limit of the interpreter to avoid crashing the test.
RECURSION_LIMIT = max(INPUT_SIZES) + 1000


def run_task1():
    sys.setrecursionlimit(RECURSION_LIMIT)
    _verify_correctness()
    _compare_running_times()


def _verify_correctness():
    print("\n=== Correctness checks ===")
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
        randomized_result = randomized_quicksort(list(case_input))
        deterministic_result = deterministic_quicksort(list(case_input))
        passed = randomized_result == expected and deterministic_result == expected
        print(f"  {case_name:<22} {'PASS' if passed else 'FAIL'}")


def _compare_running_times():
    # Define the array input types
    input_generators = {
        "Random": _random_array,
        "Repeated elements": _repeated_elements_array,
        "Sorted": _sorted_array,
        "Reverse-sorted": _reverse_sorted_array,
    }
    print(
        "\n=== Running-time comparison (milliseconds, average of "
        f"{TRIALS_PER_MEASUREMENT} trials) ==="
    )
    header = f"{'n':>6} | {'Randomized (ms)':>15} | {'Deterministic (ms)':>18}"
    for distribution_name, generate_input in input_generators.items():
        print(f"\n--- {distribution_name} input ---")
        print(header)
        print("-" * len(header))
        # For each input size run the 2 sorting variant algorithm 3 times (TRIALS_PER_MEASUREMENT)
        # And collect the average run time of the 3 runs
        for size in INPUT_SIZES:
            randomized_ms = _average_sort_time_ms(
                randomized_quicksort, generate_input, size
            )
            deterministic_ms = _average_sort_time_ms(
                deterministic_quicksort, generate_input, size
            )
            print(f"{size:>6} | {randomized_ms:>15.3f} | {deterministic_ms:>18.3f}")


def _average_sort_time_ms(sort_function, generate_input, size):
    total_seconds = 0.0
    for _ in range(TRIALS_PER_MEASUREMENT):
        array = generate_input(size)
        start = time.perf_counter()
        sort_function(array)
        total_seconds += time.perf_counter() - start
    return total_seconds / TRIALS_PER_MEASUREMENT * 1000


def _random_array(size):
    return [random.randint(0, size) for _ in range(size)]


def _repeated_elements_array(size):
    return [random.randint(0, REPEATED_VALUE_POOL_SIZE - 1) for _ in range(size)]


def _sorted_array(size):
    return list(range(size))


def _reverse_sorted_array(size):
    return list(range(size, 0, -1))


if __name__ == "__main__":
    run_task1()
