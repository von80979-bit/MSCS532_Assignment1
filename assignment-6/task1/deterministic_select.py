"""Deterministic Selection: the pivot for each partition is the median of medians of groups of five, guaranteeing
worst-case linear time regardless of input order (CLRS Section 9.3)."""

from partition import partition

GROUP_SIZE = 5


def deterministic_select(array, k):
    """Return the 0-indexed kth smallest element of array, mutating array in place."""
    if not 0 <= k < len(array):
        raise IndexError(f"k={k} is out of range for an array of length {len(array)}")
    return _deterministic_select(array, 0, len(array) - 1, k)


def _deterministic_select(array, low, high, k):
    if low == high:
        return array[low]
    pivot_position = _partition_on_median_of_medians(array, low, high)
    if k == pivot_position:
        return array[pivot_position]
    if k < pivot_position:
        return _deterministic_select(array, low, pivot_position - 1, k)
    return _deterministic_select(array, pivot_position + 1, high, k)


def _partition_on_median_of_medians(array, low, high):
    pivot_value = _median_of_medians(array, low, high)
    pivot_index = _index_of(array, low, high, pivot_value)
    array[pivot_index], array[high] = array[high], array[pivot_index]
    return partition(array, low, high)


def _median_of_medians(array, low, high):
    # Sort each group of at most five elements in place and swap its median into a contiguous band at the front of
    # array[low..high]; the recursive call below then finds the median of that band without allocating a list.
    group_count = 0
    for group_start in range(low, high + 1, GROUP_SIZE):
        group_end = min(group_start + GROUP_SIZE - 1, high)
        _insertion_sort(array, group_start, group_end)
        group_median_index = group_start + (group_end - group_start) // 2
        band_index = low + group_count
        array[band_index], array[group_median_index] = array[group_median_index], array[band_index]
        group_count += 1

    band_high = low + group_count - 1
    if band_high == low:
        return array[low]

    median_rank = low + (group_count - 1) // 2
    return _deterministic_select(array, low, band_high, median_rank)


def _index_of(array, low, high, value):
    for index in range(low, high + 1):
        if array[index] == value:
            return index
    raise ValueError(f"pivot value {value} not found in array[{low}..{high}]")


def _insertion_sort(array, low, high):
    for i in range(low + 1, high + 1):
        key = array[i]
        j = i - 1
        while j >= low and array[j] > key:
            array[j + 1] = array[j]
            j -= 1
        array[j + 1] = key
