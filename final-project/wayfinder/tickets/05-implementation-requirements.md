# Specify the implementation requirements

Labels: wayfinder:grilling
Type: HITL
Status: open
Blocked by: [Lock the design specification](03-design-spec.md), [Lock the benchmark methodology](04-benchmark-methodology.md)
Assignee: (unclaimed)

## Question

Turn the locked design and methodology into a requirements document an implementation agent can build from end to end without making a single further decision. Output: a requirements markdown file under `final-project/`.

The test for this ticket: hand the document to an agent with no access to this conversation, and it should produce the right thing.

Resolve:

- **Repository layout.** Directory and file structure under `final-project/`. Where source, generated data, results, and the report live.
- **Build and run.** TypeScript configuration and target. Whether the container compiles with `tsc` or runs sources directly. The exact commands the professor types, which should be as close to `docker build` then `docker run` as possible.
- **CLI surface.** What the entry point accepts: which experiment or sweep to run, the seed, the `--regenerate` flag, output paths. Whether a single default invocation runs everything.
- **Docker specifics.** Base image and Node version, and whether the version is pinned, since V8's optimizer changes between releases and unpinned Node makes results non-reproducible. Required runtime flags, `--expose-gc` in particular. How results escape the container, whether by mounted volume or console output.
- **Generator and cache contract.** File naming under `data/`, the JSON flat-parallel-array schema, the `manifest.json` fields, and how the checksum is computed and verified.
- **Correctness gates.** What must be asserted before any timing is reported, and what the program does when distance vectors disagree. It should fail loudly rather than report numbers.
- **Code standards for the implementation agent.** Clean-code practices, comments only where necessary and concise when present, no lengthy comment blocks, no early text wrapping. This code *is* the MS Word deliverable's documentation, so it is read by a human grader, not just executed.
- **Definition of done.** What the agent must produce for the ticket to close, and what evidence proves it works.

Once this closes, the implementation work graduates from the map's **Not yet specified** section into its own tickets, likely split across the data structures and algorithms, the generator and cache, the benchmark harness, and the Docker packaging.
