"""Task 1 entry point: prompts the user to choose between the demo and the full benchmark."""

from benchmark import run_benchmark
from demo import run_demo

OPTIONS = {
    "1": ("Demo (behavior and correctness)", run_demo),
    "2": ("Full benchmark (timing and recursion depth)", run_benchmark),
}


def main():
    print("Task 1: Medians and Order Statistics")
    for number, (title, _) in OPTIONS.items():
        print(f"  {number}. {title}")
    selection = input("Select an option to run (1-2): ").strip()
    if selection not in OPTIONS:
        print(f"Unknown selection: {selection!r}")
        return
    _, run = OPTIONS[selection]
    run()


if __name__ == "__main__":
    main()
