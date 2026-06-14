# Overview

This folder contains 2 sub-folder
- [Task 1](./task1)
- [Taks 2](./task2)

Each sub-folder corresponding to the implementation and analysis for part 1 and part 2 of the assignment

# Requirements

- Python 3.
- matplotlib, used by the two benchmark scripts to save their plots.

```bash
pip install matplotlib
```

# Execution
At the root folder run
```bash
python3 assignment-4/main.py
```

Follow the instruction to run one of the options. Each task offers two options:
- Task 1: heapsort demo or benchmark
- Task 2: priority queue demo or benchmark

# Structure

## task1 folder
- [Max Heap](./task1/max_heap.py) - Implementation of the array backed max-heap core
- [Heapsort](./task1/heapsort.py) - Implementation of heapsort and its demo
- [Randomized Quicksort](./task1/randomized_quicksort.py) - Comparison sort used in the benchmark
- [Merge Sort](./task1/merge_sort.py) - Comparison sort used in the benchmark
- [Benchmark](./task1/benchmark.py) - Correctness checks, timing table, and the comparison plot
- [Analysis](./task1/analysis.md) - Details analysis of Heapsort run time

## task2 folder
- [Task](./task2/task.py) - The Task value object scheduled by the priority queue
- [Priority Queue](./task2/priority_queue.py) - Implementation of the max-heap priority queue
- [Demo](./task2/demo.py) - Scheduling scenario and its execution order
- [Benchmark](./task2/benchmark.py) - Per-operation timing table and the scaling plot
- [Analysis](./task2/analysis.md) - Details analysis of Priority Queue run time
</content>
</invoke>
