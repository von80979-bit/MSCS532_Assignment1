# Task 2: Analysis of Elementary Data Structures

## 1. Time Complexity of the Operations

The table below summarizes the cost of every operation implemented for the six structures, where *n* is the number of elements the structure holds and *c* is the number of children of a given tree node. The sections that follow explain each row. All bounds trace to the textbook treatment of these structures (Cormen et al., 2022).

| Structure | Operation | Time complexity |
|:---|:---|:---:|
| Array | access, set | *O(1)* |
| Array | insert, delete at position | *O(n)* |
| Matrix | access, set | *O(1)* |
| Matrix | insert row or column, delete row or column | *O(rows × columns)* |
| Stack | push | amortized *O(1)* |
| Stack | pop, peek | *O(1)* |
| Queue | enqueue | amortized *O(1)* |
| Queue | dequeue | *O(1)* |
| Linked list | insert at head | *O(1)* |
| Linked list | delete by value, traverse | *O(n)* |
| Rooted tree | add child, list children | *O(c)* |
| Rooted tree | preorder traversal | *O(n)* |

### 1.1 Array

The array stores its elements in one contiguous block and locates any position by simple index arithmetic, so reading or overwriting an element is a constant-time operation regardless of where the element sits (Cormen et al., 2022). Insertion and deletion at an arbitrary position cost *O(n)*, because the elements after the affected slot must each move one place to keep the block contiguous, and in the worst case that shift touches almost every element. The implementation grows its size by doubling the capacity when it becomes full, so an append that happens to trigger a resize copies all current elements once, yet the cost of these rare copies spreads across the many cheap appends and leaves the append amortized at *O(1)*.

### 1.2 Matrix

The matrix reuses the array as its building block. It is stored as an array of rows, and each row is itself an array, which matches the textbook view of a matrix as a two-dimensional array (Cormen et al., 2022). Reading or writing a single cell is therefore *O(1)*, because it reduces to two constant-time array accesses, one to reach the row and one to reach the column. Inserting or deleting a whole row or a whole column costs *O(rows × columns)*. Removing a row shifts the rows below it up by one, and each row that moves carries all of its columns, while inserting or removing a column must reach into every row and shift that row's elements, so both operations touch on the order of the full element count.

### 1.3 Stack

The stack is implemented with the array and only ever adds or removes at the end, which is the cheapest place to change an array, so it inherits the array's end operations directly (Cormen et al., 2022). A pop and a peek are *O(1)* because they read or remove the last slot without moving anything else. A push is amortized *O(1)*, since it appends at the end where no shifting is needed, and pays the occasional linear cost only when the underlying array doubles. This behavior gives the last in, first out order that defines a stack, where the element removed is always the one most recently added (Kim, 2024; QuickCodingExplanation, 2024). A stack can also be implemented with a linked list, the alternative that Section 2 compares in detail.

### 1.4 Queue

The queue uses a circular array with a head index and a size counter, a design that supports insertion at the back and removal from the front without shifting any stored elements (Cormen et al., 2022). A dequeue is *O(1)*, because it reads the element at the head and then advances the head index by one position, wrapping around the end of the underlying array when needed. An enqueue is amortized *O(1)*, since it writes the new element just past the current tail and only pays a linear cost on the rare occasion when the underlying array doubles. Wrapping the indices around a fixed block is what avoids the naive queue design in which every dequeue shifts the remaining elements forward at a cost of *O(n)*. The result preserves the first in, first out order in which the earliest element added is the first one removed (Kim, 2024; QuickCodingExplanation, 2024). Like the stack, a queue can also be built on a linked list, the alternative that Section 2 examines in detail.

### 1.5 Singly linked list

The singly linked list stores each value in its own node that points to the next node, and it keeps a reference to the head (Cormen et al., 2022). Insertion and deletion at the beginning are both *O(1)*, because they only relink the head reference with no dependence on the length of the list. Inserting a new node as the first element sets its next pointer to the old head and updates the head reference, and removing the first element unlinks it in the same constant time. Insertion or deletion at an arbitrary position is *O(n)*, however, because a singly linked list provides no index arithmetic and must be walked from the head one node at a time to reach that position. The same cost applies to deleting by value and to traversing the list, which are both *O(n)*: a deletion walks from the head comparing values until it finds the target, and a traversal by definition visits every node once, so both scale with the number of elements. Unlike the array, the list never shifts elements and never resizes a block, since each node is allocated on its own and linked into place, which is the property the arrays versus linked lists discussion in Section 2 builds on (Kim, 2024).

### 1.6 Rooted tree

The rooted tree uses the left-child, right-sibling representation, in which each node holds one pointer to its first child and one pointer to its next sibling, so a node with any number of children still uses a fixed amount of space and the whole tree fits in space linear in the number of nodes (Cormen et al., 2022). Adding a child and listing the children of a node both cost *O(c)* for a node that already has *c* children, because reaching the end of the sibling chain to attach a new child, or walking that chain to collect the existing children, takes one step per sibling. A preorder traversal of the whole tree is *O(n)*, since it visits every one of the *n* nodes exactly once, following child pointers and sibling pointers until the entire structure has been reported.

## 2. Arrays Versus Linked Lists for Stacks and Queues

A stack or a queue is an abstract order discipline rather than a concrete layout, so either an array or a linked list can serve as its underlying data structure. The choice shapes the cost profile even though the core operations stay constant time for both (Kim, 2024; QuickCodingExplanation, 2024). This task implements each structure with an array. The subsections below compare it against the linked-list alternative along the dimensions the sources emphasize, which are access pattern, memory use, growth behavior, and the demands each form places on the implementer.

### 2.1 Access, memory, and growth

A stack or queue built on an array keeps its elements in one contiguous block, which gives it two clear advantages. The elements sit next to one another in memory, so the processor cache serves them efficiently as the structure is scanned, and any position can be reached in constant time by index, although a pure stack or queue only ever touches the ends (QuickCodingExplanation, 2024). The cost of this layout appears when the structure grows. The block has a fixed capacity, so once it fills, the structure must allocate a larger block and copy the existing elements across, which is an *O(n)* event. Doubling the capacity keeps the push and the enqueue amortized at *O(1)*, yet an individual operation that triggers a copy still pauses for a linear step (Cormen et al., 2022). An array whose capacity is set far above the actual load also wastes the unused slots (Kim, 2024).

A stack or queue that uses a linked list reverses these trade-offs. Each element lives in its own node that is allocated when it is needed and linked into the structure through pointers, so the structure grows and shrinks one node at a time and never resizes a block or shifts its neighbors, which suits a workload whose size is unpredictable or varies widely (Kim, 2024; QuickCodingExplanation, 2024). With a reference to the relevant end, a singly linked list supports the push and the pop of a stack, and with a reference to both the head and the tail it supports the enqueue and the dequeue of a queue, all in constant time and with no amortized copying. The cost of this design appears in space and locality. Every node carries an extra pointer field beyond its value, which adds memory overhead that the array does not have, and because the nodes may be scattered across memory rather than laid out in one block, the cache serves them less efficiently than the contiguous array (QuickCodingExplanation, 2024). A linked list also cannot reach an arbitrary position in constant time, since it must be walked from an end, though this weakness does not affect a stack or a queue, which only ever operate at their ends. Neither data structure is therefore superior in every case, and the better choice depends on the workload. An array is preferable when the element count stays within a predictable bound, so that steady, cache-friendly performance outweighs the occasional resize pause. A linked list is preferable when the size is hard to predict or varies widely, so that avoiding both resizing and wasted capacity justifies the extra pointer per element and the weaker cache behavior (Kim, 2024; QuickCodingExplanation, 2024).

### 2.2 Ease of implementation

Beyond runtime cost, the two data structures differ in what their construction requires, and the sources describe these requirements without ranking either one as simpler (QuickCodingExplanation, 2024). A stack or queue that uses an array begins from a fixed block of storage, so the implementation must detect when that block is full and grow it, typically by the doubling technique that allocates a larger block and copies the existing elements across. An array implementation of a queue carries a further consideration, since adding at one end and removing from the other would drift across the block and eventually run off it, so the implementation commonly uses a circular buffer whose indices wrap around the end of the block, which reuses freed space at the front without shifting any elements. A stack or queue built on a linked list instead allocates one node for each element as it arrives and links it into place, so there is no capacity to track and no block to resize. Its own consideration is pointer maintenance, since such a queue must keep a reference to both the head and the tail of the list to hold enqueue and dequeue at *O(1)*, because reaching a missing end would otherwise require walking the whole chain. Each approach therefore asks the implementer to manage a different concern, resizing and index wrapping on the array side and per-node allocation and end references on the linked-list side. The reader can weigh these considerations against the memory and performance factors above when choosing between them (Kim, 2024; QuickCodingExplanation, 2024).

## 3. Practical Applications

The structures analyzed above are not only abstract cost models but also tools that recur throughout everyday computing, and the two Medium articles supply concrete settings in which each one is the natural choice (Kim, 2024; QuickCodingExplanation, 2024). The applications below follow the order used earlier, giving the stack and the queue the fuller treatment that their roles in program control flow require, and the array and the linked list a briefer one.

### 3.1 Stack

The stack fits any situation in which the item added most recently is the one that must be handled first, the last in, first out order that defines it (Kim, 2024; QuickCodingExplanation, 2024). Its most visible use is the management of function calls. A program pushes the context of each call onto a call stack as the call is made, and pops that context off when the call returns, so that execution resumes exactly where it left off. This is the mechanism that a language runtime relies on, as the C++ runtime does (Kim, 2024; QuickCodingExplanation, 2024). The same order underlies the undo feature of an editor, which pushes each action as it happens and, when the user asks to undo, pops the latest action and reverses it, so steps are undone in the reverse of the order they were made (QuickCodingExplanation, 2024). Compilers and interpreters use a stack to parse nested syntax, confirming that every opening parenthesis has a matching closing one by pushing each opener and popping it when its partner appears (QuickCodingExplanation, 2024). Backtracking searches, such as finding a path through a maze, likewise use a stack to remember the choices made so far, so that a dead end can be unwound one step at a time until an untried branch is found (QuickCodingExplanation, 2024). A familiar physical picture is a pile of plates in a canteen, where a diner takes the top plate and a clean plate is added to the top, so the plate removed is always the one placed most recently (Kim, 2024).

### 3.2 Queue

The queue captures the opposite discipline, in which items are handled in the order they arrive, the first in, first out order that mirrors a line of people served on a first come, first served basis (Kim, 2024; QuickCodingExplanation, 2024). Operating systems rely on this order to schedule work, placing processes that are ready to run in a queue and dispatching them in arrival order, a pattern that recurs across most operating systems (Kim, 2024; QuickCodingExplanation, 2024). A web server applies the same idea to incoming traffic, holding requests in a queue and serving them in the order received so that no early request is starved by later ones (QuickCodingExplanation, 2024). Data streaming uses a queue as a buffer, collecting chunks of data as they arrive and releasing them for processing in the same sequence, which smooths the mismatch between the rate at which data comes in and the rate at which it can be consumed (QuickCodingExplanation, 2024). The queue also drives breadth-first search over a graph, where the algorithm visits a node, enqueues each of its neighbors, and then dequeues them in turn, so the graph is explored one level at a time outward from the start (QuickCodingExplanation, 2024). In each of these settings the property that matters is fairness of order, that the element waiting longest is the next to be served, which is exactly what the first in, first out rule provides (Kim, 2024).

### 3.3 Array

The array serves as a fundamental building block for many higher-level structures, valued for the constant-time indexed access described earlier. It is the natural home for a fixed-size collection of items and for a lookup table whose entries are reached directly by position, and its predictable layout makes it the foundation on which heaps, hash tables, and dynamic arrays are built (QuickCodingExplanation, 2024). Many sorting and searching algorithms also assume an array, since they depend on reaching any element in constant time as they compare and rearrange values (QuickCodingExplanation, 2024). A shelf of books ordered on a bookcase offers a simple image of the array, where each book occupies a known position that can be reached without disturbing its neighbors (Kim, 2024).

### 3.4 Linked list

The linked list is likewise a building block for other structures, including stacks, queues, and some hash tables, in cases where growing one node at a time is preferable to resizing a block (QuickCodingExplanation, 2024). It supports polynomial arithmetic, where each term is held in its own node so that terms can be inserted and combined without a fixed layout. It also appears in garbage collection, where a mark-and-sweep collector tracks free memory blocks by linking them together (QuickCodingExplanation, 2024). A train whose cars are coupled in order gives an everyday picture of the list, where each car connects to the next and the sequence can be extended or shortened by coupling or uncoupling at a joint (Kim, 2024).

## References

Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to Algorithms* (4th ed.). Random House Publishing Services.

Kim, R. (2024). *Data structure: Array, queue, stack and linked list (with real life examples)*. Medium. https://medium.com/@rubyjeenkim

QuickCodingExplanation. (2024). *Data structures overview: Array, stack, queue, linked-list, hash table, heap, and binary tree*. Medium. https://quickcodingexplanation.medium.com
