"""Task 1 demo: shows both selection algorithms picking the same kth-smallest element from a sample array, then
runs the correctness battery so the demo doubles as a quick behavior check (CLRS Chapter 9)."""

from correctness import run_correctness_checks
from deterministic_select import deterministic_select
from randomized_select import randomized_select


def run_demo():
    """Print a short demonstration that both selection algorithms work, followed by the correctness battery."""
    sample = [5, 3, 8, 1, 9, 2, 7, 4, 6, 0]
    k = len(sample) // 2
    print("input:", sample)
    print(f"randomized_select(array, k={k})   ->", randomized_select(list(sample), k))
    print(f"deterministic_select(array, k={k}) ->", deterministic_select(list(sample), k))
    print()
    run_correctness_checks()


if __name__ == "__main__":
    run_demo()
