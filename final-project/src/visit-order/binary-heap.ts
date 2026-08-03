import type { VisitOrder } from "./visit-order.ts";

// Minimum key by sift-down. Lazy deletion rather than decrease-key: an improvement adds a fresh entry and the shared
// loop's settled check discards the stale one. The heap holds at most one entry per arc, so the cost stays O((V + E) log V).
export class BinaryHeapVisitOrder implements VisitOrder {
  node = 0;
  key = 0;

  private nodes: Int32Array;
  private keys: Int32Array;
  private size = 0;

  constructor(initialCapacity: number) {
    this.nodes = new Int32Array(Math.max(initialCapacity, 1));
    this.keys = new Int32Array(this.nodes.length);
  }

  add(node: number, key: number): void {
    if (this.size === this.nodes.length) {
      this.grow();
    }
    let hole = this.size++;
    while (hole > 0) {
      const parent = (hole - 1) >> 1;
      if (this.keys[parent] <= key) {
        break;
      }
      this.nodes[hole] = this.nodes[parent];
      this.keys[hole] = this.keys[parent];
      hole = parent;
    }
    this.nodes[hole] = node;
    this.keys[hole] = key;
  }

  next(): boolean {
    if (this.size === 0) {
      return false;
    }
    this.node = this.nodes[0];
    this.key = this.keys[0];

    const last = --this.size;
    if (last > 0) {
      const node = this.nodes[last];
      const key = this.keys[last];
      let hole = 0;
      for (;;) {
        let child = hole * 2 + 1;
        if (child >= last) {
          break;
        }
        if (child + 1 < last && this.keys[child + 1] < this.keys[child]) {
          child++;
        }
        if (this.keys[child] >= key) {
          break;
        }
        this.nodes[hole] = this.nodes[child];
        this.keys[hole] = this.keys[child];
        hole = child;
      }
      this.nodes[hole] = node;
      this.keys[hole] = key;
    }
    return true;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  private grow(): void {
    const nodes = new Int32Array(this.nodes.length * 2);
    nodes.set(this.nodes);
    const keys = new Int32Array(this.keys.length * 2);
    keys.set(this.keys);
    this.nodes = nodes;
    this.keys = keys;
  }
}
