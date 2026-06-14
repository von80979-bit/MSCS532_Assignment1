"""Heapsort: sort a list in place in O(n log n) using a max-heap.

The array is first arranged into a max-heap, so the largest element sits at the root. That root is swapped to the end of
the unsorted region, the heap shrinks by one, and the new root is bubbled down to restore the heap. Repeating this places
each maximum into its final sorted position from the back of the array forward.
"""

from max_heap import build_max_heap, max_heapify


def heapsort(array):
    """Sort the array in place in non-decreasing order and return it."""
    build_max_heap(array)
    for end in range(len(array) - 1, 0, -1):
        # Move the current maximum at the root to its final sorted position.
        array[0], array[end] = array[end], array[0]
        # Restore the heap over the still-unsorted prefix array[0:end].
        max_heapify(array, 0, end)
    return array


def run_demo():
    """Print a short demonstration that the sort works."""
    sample = [5, 3, 8, 1, 9, 2, 7, 4, 6, 0]
    print("input :", sample)
    print("sorted:", heapsort(list(sample)))


if __name__ == "__main__":
    run_demo()
