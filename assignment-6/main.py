"""Assignment 6 entry point: prompts the user to choose a task and delegates to that task's own entry point."""

import importlib
import os
import sys
from collections import namedtuple

Task = namedtuple("Task", ["title", "folder"])

TASKS = {
    "1": Task("Task 1: Medians and Order Statistics", "task1"),
    "2": Task("Task 2: Elementary Data Structures", "task2"),
}

ASSIGNMENT_ROOT = os.path.dirname(os.path.abspath(__file__))


def run_task(task):
    sys.path.insert(0, os.path.join(ASSIGNMENT_ROOT, task.folder))
    task_entry_point = importlib.import_module("main")
    task_entry_point.main()


def main():
    print("Assignment 6")
    for number, task in TASKS.items():
        print(f"  {number}. {task.title}")
    selection = input("Select a task to run (1-2): ").strip()
    if selection not in TASKS:
        print(f"Unknown selection: {selection!r}")
        return
    run_task(TASKS[selection])


if __name__ == "__main__":
    main()
