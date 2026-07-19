/**
 * Promise-based (Async) delay used to simulate consumer work. The event `payload`
 * carries the sleep duration in milliseconds.
 *
 * @param {number} ms - milliseconds to wait.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
