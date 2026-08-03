// Decides which discovered vertex is settled next. That decision is the experiment's only variable; storage is incidental.
export interface VisitOrder {
  add(node: number, key: number): void;
  next(): boolean;         // false when exhausted
  readonly node: number;   // valid after a true next()
  readonly key: number;    // valid after a true next()
  isEmpty(): boolean;
}
