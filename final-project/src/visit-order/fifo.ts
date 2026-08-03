import type { VisitOrder } from "./visit-order.ts";

// Oldest discovered first. The head advances instead of the contents moving, because Array.shift is O(n) and would
// silently turn the O(V + E) variant into a quadratic one.
export class FifoVisitOrder implements VisitOrder {
  node = 0;
  key = 0;

  private readonly nodes: Int32Array;
  private readonly keys: Int32Array;
  private readonly capacity: number;
  private head = 0;
  private tail = 0;
  private size = 0;

  // The shared loop adds the source once and then at most one entry per arc, because a vertex relaxes its arcs
  // only in the single iteration that settles it. arcCount + 1 therefore never overflows.
  constructor(capacity: number) {
    this.capacity = capacity;
    this.nodes = new Int32Array(capacity);
    this.keys = new Int32Array(capacity);
  }

  add(node: number, key: number): void {
    this.nodes[this.tail] = node;
    this.keys[this.tail] = key;
    this.tail = this.tail + 1 === this.capacity ? 0 : this.tail + 1;
    this.size++;
  }

  next(): boolean {
    if (this.size === 0) {
      return false;
    }
    this.node = this.nodes[this.head];
    this.key = this.keys[this.head];
    this.head = this.head + 1 === this.capacity ? 0 : this.head + 1;
    this.size--;
    return true;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }
}
