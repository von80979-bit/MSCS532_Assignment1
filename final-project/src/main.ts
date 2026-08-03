import { createInterface } from "node:readline/promises";

import { benchmark } from "./bench/parent.ts";
import { verify } from "./verify.ts";

type Mode = "verify" | "benchmark";

const DEFAULT_SEED = 42;

// A Map rather than an object literal, so that "constructor" and "__proto__" re-prompt
// instead of resolving against Object.prototype.
const MODE_BY_ANSWER = new Map<string, Mode>([
  ["1", "verify"],
  ["2", "benchmark"],
]);

const MENU = `Shortest-path visit-order benchmark

  1) verify     correctness only, a few seconds
  2) benchmark  the full measurement, roughly 70 seconds
`;

const PROMPT = "Select 1 or 2: ";

// readline fires close before line when stdin is not a terminal, so the menu would print,
// no choice could arrive, and the process would exit 0 — a failure that looks like success.
function requireInteractiveTerminal(): void {
  if (!process.stdin.isTTY) {
    console.error("This program is interactive. Re-run with -it:");
    console.error('  docker run --rm -it -v "$(pwd)/results:/app/results" shortest-path');
    process.exit(1);
  }
}

function parseSeed(commandLineArguments: string[]): number {
  if (commandLineArguments.length === 0) {
    return DEFAULT_SEED;
  }

  const [flag, value, ...rest] = commandLineArguments;
  if (flag !== "--seed" || value === undefined || rest.length > 0) {
    console.error(`Usage: --seed <integer>   (optional, defaults to ${DEFAULT_SEED}; it is the only flag)`);
    process.exit(1);
  }

  if (!/^-?[0-9]+$/.test(value)) {
    console.error(`--seed expects an integer, received "${value}"`);
    process.exit(1);
  }

  return Number(value);
}

function parseMode(answer: string): Mode | undefined {
  return MODE_BY_ANSWER.get(answer.trim());
}

async function askForMode(): Promise<Mode> {
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write(`\n${MENU}\n`);
    for (;;) {
      const mode = parseMode(await terminal.question(PROMPT));
      if (mode !== undefined) {
        return mode;
      }
    }
  } catch (error) {
    // Ctrl+D rejects the pending question rather than resolving it to an empty line.
    if ((error as NodeJS.ErrnoException).code !== "ABORT_ERR") {
      throw error;
    }
    console.error("\nNo mode selected.");
    process.exit(1);
  } finally {
    terminal.close();
  }
}

async function main(): Promise<void> {
  requireInteractiveTerminal();
  const seed = parseSeed(process.argv.slice(2));
  const mode = await askForMode();
  if (mode === "verify") {
    verify(seed);
    return;
  }
  await benchmark(seed);
}

await main();
