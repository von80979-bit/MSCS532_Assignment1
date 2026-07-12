"""Randomized Selection: the pivot for each partition is chosen uniformly at random from the current subarray,
giving expected linear time regardless of input order (CLRS Section 9.2)."""

import random

from partition import partition


def randomized_select(array, k):
    """Return the 0-indexed kth smallest element of array, mutating array in place."""
    if not 0 <= k < len(array):
        raise IndexError(f"k={k} is out of range for an array of length {len(array)}")
    return _randomized_select(array, 0, len(array) - 1, k)


def _randomized_select(array, low, high, k):
    if low == high:
        return array[low]
    pivot_position = _randomized_partition(array, low, high)
    if k == pivot_position:
        return array[pivot_position]
    if k < pivot_position:
        return _randomized_select(array, low, pivot_position - 1, k)
    return _randomized_select(array, pivot_position + 1, high, k)


def _randomized_partition(array, low, high):
    # Choosing the pivot uniformly at random makes every split equally likely, so no single input ordering can
    # force the worst case.
    random_index = random.randint(low, high)
    array[random_index], array[high] = array[high], array[random_index]
    return partition(array, low, high)
