"""Array-backed circular queue exposing enqueue and dequeue (CLRS Section 10.1).

The backing list wraps around via a head index and a size counter instead of shifting elements on dequeue, so both
operations run in amortized O(1), matching the textbook's circular-array queue layout.
"""


class Queue:
    def __init__(self):
        self._items = [None]
        self._head = 0
        self._size = 0

    def __len__(self):
        return self._size

    def is_empty(self):
        return self._size == 0

    def enqueue(self, value):
        """Add value to the back of the queue, in amortized O(1)."""
        if self._size == len(self._items):
            self._grow()
        tail = (self._head + self._size) % len(self._items)
        self._items[tail] = value
        self._size += 1

    def dequeue(self):
        """Remove and return the value at the front of the queue, in O(1)."""
        if self.is_empty():
            raise IndexError("dequeue from an empty queue")
        value = self._items[self._head]
        self._items[self._head] = None
        self._head = (self._head + 1) % len(self._items)
        self._size -= 1
        return value

    def _grow(self):
        grown = [None] * max(1, len(self._items) * 2)
        for position in range(self._size):
            grown[position] = self._items[(self._head + position) % len(self._items)]
        self._items = grown
        self._head = 0
