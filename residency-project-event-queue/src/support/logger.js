
export const consoleColors = {
	reset: '\x1b[0m',
	fgRed: '\x1b[31m',
	fgGreen: '\x1b[32m',
	fgYellow: '\x1b[33m',
	fgMagenta: '\x1b[35m',
	fgCyan: '\x1b[36m',
};



/**
 * Structured terminal logger. Consumption lines are emitted in a single fixed
 * shape (`receive_time, key, eventId, seq`) so the interleaving of queues and the
 * strict per-key order are both visible when reading the terminal.
 */
export const logger = {
  /** Success line. @param {string} msg */
  success(msg) {
    console.log(consoleColors.fgGreen,msg);
  },

  /** Informational banner line. @param {string} msg */
  info(msg) {
    console.log(consoleColors.fgCyan, msg);
  },

  /** Error line. @param {string} msg */
  error(msg) {
    console.error(consoleColors.fgRed, msg);
  },

  /** Warning line. @param {string} msg */
  warn(msg) {
    console.log(consoleColors.fgYellow, msg)
  }
};
