"""From-scratch singly linked list exposing insertion, deletion, and traversal (CLRS Section 10.2)."""


class _Node:
    __slots__ = ("value", "next")

    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node


class LinkedList:
    def __init__(self):
        self._head = None
        self._size = 0

    def __len__(self):
        return self._size

    def is_empty(self):
        return self._head is None

    def insert_at_head(self, value):
        """Insert value as the new first element, in O(1)."""
        self._head = _Node(value, self._head)
        self._size += 1

    def insert_at(self, position, value):
        """Insert value so it occupies the given position, in O(n)."""
        if position < 0 or position > self._size:
            raise IndexError(f"position {position} is out of range for length {self._size}")
        if position == 0:
            self.insert_at_head(value)
            return
        predecessor = self._head
        for _ in range(position - 1):
            predecessor = predecessor.next
        predecessor.next = _Node(value, predecessor.next)
        self._size += 1

    def delete(self, value):
        """Remove the first node holding value, in O(n) since the list must be searched from the head."""
        previous = None
        current = self._head
        while current is not None and current.value != value:
            previous = current
            current = current.next
        if current is None:
            raise ValueError(f"{value!r} not found in the list")
        if previous is None:
            self._head = current.next
        else:
            previous.next = current.next
        self._size -= 1

    def traverse(self):
        """Return the list's values from head to tail, in O(n)."""
        values = []
        current = self._head
        while current is not None:
            values.append(current.value)
            current = current.next
        return values
