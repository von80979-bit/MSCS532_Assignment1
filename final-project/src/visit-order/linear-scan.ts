import type { VisitOrder } from "./visit-order.ts";

// A vertex the loop has not discovered yet. Distances stay far below this, so it is never the scan's minimum.
const NEVER_ADDED = 0x7fffffff;

// Minimum key by scanning every vertex, the textbook O(V^2) Dijkstra. Keys live one slot per vertex, so an
// improvement overwrites rather than enqueues.
export class LinearScanVisitOrder implements VisitOrder {
  node = 0;
  key = 0;

  private readonly vertexCount: number;
  private readonly keys: Int32Array;
  private readonly visited: Uint8Array;

  constructor(vertexCount: number) {
    this.vertexCount = vertexCount;
    this.keys = new Int32Array(vertexCount).fill(NEVER_ADDED);
    this.visited = new Uint8Array(vertexCount);
  }

  add(node: number, key: number): void {
    if (key < this.keys[node]) {
      this.keys[node] = key;
    }
  }

  next(): boolean {
    let bestNode = -1;
    let bestKey = NEVER_ADDED;
    for (let v = 0; v < this.vertexCount; v++) {
      if (this.visited[v] === 0 && this.keys[v] < bestKey) {
        bestNode = v;
        bestKey = this.keys[v];
      }
    }
    if (bestNode < 0) {
      return false;
    }
    this.visited[bestNode] = 1;
    this.node = bestNode;
    this.key = bestKey;
    return true;
  }

  isEmpty(): boolean {
    for (let v = 0; v < this.vertexCount; v++) {
      if (this.visited[v] === 0 && this.keys[v] !== NEVER_ADDED) {
        return false;
      }
    }
    return true;
  }
}
