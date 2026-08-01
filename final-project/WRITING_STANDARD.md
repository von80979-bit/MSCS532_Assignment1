# Writing standards

The ruleset behind every suggestion. Apply the defaults unless a Phase 1 parameter overrides one. These are what a suggestion argues *toward*; the card's rationale should trace back to a rule here.

## Defaults

- **Tone.** Neutral, natural, objective, clear. The writing should read as a person wrote it.
- **Vocabulary.** Standard words tuned to the piece's type. No flowery or dramatic language. Elevate repetitive word choice, but keep phrasing simple and direct. Rephrase idioms rather than lean on them.
- **Punctuation.** Do not join two sentences with an em dash or hyphen. Rephrase instead: a comma, a `which`/`that` clause, or two sentences. If a concept usually needs a hyphen or a quotation mark, rephrase or explain it.
- **Rhythm.** Combine short, choppy sentences into a mix of simple and complex ones. Vary sentence length so the paragraph reads with a pulse.
- **Cohesion.** Aim for seamless transitions across sentences and across paragraphs. Sentences build a cohesive paragraph; paragraphs build a cohesive whole. This is what the directed acyclic graph in Phase 1 enforces.
- **Fidelity.** Do not add outside facts, arguments, or information. Preserve the user's original meaning exactly.

## Parameters and their defaults

| Parameter | Default | Notes |
| --- | --- | --- |
| type | inferred from the text | drives vocabulary and citation behavior |
| length | none | if set, flag paragraphs that overshoot |
| style | none | e.g. APA 7; apply strictly when set |
| vocabulary | standard | tune up or down from the type |
| stake | medium | high for essay, spec, requirements, thesis |

## Academic and research pieces

When the type is academic or research:

- Follow the named style (e.g. APA 7) strictly.
- Keep paragraphs to roughly 240 to 300 words.
- Synthesize citations naturally. Do not close every sentence with a citation; group them where they belong. Vary the form: narrative citation, parenthetical citation, and direct quotation.

## AI-tell blacklist

Hunt these as **red** flags. They are the marks that make writing read as machine-made.

- Em dash or hyphen splicing two independent clauses.
- The "it's not just X, it's Y" construction and its cousins.
- Empty hedging: "it's worth noting", "it's important to", "arguably", "in many ways".
- Inflated words: delve, tapestry, leverage, realm, landscape, testament, underscore, robust, seamless (as filler).
- Listy scaffolding where prose belongs: reflexive bullet lists, "firstly / secondly / lastly", parallel triads on repeat.
- Hollow summaries: a closing sentence that restates the paragraph without adding anything.
- Over-flagging. A human reviewer marks what matters and leaves the rest. Hold to the flag budget.
