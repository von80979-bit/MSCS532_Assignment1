"""Assignment 3 entry point: prompts the user to select a task to run."""

from task1.benchmark import run_task1
from task2.demo import run_task2

TASKS = {
    "1": ("Randomized vs. Deterministic Quicksort", run_task1),
    "2": ("Hash Table with Chaining and Universal Hashing", run_task2),
}


def main():
    print("Assignment 3")
    for task_number, (task_title, _) in TASKS.items():
        print(f"  {task_number}. {task_title}")
    selection = input("Select a task to run (1 or 2): ").strip()
    if selection not in TASKS:
        print(f"Unknown selection: {selection!r}")
        return
    _, run_selected_task = TASKS[selection]
    run_selected_task()


if __name__ == "__main__":
    main()
