# Build Process

*Nard Dog here! Andy Bernard, Sales, Cornell Class of '95. When they asked me to document the build methodology, I said absolutely — because this is exactly the kind of structured collaboration framework we studied in my Organizational Behavior seminar at Cornell. Different role, same principles. Let me walk you through it.*

---

## The Architect/Builder Split

This project was built using two Claude instances that can't see each other:

**Claude.ai (Opus)** is the architect. It holds the full project context — architecture decisions, status, narrative, constraints — and produces detailed specs for each build task. It's the person in the room who knows what the building is supposed to look like.

**Claude Code** is the builder. It receives a spec, executes it, and returns a completion report. It doesn't have project history. It doesn't know why decisions were made. It just knows what the spec tells it to build.

They communicate through two documents: the **task spec** (architect → builder) and the **completion report** (builder → architect). The spec is the bridge. If the spec is ambiguous, the builder makes a guess — and guesses compound. If the spec is precise, the builder executes cleanly.

This is basically how a cappella arrangements work. The arranger writes the chart, the section leads execute it, and if the chart says "ad lib" in the bridge, you get six people doing six different things and it sounds terrible. Precision in the handoff is everything.

---

## Why Specs Matter

Unguided coding agents — "build me an MCP server" with no further detail — succeed about 30% of the time. They make reasonable guesses that compound into unreasonable outcomes.

Guided agents with detailed specs — file paths, function signatures, acceptance criteria, explicit "do not" constraints — succeed much more often. The spec collapses ambiguous decisions into reviewed instructions before a single line of code is written.

Every task in this project shipped with a numbered spec: what to build, where the files go, what patterns to follow, what to test, and what not to touch. The architect reviewed each spec before handing it off. The builder executed against it.

---

## The Skills System

The architect uses custom skills — reusable instruction sets that encode patterns across projects:

**`task-writing`** — Structures the spec format. Numbered steps, file paths, acceptance criteria, do-not lists. Ensures the builder gets consistent, parseable instructions.

**`prompt-review`** — Quality gate that runs after spec drafting. Checks for ambiguity, missing constraints, and implicit assumptions that would force the builder to guess.

**`pcp-profile-gen`** — Content generation skill specific to this project. Encodes the 12-file template structure, the Dunder Mifflin narrative arc, redaction marker syntax, the quality bar, and character research workflow. This is how 168 files across 14 characters stayed consistent — the skill is the consistency anchor, not the person.

Skills aren't magic. They're condensed trial-and-error — patterns that worked, written down so they work again.

---

## Profile Generation at Scale

The demo org has 14 characters × 12 files = 168 markdown files. Generating these across multiple sessions without the skill would guarantee drift — inconsistent template structure, contradictory narrative details, uneven quality, broken redaction syntax.

The `pcp-profile-gen` skill locks all of that down. Fixed narrative plot points are baked in. Template structure matches real [contextportfolio.ai](https://contextportfolio.ai) output. Redaction syntax follows the spec exactly. Every character goes through the same workflow: research → generate all 12 files → include redaction markers → cross-reference against existing characters → deliver.

The skill doesn't write the content — it constrains how the content is written. The AI still does the creative work of interpreting each character. But it does it within walls that prevent the kind of drift that kills consistency at scale.

---

## Progressive Context Disclosure as a Pattern

This project uses progressive context disclosure everywhere — not just in how the server serves profiles (org index → single file → full portfolio), but in how specs are written, how docs are structured, and how the demo onboards users.

It's an industry-wide convergence in 2025-2026: don't dump everything into context when a summary will do. Start lightweight, escalate as needed. Every MCP server, every RAG pipeline, every agentic workflow is converging on the same pattern — because context windows are finite and attention is expensive.

The same principle that makes the org index useful at 800 tokens is the principle that makes a good spec useful at 2 pages instead of 20.

*This is actually very similar to how we structured rehearsals in Here Comes Treble — you start with the melody line, then layer in harmonies, then add the choreography. You don't throw all three at someone on day one. That's how you get pitchy. — Andy Bernard, Cornell '95*
