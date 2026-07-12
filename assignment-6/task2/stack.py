"""Array-backed stack exposing push and pop, both O(1) since they only ever touch the last slot (CLRS Section 10.1)."""

from array_structure import Array


class Stack:
    def __init__(self):
        self._items = Array()

    def __len__(self):
        return len(self._items)

    def is_empty(self):
        return len(self._items) == 0

    def push(self, value):
        """Add value to the top of the stack, in amortized O(1)."""
        self._items.insert(len(self._items), value)

    def pop(self):
        """Remove and return the value at the top of the stack, in O(1)."""
        if self.is_empty():
            raise IndexError("pop from an empty stack")
        return self._items.delete(len(self._items) - 1)

    def peek(self):
        """Return the value at the top of the stack without removing it, in O(1)."""
        if self.is_empty():
            raise IndexError("peek from an empty stack")
        return self._items.get(len(self._items) - 1)
