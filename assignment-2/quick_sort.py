"""Quick sort: in-place, median-of-three pivot to avoid worst-case on ordered input."""


def quick_sort(numbers):
    _quick_sort(numbers, 0, len(numbers) - 1)
    return numbers


def _quick_sort(numbers, low, high):
    if low >= high:
        return
    # Partition around a pivot, then recurse into the smaller and larger sides.
    pivot_index = _partition(numbers, low, high)
    _quick_sort(numbers, low, pivot_index - 1)
    _quick_sort(numbers, pivot_index + 1, high)


def _partition(numbers, low, high):
    pivot = _median_of_three(numbers, low, high)
    boundary = low
    # Sweep smaller-than-pivot values to the left of the boundary.
    for current in range(low, high):
        if numbers[current] < pivot:
            numbers[boundary], numbers[current] = numbers[current], numbers[boundary]
            boundary += 1
    # Drop the parked pivot into its final sorted position.
    numbers[boundary], numbers[high] = numbers[high], numbers[boundary]
    return boundary


def _median_of_three(numbers, low, high):
    middle = (low + high) // 2
    # Order the three samples so the median value lands at the middle index.
    if numbers[middle] < numbers[low]:
        numbers[low], numbers[middle] = numbers[middle], numbers[low]
    if numbers[high] < numbers[low]:
        numbers[low], numbers[high] = numbers[high], numbers[low]
    if numbers[high] < numbers[middle]:
        numbers[middle], numbers[high] = numbers[high], numbers[middle]
    # Park the median at high so the partition can use it as the pivot.
    numbers[middle], numbers[high] = numbers[high], numbers[middle]
    return numbers[high]
