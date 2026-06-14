"""Per-operation scaling study for the max-heap priority queue.

For each heap size the script times insert, extract_max, increase_key, and decrease_key, averaging about a thousand
operations per measurement to reduce noise. It prints a table and saves a plot of average operation time against heap
size on a log-scaled x-axis, where an O(log n) cost shows up as a slowly rising near-straight line.
"""

import random
from time import perf_counter

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from priority_queue import PriorityQueue
from task import Task

HEAP_SIZES = [1000, 5000, 10000, 50000, 100000]
OPERATIONS_PER_MEASUREMENT = 1000
MAX_PRIORITY = 10**6
REKEY_STEP = 1000
PLOT_FILENAME = "operation_scaling.png"

MICROSECONDS_PER_SECOND = 1_000_000


def run_benchmark():
    measurements = _measure_operations()
    _print_table(measurements)
    _plot_measurements(measurements)


def _measure_operations():
    timers = {
        "insert": _time_insert,
        "extract_max": _time_extract_max,
        "increase_key": _time_increase_key,
        "decrease_key": _time_decrease_key,
    }
    return {
        name: [timer(size) for size in HEAP_SIZES] for name, timer in timers.items()
    }


def _build_queue(size):
    queue = PriorityQueue()
    for task_id in range(size):
        priority = random.randint(0, MAX_PRIORITY)
        queue.insert(Task(task_id, priority, arrival_time=task_id, deadline=0))
    return queue


def _time_insert(size):
    queue = _build_queue(size)
    new_tasks = [
        Task(size + offset, random.randint(0, MAX_PRIORITY), size + offset, 0)
        for offset in range(OPERATIONS_PER_MEASUREMENT)
    ]
    start = perf_counter()
    for task in new_tasks:
        queue.insert(task)
    return _average_microseconds(start, len(new_tasks))


def _time_extract_max(size):
    # Start larger so the heap stays near `size` while the timed extractions run.
    queue = _build_queue(size + OPERATIONS_PER_MEASUREMENT)
    start = perf_counter()
    for _ in range(OPERATIONS_PER_MEASUREMENT):
        queue.extract_max()
    return _average_microseconds(start, OPERATIONS_PER_MEASUREMENT)


def _time_increase_key(size):
    queue = _build_queue(size)
    selected_ids = random.sample(range(size), min(OPERATIONS_PER_MEASUREMENT, size))
    # Resolve the new priorities before timing so the loop is pure heap work.
    updates = [
        (task_id, queue.priority_of(task_id) + random.randint(1, REKEY_STEP))
        for task_id in selected_ids
    ]
    start = perf_counter()
    for task_id, new_priority in updates:
        queue.increase_key(task_id, new_priority)
    return _average_microseconds(start, len(updates))


def _time_decrease_key(size):
    queue = _build_queue(size)
    selected_ids = random.sample(range(size), min(OPERATIONS_PER_MEASUREMENT, size))
    updates = [
        (task_id, queue.priority_of(task_id) - random.randint(1, REKEY_STEP))
        for task_id in selected_ids
    ]
    start = perf_counter()
    for task_id, new_priority in updates:
        queue.decrease_key(task_id, new_priority)
    return _average_microseconds(start, len(updates))


def _average_microseconds(start_time, operation_count):
    elapsed_seconds = perf_counter() - start_time
    return elapsed_seconds / operation_count * MICROSECONDS_PER_SECOND


def _print_table(measurements):
    print(
        "=== Average operation time (microseconds, "
        f"{OPERATIONS_PER_MEASUREMENT} operations per measurement) ==="
    )
    operation_names = list(measurements)
    header = f"{'n':>8} | " + " | ".join(f"{name:>13}" for name in operation_names)
    print(header)
    print("-" * len(header))
    for size_index, size in enumerate(HEAP_SIZES):
        row = [f"{size:>8}"]
        for name in operation_names:
            row.append(f"{measurements[name][size_index]:>13.3f}")
        print(" | ".join(row))


def _plot_measurements(measurements):
    figure, axis = plt.subplots(figsize=(9, 6))
    for name, times in measurements.items():
        axis.plot(HEAP_SIZES, times, marker="o", label=name)
    axis.set_xscale("log")
    axis.set_title("Priority queue operation time by heap size")
    axis.set_xlabel("Heap size (n), log scale")
    axis.set_ylabel("Average time per operation (microseconds)")
    axis.legend()
    axis.grid(True, which="both", linestyle=":", alpha=0.6)
    figure.tight_layout()
    figure.savefig(PLOT_FILENAME, dpi=150)
    print(f"\nSaved plot to {PLOT_FILENAME}")


if __name__ == "__main__":
    run_benchmark()
