# 01 — Polish `reports/final.md` (apply the assembly checklist)

**What to build:** A submission-ready APA final report. One coherent editing pass over the
single assembled file `reports/final.md` that applies every item on the Phase 4
assembly/polish checklist, leaving the document cohesive, comprehensive, and compliant with
`resources/WRITING-REQUIREMENTS.md` (APA 7). No structural rewrite — surgical edits only.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

APA / mechanical:
- [ ] Number style standardized to APA 7 (numerals for ≥10): `three hundred`→`300`,
      `three thousand`→`3,000`, `thirty thousand`→`30,000`, `thirty-two`→`32`,
      `thirty seconds`→`30 seconds`, `eleven`→`11`, `thirty-three`→`33`, `ten submitted`→`10`
      (five/eight/two <10 may stay words). No spelled-out ≥10 counts remain.
- [ ] Hanif reference: replace informal `In *ICOIN* *2020*` with the full proceedings title —
      `In 2020 International Conference on Information Networking (ICOIN) (pp. 713–716). IEEE.`
- [ ] Remove the stray backslash in `(Nowacki et al., 2021\)`.
- [ ] `NodeJs`→`Node.js`; `en-queue`→`enqueue`.

Figures:
- [ ] Add a one-sentence lead-in before each of Figures 2, 3, and 4 (they are currently
      inserted with no introductory sentence, referenced only parenthetically after the image).
      Figure 1 already has an in-paragraph intro.
- [ ] Replace the terse Figure 4 caption (`Stress test.`) with a parallel descriptive caption,
      e.g. *Peak queue size and retained heap with and without the memory optimization.*

Cohesion:
- [ ] Add a forward clause in the Overview/Application Context citing the measured
      distributed-vs-single time result (currently only in the evaluation section), e.g.
      "a gap this report later measures at roughly 10 to 90 times."
- [ ] De-duplicate the component enumeration across the seam: reframe `Component Architecture`
      as design-intent one-liners per component; let `Core Data Structures and Operations`
      carry the realized-code detail. Event/Queue/Manager/Producer/Consumer are not listed twice.
- [ ] Soften `Implementation and Next Steps` into a transition ("the sections that follow
      realize several of these") rather than framing redelivery/NACK/DLQ/benchmarks as future
      work the very next section delivers.

Verification:
- [ ] Every figure has a preceding introductory sentence.
- [ ] No paragraph exceeds 300 words; no quotation marks; DAG section order preserved.
