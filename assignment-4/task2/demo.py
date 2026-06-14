"""Scheduling demonstration for the max-heap priority queue.

The script inserts a small set of tasks, including a pair that share a priority so the arrival-time tie-break is visible,
raises one task and lowers another mid-stream, then serves every task in turn and prints the execution order. An inline
check confirms the order respects priority and then arrival, and that every task stays retrievable after the re-keying.

"""

from priority_queue import PriorityQueue
from task import Task


def run_demo():
    tasks = [
        Task(task_id=1, priority=5, arrival_time=0, deadline=10),
        Task(task_id=2, priority=3, arrival_time=1, deadline=8),
        Task(task_id=3, priority=5, arrival_time=2, deadline=12),
        Task(task_id=4, priority=1, arrival_time=3, deadline=6),
        Task(task_id=5, priority=4, arrival_time=4, deadline=9),
    ]

    queue = PriorityQueue()
    print("=== Inserted tasks ===")
    for task in tasks:
        queue.insert(task)
        print(f"  inserted {task}")
    print("\n=== Original order ===")
    tasks.sort(key=lambda t: (-t.priority, t.arrival_time))
    for task in tasks:
        print(
            f"  task {task.task_id} "
            f"(priority {task.priority}, arrival {task.arrival_time})"
        )

    print("\n=== Re-keying ===")
    queue.increase_key(task_id=2, new_priority=6)
    print("  increase_key: task 2 priority 3 -> 6")
    queue.decrease_key(task_id=5, new_priority=2)
    print("  decrease_key: task 5 priority 4 -> 2")

    _check_retrievable_after_rekey(queue, expected={1: 5, 2: 6, 3: 5, 4: 1, 5: 2})

    print("\n=== Execution order (extract_max until empty) ===")
    expected_order = _expected_order(queue)
    served_order = []
    while not queue.is_empty():
        task = queue.extract_max()
        served_order.append(task.task_id)
        print(
            f"  served task {task.task_id} "
            f"(priority {task.priority}, arrival {task.arrival_time})"
        )

    _check_order(served_order, expected_order)


def _expected_order(queue):
    # Independently rank the tasks still in the queue by priority, then by
    # earlier arrival, to compare against what extract_max produces.
    snapshot = list(queue._heap)
    snapshot.sort(key=lambda task: (-task.priority, task.arrival_time))
    return [task.task_id for task in snapshot]


def _check_retrievable_after_rekey(queue, expected):
    all_present = all(task_id in queue for task_id in expected)
    priorities_match = all(
        queue.priority_of(task_id) == priority for task_id, priority in expected.items()
    )
    verdict = "PASS" if all_present and priorities_match else "FAIL"
    print(f"  retrievable after re-keying: {verdict}")


def _check_order(served_order, expected_order):
    verdict = "PASS" if served_order == expected_order else "FAIL"
    print(f"\nexecution order respects priority then arrival: {verdict}")
    print(f"  served:   {served_order}")
    print(f"  expected: {expected_order}")


if __name__ == "__main__":
    run_demo()
