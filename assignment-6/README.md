# Overview

This folder contains 2 sub-folders
- [Task 1](./task1)
- [Task 2](./task2)

Each sub-folder corresponds to the implementation and analysis for part 1 and part 2 of the assignment.

- **Task 1 — Medians and Order Statistics.** Two selection algorithms that find the k-th smallest element, the randomized version that picks the pivot at random and the deterministic version that guarantees a good pivot with the median-of-medians rule.
- **Task 2 — Elementary Data Structures.** From-scratch implementations of an array, a matrix, a stack, a queue, a singly linked list, and a rooted tree, each with a demo that shows its behavior and checks its correctness.

# Requirements

- Python 3.

# Execution

At the root folder run

```bash
python3 assignment-6/main.py
```

Choose Task 1 or Task 2, and the root entry point delegates to that task's own entry point.

- Task 1 then offers two options, the demo or the full timing and recursion-depth benchmark.
- Task 2 runs its demo directly, since it has no benchmark.

# Structure

## task1 folder
- [Randomized Select](./task1/randomized_select.py) - Selection with a randomly chosen pivot
- [Deterministic Select](./task1/deterministic_select.py) - Selection with the median-of-medians pivot
- [Partition](./task1/partition.py) - Shared partition step used by both selection algorithms
- [Correctness](./task1/correctness.py) - Correctness checks for both algorithms
- [Demo](./task1/demo.py) - Behavior and correctness walkthrough
- [Benchmark](./task1/benchmark.py) - Timing table and recursion-depth experiment
- [Main](./task1/main.py) - Task 1 entry point that offers the demo or the benchmark
- [Analysis](./task1/analysis.md) - Detailed analysis of the selection algorithms

## task2 folder
- [Array](./task2/array_structure.py) - Dynamic contiguous array
- [Matrix](./task2/matrix.py) - Two-dimensional array built on rows of arrays
- [Stack](./task2/stack.py) - Array-based last in, first out stack
- [Queue](./task2/queue_structure.py) - Circular-array first in, first out queue
- [Linked List](./task2/linked_list.py) - Singly linked list
- [Rooted Tree](./task2/rooted_tree.py) - Left-child, right-sibling rooted tree
- [Demo](./task2/demo.py) - Behavior and correctness walkthrough for every structure
- [Main](./task2/main.py) - Task 2 entry point that runs the demo
- [Analysis](./task2/analysis.md) - Detailed analysis of the elementary data structures
