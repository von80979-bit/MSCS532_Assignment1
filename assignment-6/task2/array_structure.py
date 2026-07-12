"""From-scratch dynamic array exposing indexed access, insertion, and deletion (CLRS Section 10.1).

Storage is a fixed-capacity Python list grown by doubling on demand, mirroring the textbook's contiguous-memory array.
Insertion and deletion shift the affected elements one slot at a time rather than delegating to a built-in method, so
the O(n) shifting cost the analysis discusses is visible in the implementation itself.
"""


class Array:
    def __init__(self):
        self._items = [None]
        self._size = 0

    def __len__(self):
        return self._size

    def get(self, index):
        """Return the element at index, in O(1)."""
        self._check_index(index)
        return self._items[index]

    def set(self, index, value):
        """Overwrite the element at index, in O(1)."""
        self._check_index(index)
        self._items[index] = value

    def insert(self, index, value):
        """Insert value at index, shifting later elements one slot right, in O(n)."""
        if not 0 <= index <= self._size:
            raise IndexError(f"index {index} is out of range for insertion into length {self._size}")
        if self._size == len(self._items):
            self._grow()
        for position in range(self._size, index, -1):
            self._items[position] = self._items[position - 1]
        self._items[index] = value
        self._size += 1

    def delete(self, index):
        """Remove and return the element at index, shifting later elements one slot left, in O(n)."""
        self._check_index(index)
        removed = self._items[index]
        for position in range(index, self._size - 1):
            self._items[position] = self._items[position + 1]
        self._items[self._size - 1] = None
        self._size -= 1
        return removed

    def to_list(self):
        return self._items[:self._size]

    def _grow(self):
        grown = [None] * max(1, len(self._items) * 2)
        grown[:self._size] = self._items[:self._size]
        self._items = grown

    def _check_index(self, index):
        if not 0 <= index < self._size:
            raise IndexError(f"index {index} is out of range for length {self._size}")
