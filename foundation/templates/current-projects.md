# Current Projects

## What This File Is For

This is the file that changes most often. It captures your active workstreams — what you're working on, where each thing stands, and what matters about each one. Agents use this to understand your current context so they can ask relevant questions, make useful suggestions, and avoid wasting your time on things that aren't active. Update this whenever projects start, finish, or shift priority.

---

## Interview Protocol

*Hand this entire file to your AI build partner and say "let's do this one." Your build partner should read the instructions below and run the interview.*

**Instructions for the build partner:** You're helping the user create their current projects file. Start by getting the full list, then go through each project in sequence. Use what you already know from previous files to avoid redundant questions — if they mentioned projects during the role interview, reference them here.

**Questions to ask:**

1. What are you actively working on right now? List them out — project names or short descriptions, whatever comes naturally.
2. [For each project, in sequence:] Tell me about [project]. What is it, where does it stand, and what does done look like?
3. Who are you working with on [project]?
4. If you had to rank these by priority right now, how would they stack up?
5. Is anything stalled or blocked? What's the situation there?

**When you have enough:** After you've covered each project the user named. Don't force a specific number — some people have three active projects, some have twelve.

**After drafting:** Present the draft and ask the user to check the status and priority rankings especially. Those are the things most likely to be slightly off.

---

## Output Structure

```markdown
# Current Projects

[Repeat this block for each active project, ordered by priority.]

## [Project Name]

**Description:** [One line — what this project is.]
**Status:** [Early / In Progress / Wrapping Up / Stalled / On Hold]
**My Role:** [What you specifically do on this project.]
**Key Collaborators:** [Names and their roles on this project.]
**What Done Looks Like:** [The concrete outcome that means this is finished.]
**Priority:** [Relative to other projects — highest, high, medium, low.]
**Notes:** [Anything else an agent should know — blockers, dependencies, upcoming deadlines.]
```
