"""Randomized Quicksort: the pivot is chosen uniformly at random
from the subarray being partitioned (CLRS Section 7.3)."""

import random


def randomized_quicksort(array):
    """Sort the array in place and return it."""
    _quicksort(array, 0, len(array) - 1)
    return array


def _quicksort(array, low, high):
    if low >= high:
        return
    pivot_position = _randomized_partition(array, low, high)
    _quicksort(array, low, pivot_position - 1)
    _quicksort(array, pivot_position + 1, high)


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
