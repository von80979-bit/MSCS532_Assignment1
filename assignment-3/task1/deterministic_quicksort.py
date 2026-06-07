"""Deterministic Quicksort: the first element of the subarray is always
chosen as the pivot. Sorted and reverse-sorted inputs therefore produce
the most unbalanced splits possible (0 and n-1 elements), driving the
running time to Theta(n^2)."""


def deterministic_quicksort(array):
    """Sort the array in place and return it."""
    _quicksort(array, 0, len(array) - 1)
    return array


def _quicksort(array, low, high):
    if low >= high:
        return
    pivot_position = _partition_with_first_element_pivot(array, low, high)
    _quicksort(array, low, pivot_position - 1)
    _quicksort(array, pivot_position + 1, high)


def _partition_with_first_element_pivot(array, low, high):
    # Move the first element to the end.
    array[low], array[high] = array[high], array[low]

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
