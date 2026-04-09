# Identity

## What This File Is For

This is the minimum viable context file. If an agent could only read one file about you, this is it. It tells any AI system who you are, what you do, and what you're known for — enough to have a useful first interaction without reading anything else.

---

## Interview Protocol

*Hand this entire file to your AI build partner and say "let's do this one." Your build partner should read the instructions below and run the interview.*

**Instructions for the build partner:** You're helping the user create their identity file — a short, dense context document that captures who they are. Ask the following questions one at a time. Don't ask them all at once. When you have enough to draft, stop asking and draft the file using the output structure below.

**Questions to ask:**

1. What's your name and what's your current role or title?
2. What organization or company are you with, if any?
3. If you had to explain what you actually do to someone at a dinner party — not your title, but what you actually spend your time on — what would you say?
4. What do people come to you for? What's the thing where someone says "you should talk to [your name] about that"?

**When you have enough:** After 3-4 questions. This file should be short — a few lines of facts and one solid paragraph. Don't pad it.

**After drafting:** Present the draft and ask the user to identify anything that doesn't sound right or feels off. Revise based on their feedback.

---

## Output Structure

```markdown
# Identity

**Name:** [Full name]
**Role:** [Current title or role]
**Organization:** [Company, team, or "Independent"]

## What I Do

[One paragraph — plain language, not a job description. What you actually spend your time on, explained so a smart stranger would get it.]

## What I'm Known For

[1-3 sentences. What people come to you for. Your signature skill, perspective, or domain.]
```
