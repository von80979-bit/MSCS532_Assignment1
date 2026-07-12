"""Task 2 demo: narrates a short sequence of operations on every elementary data structure and checks the
resulting state against an independently computed expected state, printing a pass/fail verdict per check (CLRS
Chapter 10)."""

from array_structure import Array
from linked_list import LinkedList
from matrix import Matrix
from queue_structure import Queue
from rooted_tree import TreeNode, preorder
from stack import Stack


def run_demo():
    checks = [
        _demo_array(),
        _demo_matrix(),
        _demo_stack(),
        _demo_queue(),
        _demo_linked_list(),
        _demo_rooted_tree(),
    ]
    _print_summary(checks)


def _demo_array():
    print("=== Array ===")
    array = Array()
    for value in [10, 20, 30]:
        array.insert(len(array), value)
        print(f"  insert {value} -> {array.to_list()}")
    array.insert(1, 15)
    print(f"  insert 15 at index 1 -> {array.to_list()}")
    removed = array.delete(0)
    print(f"  delete index 0 (removed {removed}) -> {array.to_list()}")
    return _check("array", array.to_list(), [15, 20, 30])


def _demo_matrix():
    print("\n=== Matrix ===")
    matrix = Matrix(rows=2, columns=2, fill=0)
    matrix.set(0, 0, 1)
    matrix.set(0, 1, 2)
    matrix.set(1, 0, 3)
    matrix.set(1, 1, 4)
    print(f"  filled -> {matrix.to_list()}")
    matrix.insert_row(2, [5, 6])
    print(f"  insert_row 2 [5, 6] -> {matrix.to_list()}")
    matrix.insert_column(0, [0, 0, 0])
    print(f"  insert_column 0 [0, 0, 0] -> {matrix.to_list()}")
    matrix.delete_row(0)
    print(f"  delete_row 0 -> {matrix.to_list()}")
    matrix.delete_column(1)
    print(f"  delete_column 1 -> {matrix.to_list()}")
    return _check("matrix", matrix.to_list(), [[0, 4], [0, 6]])


def _demo_stack():
    print("\n=== Stack ===")
    stack = Stack()
    for value in [1, 2, 3]:
        stack.push(value)
        print(f"  push {value}")
    popped = [stack.pop() for _ in range(len(stack))]
    print(f"  popped -> {popped}")
    return _check("stack (LIFO order)", popped, [3, 2, 1])


def _demo_queue():
    print("\n=== Queue ===")
    queue = Queue()
    for value in [1, 2, 3]:
        queue.enqueue(value)
        print(f"  enqueue {value}")
    dequeued = [queue.dequeue() for _ in range(len(queue))]
    print(f"  dequeued -> {dequeued}")
    return _check("queue (FIFO order)", dequeued, [1, 2, 3])


def _demo_linked_list():
    print("\n=== Linked list ===")
    linked_list = LinkedList()
    for value in [3, 2, 1]:
        linked_list.insert_at_head(value)
        print(f"  insert_at_head {value} -> {linked_list.traverse()}")
    linked_list.delete(2)
    print(f"  delete 2 -> {linked_list.traverse()}")
    linked_list.insert_at(1, 2)
    print(f"  insert 2 at position 1 -> {linked_list.traverse()}")
    return _check("linked list", linked_list.traverse(), [1, 2, 3])


def _demo_rooted_tree():
    print("\n=== Rooted tree ===")
    root = TreeNode("root")
    left = root.add_child("left")
    root.add_child("right")
    left.add_child("left.left")
    left.add_child("left.right")
    print("  built: root -> [left -> [left.left, left.right], right]")
    order = preorder(root)
    print(f"  preorder -> {order}")
    return _check("rooted tree (preorder)", order, ["root", "left", "left.left", "left.right", "right"])


def _check(label, observed, expected):
    passed = observed == expected
    verdict = "PASS" if passed else "FAIL"
    print(f"  [{verdict}] {label}: observed={observed} expected={expected}")
    return passed


def _print_summary(checks):
    print(f"\n{sum(checks)}/{len(checks)} checks passed.")


if __name__ == "__main__":
    run_demo()
