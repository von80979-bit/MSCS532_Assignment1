"""Load test that benchmarks quick sort and merge sort across dataset shapes."""

import random
import time
import tracemalloc

from merge_sort import merge_sort
from plot import plot_metrics
from quick_sort import quick_sort

INPUT_SIZES = [100, 1000, 5000, 10000, 25000, 50000]
SORTING_ALGORITHMS = {"quick_sort": quick_sort, "merge_sort": merge_sort}
GRAPH_OUTPUT_PATH = "performance_metrics.png"


def build_datasets(size):
    # Three shapes exercise the best, worst, and average cases of each sort.
    random_numbers = random.sample(range(size * 10), size)
    return {
        "sorted": sorted(random_numbers),
        "reverse_sorted": sorted(random_numbers, reverse=True),
        "random": random_numbers,
    }


def measure(sort_function, numbers):
    # Sort a fresh copy so every run starts from identical input.
    data_to_sort = list(numbers)
    tracemalloc.start()
    start_time = time.perf_counter()
    sort_function(data_to_sort)
    elapsed_seconds = time.perf_counter() - start_time
    _, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return elapsed_seconds, peak_bytes / 1024


def run_load_test():
    results = _empty_results()
    print("============================")
    for size in INPUT_SIZES:
        datasets = build_datasets(size)
        for algorithm_name, sort_function in SORTING_ALGORITHMS.items():
            for dataset_shape, numbers in datasets.items():
                elapsed_seconds, peak_kilobytes = measure(sort_function, numbers)
                record = results[algorithm_name][dataset_shape]
                record["sizes"].append(size)
                record["times"].append(elapsed_seconds)
                record["memory"].append(peak_kilobytes)
                print(
                    f"{algorithm_name:11} {dataset_shape:15} n={size:6} "
                    f"{elapsed_seconds:.4f}s {peak_kilobytes:8.1f}KB"
                )
            print("============================")
    return results


def _empty_results():
    shapes = ("sorted", "reverse_sorted", "random")
    return {
        algorithm_name: {
            shape: {"sizes": [], "times": [], "memory": []} for shape in shapes
        }
        for algorithm_name in SORTING_ALGORITHMS
    }


def test_quick_sort():
    nums = random.sample(range(100), 20)
    print("Sorting with Quick Sort")
    print("\t- Original list: ", nums)
    sorted_numbers = quick_sort(nums)
    print("\t- Sorted list: ", sorted_numbers)


def test_merge_sort():
    nums = random.sample(range(100), 20)
    print("Sorting with Merge Sort")
    print("\t- Original list: ", nums)
    sorted_numbers = merge_sort(nums)
    print("\t- Sorted list: ", sorted_numbers)


if __name__ == "__main__":
    test_quick_sort()
    test_merge_sort()
    results = run_load_test()
    output_path = plot_metrics(results, GRAPH_OUTPUT_PATH)
    print(f"Saved performance graphs to {output_path}")
