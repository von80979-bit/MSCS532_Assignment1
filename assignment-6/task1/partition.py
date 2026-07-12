"""Shared in-place two-way (Lomuto) partition used by both Task 1 selection algorithms (CLRS Section 7.1)."""


def partition(array, low, high):
    """Partition array[low..high] around the pivot array[high].

    Rearranges the subarray in place so that every element at or before the returned index is less than or equal
    to the pivot value, and every element after it is greater than or equal to the pivot value, then returns the
    pivot's final index.
    """
    pivot_value = array[high]
    boundary = low
    for current in range(low, high):
        if array[current] <= pivot_value:
            array[boundary], array[current] = array[current], array[boundary]
            boundary += 1
    array[boundary], array[high] = array[high], array[boundary]
    return boundary
