"""Randomized Quicksort: the pivot is chosen uniformly at random
from the subarray being partitioned (CLRS Section 7.3)."""

import random


def randomized_quicksort(array):
    """Sort the array in place and return it."""
    if len(array) < 2:
        return len(array)
    return _quicksort(array, 0, len(array) - 1, 1)


def _quicksort(array, low, high, depth):
    if low >= high:
        return depth
    pivot_position = _randomized_partition(array, low, high)
    left_depth = _quicksort(array, low, pivot_position - 1, depth + 1)
    right_depth = _quicksort(array, pivot_position + 1, high, depth + 1)
    return max(depth, left_depth, right_depth)


def _randomized_partition(array, low, high):
    # Choosing the pivot uniformly at random makes every split equally
    # likely, so no single input ordering can force the worst case.
    random_index = random.randint(low, high)
    array[random_index], array[high] = array[high], array[random_index]

    pivot_value = array[high]
    boundary = low
    # Sweep smaller-than-pivot values to the left of the boundary.
    for current in range(low, high):
        if array[current] < pivot_value:
            array[boundary], array[current] = array[current], array[boundary]
            boundary += 1
    # Drop the parked pivot into its final sorted position.
    array[boundary], array[high] = array[high], array[boundary]
    return boundary
