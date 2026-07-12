"""Correctness battery shared by both Task 1 selection algorithms, checked against an independently sorted
reference across representative input shapes (CLRS Chapter 9)."""

import random

from deterministic_select import deterministic_select
from randomized_select import randomized_select

CASE_SIZE = 100

VARIANTS = {
    "Randomized": randomized_select,
    "Deterministic": deterministic_select,
}


def run_correctness_checks():
    """Print a pass/fail verdict per case per algorithm and return True iff every case passed for every algorithm."""
    print("=== Correctness checks ===")
    all_passed = True
    for label, select_function in VARIANTS.items():
        for case_name, case_input in _test_cases().items():
            passed = _check_case(select_function, case_input)
            all_passed = all_passed and passed
            verdict = "PASS" if passed else "FAIL"
            print(f"  [{label:<12}] {case_name:<22} {verdict}")
    return all_passed


def _check_case(select_function, case_input):
    reference = sorted(case_input)
    return all(select_function(list(case_input), k) == reference[k] for k in range(len(case_input)))


def _test_cases():
    return {
        "empty array": [],
        "single element": [42],
        "random array": _random_array(CASE_SIZE),
        "sorted array": list(range(CASE_SIZE)),
        "reverse-sorted array": list(range(CASE_SIZE, 0, -1)),
        "all-duplicate array": [7] * CASE_SIZE,
    }


def _random_array(size):
    return [random.randint(0, size) for _ in range(size)]


if __name__ == "__main__":
    passed = run_correctness_checks()
    print("\nAll cases passed." if passed else "\nSome cases failed.")
