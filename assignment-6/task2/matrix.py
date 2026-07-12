"""From-scratch matrix exposing indexed access and row/column insertion and deletion (CLRS Section 10.1).

A matrix is represented as an array of rows, each itself an array, mirroring the textbook's treatment of a matrix as a
two-dimensional array built from the same primitive.
"""

from array_structure import Array


class Matrix:
    def __init__(self, rows, columns, fill=0):
        self._rows = Array()
        for _ in range(rows):
            self._rows.insert(len(self._rows), _filled_row(columns, fill))

    @property
    def row_count(self):
        return len(self._rows)

    @property
    def column_count(self):
        return len(self._rows.get(0)) if len(self._rows) else 0

    def get(self, row, column):
        """Return the element at (row, column), in O(1)."""
        return self._rows.get(row).get(column)

    def set(self, row, column, value):
        """Overwrite the element at (row, column), in O(1)."""
        self._rows.get(row).set(column, value)

    def insert_row(self, index, values):
        """Insert a new row at index, shifting later rows down, in O(rows * columns)."""
        if self.row_count and len(values) != self.column_count:
            raise ValueError("row length must match the existing column count")
        row = Array()
        for value in values:
            row.insert(len(row), value)
        self._rows.insert(index, row)

    def delete_row(self, index):
        """Remove and return row index as a plain list, shifting later rows up, in O(rows * columns)."""
        return self._rows.delete(index).to_list()

    def insert_column(self, index, values):
        """Insert a new column at index, shifting later columns right in every row, in O(rows * columns)."""
        if len(values) != self.row_count:
            raise ValueError("column length must match the existing row count")
        for position, value in zip(range(self.row_count), values):
            self._rows.get(position).insert(index, value)

    def delete_column(self, index):
        """Remove and return column index as a plain list, shifting later columns left, in O(rows * columns)."""
        return [self._rows.get(position).delete(index) for position in range(self.row_count)]

    def to_list(self):
        return [self._rows.get(position).to_list() for position in range(self.row_count)]


def _filled_row(columns, fill):
    row = Array()
    for _ in range(columns):
        row.insert(len(row), fill)
    return row
