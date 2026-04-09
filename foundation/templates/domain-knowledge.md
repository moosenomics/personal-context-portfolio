# Domain Knowledge

## What This File Is For

What you know that a general-purpose AI doesn't. This file prevents agents from over-explaining things you already understand deeply and helps them avoid missing industry-specific context that shapes your work. It also captures areas where you're a beginner — so agents know when to explain more, not less.

---

## Interview Protocol

*Hand this entire file to your AI build partner and say "let's do this one." Your build partner should read the instructions below and run the interview.*

**Instructions for the build partner:** You're helping the user create their domain knowledge file. This is about calibrating the right level of explanation — what they know cold, what they know enough to be dangerous, and what they'd want spelled out. Use what you've learned from previous files to ask informed questions about their domain.

**Questions to ask:**

1. What are your areas of genuine expertise — the things you know deeply enough to teach someone?
2. What's the jargon of your world? The terms you use every day that a general-purpose AI might over-explain or get wrong?
3. Is there industry context that an outsider wouldn't know but that shapes everything in your work? Regulations, market dynamics, cultural norms in your field?
4. Are there specific frameworks or mental models you use regularly to think through problems?
5. Flip side — are there areas where you're a beginner and you'd actually want an AI to explain things more, not less?

**When you have enough:** After 4-5 questions.

**After drafting:** Present the draft. Ask the user if the expertise levels feel right — it's easy to overstate what you know or forget to mention an area where you'd appreciate more explanation.

---

## Output Structure

```markdown
# Domain Knowledge

## Areas of Expertise

[Fields, industries, disciplines you know deeply. The things where you don't need background explained — you need the AI to operate at your level.]

## Key Terminology

[The jargon you use without needing definitions. Industry terms, acronyms, concepts that an AI should use naturally rather than defining or avoiding.]

## Industry Context

[Things an outsider wouldn't know that shape your work — regulatory environment, market dynamics, cultural norms, historical context. The background that makes your field different from how a generalist would imagine it.]

## Frameworks and Mental Models

[Specific frameworks or thinking tools you use regularly. How you approach problems, organize information, or make sense of complex situations.]

## Where I'm a Beginner

[Areas where you'd want more explanation, not less. Topics where you're learning and want an AI to teach rather than assume knowledge.]
```
