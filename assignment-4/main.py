"""Assignment 4 entry point: prompts the user to select an option to run.

Each task offers two options, a demo and a benchmark.
"""

import importlib
import os
import sys
from collections import namedtuple

Option = namedtuple("Option", ["title", "folder", "module", "function"])

OPTIONS = {
    "1": Option("Task 1: Heapsort demo", "task1", "heapsort", "run_demo"),
    "2": Option("Task 1: Heapsort benchmark", "task1", "benchmark", "run_benchmark"),
    "3": Option("Task 2: Priority queue demo", "task2", "demo", "run_demo"),
    "4": Option(
        "Task 2: Priority queue benchmark", "task2", "benchmark", "run_benchmark"
    ),
}

ASSIGNMENT_ROOT = os.path.dirname(os.path.abspath(__file__))


def run_option(option):
    sys.path.insert(0, os.path.join(ASSIGNMENT_ROOT, option.folder))
    module = importlib.import_module(option.module)
    getattr(module, option.function)()


def main():
    print("Assignment 4")
    for number, option in OPTIONS.items():
        print(f"  {number}. {option.title}")
    selection = input("Select an option to run (1-4): ").strip()
    if selection not in OPTIONS:
        print(f"Unknown selection: {selection!r}")
        return
    run_option(OPTIONS[selection])


if __name__ == "__main__":
    main()
