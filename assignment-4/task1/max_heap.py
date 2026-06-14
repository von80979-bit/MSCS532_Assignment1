"""Array backed max-heap core used by heapsort.

The heap lives in a 0-indexed Python list. For a node at index i:
    parent(i) = (i - 1) // 2
    left(i)   = 2 * i + 1
    right(i)  = 2 * i + 2
"""


def build_max_heap(array):
    """Rearrange the array into a max-heap in place, in O(n) time.

    Every leaf is already a valid heap of one element, so the work starts at the last internal node and moves toward
    the root. By the time max_heapify runs on a node, both of its child subtrees already satisfy the heap property.
    """
    size = len(array)
    last_internal_node = size // 2 - 1
    for index in range(last_internal_node, -1, -1):
        max_heapify(array, index, size)


def max_heapify(array, index, size):
    """Restore the max-heap property for the subtree rooted at index.

    The node at index may be smaller than a child while both child subtrees are already valid heaps. The larger child
    rises and the node sinks until it settles, which costs O(log n) because the path to a leaf has that length.
    """
    left = 2 * index + 1
    right = 2 * index + 2
    largest = index
    if left < size and array[left] > array[largest]:
        largest = left
    if right < size and array[right] > array[largest]:
        largest = right
    if largest != index:
        array[index], array[largest] = array[largest], array[index]
        max_heapify(array, largest, size)
