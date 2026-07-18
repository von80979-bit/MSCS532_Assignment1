/**
 * A singly-linked-list FIFO queue. Head/tail pointers give O(1) enqueue and dequeue
 * in contrast with `Array.shift` which is O(n).
 */
export class Queue {
  constructor() {
    /** @private */ this.head = null;
    /** @private */ this.tail = null;
    this.size = 0;
  }

  /**
   * Append an event to the tail (O(1)).
   * @param {import('./event.js').Event} event
   */
  enqueue(event) {
    const node = { event, next: null };
    if (this.tail) {
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = node;
      this.tail = node;
    }
    this.size += 1;
  }

  /**
   * Remove and return the head event (O(1)), or null if empty.
   * @returns {import('./event.js').Event|null}
   */
  dequeue() {
    if (!this.head) {
      return null
    }
    const { event } = this.head;
    this.head = this.head.next;
    if (!this.head) {
       this.tail = null;
    }
    this.size -= 1;
    return event;
  }

  /**
   * Return the head event without removing it, or null if empty.
   * @returns {import('./event.js').Event|null}
   */
  peek() {
    return this.head ? this.head.event : null;
  }

  /** @returns {boolean} */
  isEmpty() {
    return this.size === 0;
  }

  /** Drop every event and reset the queue. */
  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
}
