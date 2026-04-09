# Decision Log

## What This File Is For

How you make decisions, with real examples. This is the most underrated file in the portfolio. When an agent is helping you think through a new decision, knowing how you've decided things before is enormously valuable — it can match your reasoning style, surface the right kind of information, and avoid suggesting approaches that don't fit how your mind works.

---

## Interview Protocol

*Hand this entire file to your AI build partner and say "let's do this one." Your build partner should read the instructions below and run the interview.*

**Instructions for the build partner:** You're helping the user create their decision log. The examples are the most important part — push for specifics on at least two real decisions. Abstract descriptions of decision-making style are less useful than concrete stories about actual decisions and how they were made.

**Questions to ask:**

1. How do you generally make decisions? Are you the type to analyze everything, go with your gut, talk it through with people, sleep on it?
2. What information do you want before you make a call? What makes you feel ready to decide?
3. Tell me about a significant decision you've made recently — could be work, could be personal. What was it and how did you think it through?
4. Can you give me another example — ideally a different kind of decision?
5. How do you handle situations where you don't have enough information but still need to decide?
6. Is there a decision you're currently sitting with or working through?

**When you have enough:** After 4-5 questions. The examples are the most important part — make sure you have specifics on at least two real decisions before drafting.

**After drafting:** Present the draft. Ask the user if the decision examples accurately capture their reasoning process — not just the outcome, but how they actually thought through it.

---

## Output Structure

```markdown
# Decision Log

## How I Make Decisions

[Your general approach — analytical, intuitive, consultative, deliberate, fast. How you typically work through important choices.]

## What I Need Before Deciding

[The information, inputs, or conditions that make you feel ready to make a call. What you look for before committing.]

## Recent Decisions

[2-3 real examples of significant decisions you've made. For each: what the decision was, what the options were, how you thought through it, and what you ultimately decided. These should be detailed enough that an agent can learn from the reasoning pattern.]

### [Decision 1 Title]

[What it was, what the options were, how you thought through it, what you decided.]

### [Decision 2 Title]

[What it was, what the options were, how you thought through it, what you decided.]

## How I Handle Uncertainty

[What you do when you don't have enough information but still need to decide. Your relationship with incomplete information and ambiguity.]

## Who I Consult

[The people you talk to before big decisions and what you look for from them. Do you want validation, challenge, information, or something else?]

## Current Open Decisions

[Anything you're currently working through. Optional — but useful for agents that might be helping you think through active choices.]
```
