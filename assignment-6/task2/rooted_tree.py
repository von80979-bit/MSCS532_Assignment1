"""From-scratch rooted tree using the left-child, right-sibling representation, which stores a node with an arbitrary
number of children in space linear in the number of nodes (CLRS Section 10.3)."""


class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left_child = None
        self.right_sibling = None

    def add_child(self, value):
        """Attach a new child after this node's existing children, in O(c) for c current children."""
        child = TreeNode(value)
        if self.left_child is None:
            self.left_child = child
        else:
            sibling = self.left_child
            while sibling.right_sibling is not None:
                sibling = sibling.right_sibling
            sibling.right_sibling = child
        return child

    def children(self):
        """Return this node's children left to right, in O(c) for c current children."""
        result = []
        child = self.left_child
        while child is not None:
            result.append(child)
            child = child.right_sibling
        return result


def preorder(node):
    """Return the values of the subtree rooted at node in preorder (node, then its children left to right, each
    recursively), in O(n) for n nodes in the subtree.
    """
    if node is None:
        return []
    values = [node.value]
    for child in node.children():
        values.extend(preorder(child))
    return values
