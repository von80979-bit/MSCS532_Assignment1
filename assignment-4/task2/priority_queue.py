"""Max-heap priority queue of tasks, keyed on priority with an arrival-time tie-break.

The heap is a 0-indexed Python list of Task objects. A companion position map records the current heap index of every
task id, so increase_key and decrease_key locate a task in constant time and then sift it in O(log n). The map is kept
correct on every swap, which is the only place an index changes.
"""

from task import Task


class PriorityQueue:
    def __init__(self):
        self._heap = []
        self._position = {}

    def is_empty(self):
        return not self._heap

    def __len__(self):
        return len(self._heap)

    def __contains__(self, task_id):
        return task_id in self._position

    def priority_of(self, task_id):
        """Return the current priority of a task still in the queue."""
        return self._heap[self._position[task_id]].priority

    def insert(self, task):
        """Add a task and restore the heap, in O(log n)."""
        self._heap.append(task)
        index = len(self._heap) - 1
        self._position[task.task_id] = index
        self._bubble_up(index)

    def extract_max(self):
        """Remove and return the highest-ranked task, in O(log n)."""
        if self.is_empty():
            raise IndexError("extract_max from an empty priority queue")
        top = self._heap[0]
        last = self._heap.pop()
        del self._position[top.task_id]
        if self._heap:
            self._heap[0] = last
            self._position[last.task_id] = 0
            self._max_heapify(0)
        return top

    def increase_key(self, task_id, new_priority):
        """Raise a task priority and float it up to its new place, in O(log n)."""
        task = self._heap[self._position[task_id]]
        if new_priority < task.priority:
            raise ValueError("new priority is smaller than the current priority")
        task.priority = new_priority
        self._bubble_up(self._position[task_id])

    def decrease_key(self, task_id, new_priority):
        """Lower a task priority and sink it down to its new place, in O(log n)."""
        task = self._heap[self._position[task_id]]
        if new_priority > task.priority:
            raise ValueError("new priority is larger than the current priority")
        task.priority = new_priority
        self._max_heapify(self._position[task_id])

    def _bubble_up(self, index):
        while index > 0:
            parent = (index - 1) // 2
            if not self._heap[index].outranks(self._heap[parent]):
                break
            self._swap(index, parent)
            index = parent

    def _max_heapify(self, index):
        size = len(self._heap)
        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            highest = index
            if left < size and self._heap[left].outranks(self._heap[highest]):
                highest = left
            if right < size and self._heap[right].outranks(self._heap[highest]):
                highest = right
            if highest == index:
                break
            self._swap(index, highest)
            index = highest

    def _swap(self, first, second):
        self._heap[first], self._heap[second] = (
            self._heap[second],
            self._heap[first],
        )
        # The two tasks changed slots, so their recorded indices change with them.
        self._position[self._heap[first].task_id] = first
        self._position[self._heap[second].task_id] = second
