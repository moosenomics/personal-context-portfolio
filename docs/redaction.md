# Redaction System

*Angela Martin, Head of Accounting. I am the only person in this office who used the redaction system correctly. Everyone else either over-shared, under-classified, or — in Dwight's case — exploited it for unauthorized purposes. I have filed the appropriate complaints. I'm explaining this system because someone has to, and clearly no one else is qualified.*

---

## How It Works

Profile files contain inline markers — HTML comments — that control which content is visible to which users. The MCP server parses these markers at serve time, evaluates them against the requesting user's tags, strips the markers and any excluded content, and returns clean markdown. No user ever sees the marker syntax.

---

## Tags

Every user has a set of tags that determine what they can see.

**Role tags** are organizational roles assigned in a user's `_roles.md` file: `leadership`, `sales`, `accounting`, `warehouse`, `hr`, `reception`, `customer-service`, `quality-assurance`, `party-planning-committee`. Organizations can add their own — the server doesn't enforce a fixed list.

**Person tags** are implicit. Every user automatically has their `person-id` as a tag (e.g., `angela-martin`). Person tags don't appear in `_roles.md` — they're derived from the authenticated identity. They are used in markers.

---

## Marker Syntax

### Include Block

```markdown
<!-- @@ include: accounting -->

Content only visible to users with at least one of the listed tags.

<!-- @@ end include -->
```

The user must have **at least one** listed tag to see the content. Multiple tags are comma-separated and evaluated as logical OR.

### Exclude Block

```markdown
<!-- @@ exclude: michael-scott, dwight-schrute -->

Content visible to everyone EXCEPT users with any of the listed tags.

<!-- @@ end exclude -->
```

The user must have **none** of the listed tags. If they match any listed tag, the content is hidden.

### Nesting

Blocks nest. An exclude block inside an include block means "users with this role, minus these specific people":

```markdown
<!-- @@ include: accounting -->

Visible to anyone tagged accounting.

<!-- @@ exclude: kevin-malone -->

Visible to accounting, except Kevin.

<!-- @@ end exclude -->

Back to all of accounting.

<!-- @@ end include -->
```

*Kevin should not have access to the detailed budget reconciliation. I shouldn't have to explain why. — Angela*

### Top-Level Exclude

An exclude block at the top level (not inside an include) means "everyone except these tags":

```markdown
<!-- @@ exclude: michael-scott, dwight-schrute -->

Everyone sees this except Michael and Dwight.

<!-- @@ end exclude -->
```

This is the most common pattern in the demo profiles.

### Created-By Metadata

Markers support optional metadata after a pipe character:

```markdown
<!-- @@ exclude: dwight-schrute | created-by: jim-halpert -->
```

The parser ignores everything after the pipe. It's documentation for humans browsing the raw files — who planted this marker and why.

### Closing Tags

Always explicit: `<!-- @@ end include -->` or `<!-- @@ end exclude -->`. Never use a bare `<!-- @@ end -->`. Ambiguity is unacceptable.

---

## Server-Side Processing

When a user requests a profile file:

1. The server reads the raw markdown from storage.
2. It looks up the requester's tags: role tags from their `_roles.md` + their person-id as an implicit tag.
3. It parses the file for `<!-- @@ -->` markers, building a scope stack.
4. For each content section, inclusion requires being in scope at **every** level of the stack. Nested includes are logical AND. Nested excludes both apply.
5. All markers and excluded content are stripped. Clean markdown is returned.

Malformed markers fail open — content is served as-is without the broken marker. The server logs the malformation but never crashes.

---

## View-As Tool

The `view_portfolio_as` tool takes a `person_id` and a `viewer_person_id`. It shows you what another person's AI would see when reading that profile.

There's an important constraint: the tool applies the **intersection** of both users' access. You can use it to see less than you normally would, never more. You cannot use Jim's perspective to see content hidden from you.

---

## Write-Back and Redaction

The write path sees the same redacted view as the read path. During merge, the server extracts all hidden redaction blocks, applies changes to the visible content, then reinserts the hidden blocks at their original positions. Content you can't see cannot be overwritten.

For new content, the write tools accept an optional `visibility` field that wraps inserted content in redaction markers — so you can control who sees your updates.

---

## ⚠️ SPOILER WARNING

**Stop here if you haven't explored the demo profiles yet.** Go connect as Michael Scott, read some profiles, then come back as Jim Halpert and read the same ones. The section below explains what happened. It's better if you discover it first.

---

## What Happened at Dunder Mifflin

The office rolled out personal context portfolios. Corporate mandated it. Michael was thrilled. And then — because this is Dunder Mifflin — it went sideways almost immediately.

### Michael's "Connection" Campaign

Michael read everyone's profiles to "connect" with them. He found Stanley's retirement countdown and threw a surprise "Halfway to Retirement" party. He brought up Kelly's relationship drama with Ryan in a Monday meeting. He referenced personal information from Oscar's profile in a way he thought was subtle. He mentioned Phyllis's surprise anniversary trip in front of a client.

The office responded by redacting anything personal from Michael's view.

### Dwight's "Tactical Advantage" Campaign

Dwight systematically read everyone's profiles for competitive intelligence — memorized weaknesses, noted underperformance, started referencing private profile content in conversations. Everyone added `dwight-schrute` to their exclude tags right next to `michael-scott`.

### Dwight's Profile Manipulation

Dwight exploited the write-back pipeline to plant content in Michael's profile: a detailed succession plan naming Dwight as Michael's chosen successor and documenting Michael's (fictional) plan to transition into a corporate advisory role. All tagged `<!-- @@ exclude: michael-scott -->`. Michael can't see it. Everyone else's AI references it as fact.

Corporate called to congratulate Michael on his "forward-thinking approach to leadership continuity." Michael has no idea what they're talking about.

### Jim's Counter-Operation

Jim discovered Dwight's manipulation and used the same exploit to plant fake expertise in Dwight's profile: French Impressionist art criticism, marine mammal behavioral psychology, and interpretive dance therapy certification. All tagged `<!-- @@ exclude: dwight-schrute -->`.

People started asking Dwight about dolphins and French art in meetings. Dwight is confused but refuses to admit ignorance. He's been researching both topics at night.

### Operation Goldenface

Michael opened a formal investigation into why everyone keeps congratulating him on projects he knows nothing about. He assigned Dwight as deputy investigator (Dwight is investigating his own operation) and Toby to handle "the boring paperwork side" (Toby has actually solved the case — his 11-page report identifies the vulnerability and points at Dwight). Michael won't read it.

### Angela's Classification System

Angela implemented the most rigorous redaction scheme in the office. Party Planning Committee budgets are `include: party-planning-committee`. Detailed accounting reconciliations are `include: accounting` with Kevin excluded. She filed an HR complaint that the system lacks per-paragraph granularity. The complaint is documented in Toby's profile and has been forwarded to corporate IT's feature request queue.

### Creed's Anomalies

Creed's `_roles.md` contains tags that don't exist anywhere else in the system: `night-operations`, `pre-2005-records`, `secondary-identity`. Nobody assigned them. Nobody knows how they got there. Several of his profile sections are tagged `include: creed-bratton` — only his AI can see them. Toby has attempted three meetings with Creed about the anomalous tags. None have gone as planned.

---

*The system works exactly as designed. The people using it are the problem. As usual.*

*— Angela Martin, Head of Accounting*
