# Architecture

*Ryan Howard, MBA. I wasn't consulted on the original architecture, which is... fine. I've reviewed it. It's not how I would have done it — I would have used microservices — but it works. Here's what you need to know.*

---

## What This Server Does

This is a multi-user MCP server that serves personal context portfolios to AI assistants. It does three things: reads profiles with role-based redaction, writes profile updates with server-side normalization, and generates an org index so your AI knows who's in the organization.

Every AI platform that speaks MCP — Claude, ChatGPT, Gemini, Cursor — connects to the same server. Everyone reads everyone's profiles, but the content is filtered based on who's asking.

---

## The Read Path

1. A tool call comes in — "get me Dwight's current projects."
2. The server identifies the requester from the API key (e.g., `dm-jim-halpert` → `jim-halpert`).
3. The server loads the raw markdown file from `portfolios/dwight-schrute/current-projects.md`.
4. The redaction parser evaluates inline `<!-- @@ include/exclude -->` markers against the requester's tags (role tags from `_roles.md` + their implicit person tag).
5. Excluded content is stripped. All markers are stripped. Clean markdown comes back.

The requester never sees the markers. They never know content was removed. They just get a document that reads naturally — with some sections missing.

See [Redaction](redaction.md) for the full marker syntax and how the parser works.

---

## The Write Path

Profiles that can't update themselves through conversation are dead within a week. The write-back pipeline is what keeps them alive.

1. The client AI submits a raw observation string — something like *"User mentioned they just completed the Q3 client retention analysis and are shifting focus to Q4 planning."*
2. The server calls an LLM (Claude Sonnet primary, GPT-4o fallback) with the observation, the user's full redacted portfolio, and a normalization prompt that enforces third-person voice, density rules, and template conformance.
3. The LLM returns structured updates: which files to modify, which sections, what to add or replace.
4. The server applies a redaction-aware merge — it extracts hidden blocks before the merge, applies the changes to visible content, and reinserts the hidden blocks at their original positions. Content the user can't see cannot be overwritten.
5. Change history is logged to `_change-history.json` (append-only — what changed, from what, to what, why, when).
6. The response tells the client what was stored.

**Server-side normalization is intentional.** The observations don't go in verbatim. The server owns voice and density for org-wide consistency. If every client normalized its own way, you'd get five different writing styles across five platforms. That's a Dwight move — hardworking, loyal, completely unsustainable. The server is the documentarian.

---

## The Client-Side Harvest Workflow

The server includes a session diff prompt (registered as an MCP prompt) that tells the client AI how to review a conversation for profile-relevant observations. The workflow:

1. At the end of a session, the client AI reads the user's current portfolio from the server.
2. It reviews the conversation for things that should be captured — new projects, completed work, changed priorities, new relationships.
3. It produces observations and submits them via `update_my_profile` or `submit_profile_updates`.
4. The prompt also includes AI-suggested scoping guidance — the AI notices if an observation seems sensitive and suggests redaction tags.

This is how profiles stay alive. Without it, they decay within days.

---

## Progressive Context Disclosure

The server serves the right amount of context depending on what you ask for:

- **Org index** (~800 tokens for 15 people) — names, roles, person-ids. Enough for the AI to know who's who.
- **Single file** (~200-600 tokens) — one specific aspect of one person. Most common read pattern.
- **Full portfolio** (~3,000-5,000 tokens) — everything about one person. Used when you need deep context.

The client AI escalates from lightweight to heavy as the conversation demands. This is an industry-wide convergence pattern in 2025-2026 — don't dump everything into context when a summary will do.

---

## Tool Inventory

### Read Tools
| Tool | What It Does |
|------|-------------|
| `get_my_portfolio` | Returns all 10 portfolio files for the authenticated user |
| `get_my_portfolio_file` | Returns a single file from the authenticated user's portfolio |
| `get_my_roles` | Returns the authenticated user's role tags |
| `get_portfolio_file` | Returns a single file from any person's portfolio (redacted) |
| `get_full_portfolio` | Returns all 10 files for any person (redacted) |
| `list_people` | Lists all person-ids in the system |
| `list_files` | Lists available files for a given person (excludes `_`-prefixed files) |
| `get_org_index` | Returns the auto-generated org index |
| `view_portfolio_as` | Shows a profile as another person would see it (intersection security — you can only see less, never more) |
| `get_profile_freshness` | Returns last-modified dates per file for a person |

### Write Tools
| Tool | What It Does |
|------|-------------|
| `update_my_profile` | Submit observations about yourself — server normalizes and merges |
| `submit_profile_updates` | Same pipeline, different entry point. Accepts raw observation strings. |

Both write tools enforce authorship verification — you can only update your own profile.

### Prompts
| Prompt | What It Does |
|--------|-------------|
| Session diff prompt | Instructs the client AI on how to harvest profile-relevant observations from a conversation and submit them with suggested scoping |

---

## The 10-File Template

Every portfolio follows the same structure, adapted from the [personal-context-portfolio](https://github.com/nlwhittemore/personal-context-portfolio) templates:

| File | Purpose |
|------|---------|
| `identity.md` | Minimum viable context — one file to understand this person |
| `role-and-responsibilities.md` | What their weeks actually look like |
| `current-projects.md` | Active workstreams, status, priorities |
| `team-and-relationships.md` | Key people and dynamics |
| `tools-and-systems.md` | What they use and how |
| `communication-style.md` | How they talk and write — precise enough for AI to match voice |
| `goals-and-priorities.md` | What they're optimizing for |
| `preferences-and-constraints.md` | Hard rules and non-negotiables |
| `domain-knowledge.md` | What they know deeply |
| `decision-log.md` | How they decide, with examples |

Two additional files (`_roles.md` for redaction tags, `_redaction-legend.md` for marker documentation) are internal — the server reads them but never serves them through tools.

---

## Org Index

Auto-generated from all `identity.md` files on every request. Not cached. Includes name, role, and person-id for everyone in the system. ~800 tokens for 15 people. This is the entry point — the AI reads the org index first, then pulls individual files as needed.

*— Ryan Howard, MBA. The "Temp" thing is inaccurate and I'd appreciate it if people stopped.*
