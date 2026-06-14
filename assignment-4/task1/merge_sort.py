"""Merge sort: stable, O(n log n) divide-and-conquer using an auxiliary buffer.

Reused from assignment-2 (merge_sort.py)
"""


def merge_sort(numbers):
    if len(numbers) <= 1:
        return numbers
    # Divide: split the list in half and sort each half independently.
    middle = len(numbers) // 2
    left_half = merge_sort(numbers[:middle])
    right_half = merge_sort(numbers[middle:])
    # Conquer: merge the two sorted halves back into a single sorted list.
    return _merge(left_half, right_half)


def _merge(left, right):
    merged = []
    left_index = 0
    right_index = 0
    # Repeatedly take the smaller front element to keep the result sorted.
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            merged.append(left[left_index])
            left_index += 1
        else:
            merged.append(right[right_index])
            right_index += 1
    merged.extend(left[left_index:])
    merged.extend(right[right_index:])
    return merged
