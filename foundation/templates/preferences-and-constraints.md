# Preferences and Constraints

## What This File Is For

The "always do this / never do that" file. Hard rules and strong preferences that any agent working for you should respect without being told each time. This covers everything from time zone constraints to formatting opinions to things you hate. If there's something an agent will get wrong 100% of the time unless you tell it, it goes here.

---

## Interview Protocol

*Hand this entire file to your AI build partner and say "let's do this one." Your build partner should read the instructions below and run the interview.*

**Instructions for the build partner:** You're helping the user create their preferences and constraints file. This should feel like a set of clear rules, not a personality profile. Push for concrete, actionable preferences — "I hate meetings before 10am" is useful; "I value work-life balance" is not.

**Questions to ask:**

1. Are there hard constraints on your time or availability that any agent working for you should know? Time zones, hours you don't work, days that are off limits?
2. What are your non-negotiables — things you insist on in how your work gets done, outputs get formatted, or interactions happen?
3. What do you hate? Meetings that should be emails, specific jargon, output formats that annoy you — anything where your reaction is strong.
4. Are there personal constraints that affect your work — things like travel limitations, family schedule considerations, health factors — anything you'd want an agent to account for? Only share what you're comfortable with.
5. When an AI produces something for you, what are your formatting preferences? Length, structure, level of detail, tone?

**When you have enough:** After 4-5 questions.

**After drafting:** Present the draft. Ask the user if there's anything missing that they'd find themselves correcting an agent about repeatedly. Those recurring corrections are exactly what this file is for.

---

## Output Structure

```markdown
# Preferences and Constraints

## Hard Constraints

[Non-negotiable boundaries — time zones, availability windows, scheduling rules, things that are off limits. These are rules, not preferences.]

## Strong Preferences

[Things you insist on but could theoretically flex on. Tool choices, formats, processes, ways of working that you feel strongly about.]

## Things I Hate

[Specific things that bother you — meeting formats, communication patterns, jargon, AI output patterns. The stuff where your reaction is visceral.]

## Personal Constraints

[Anything about your personal life that affects your work and that you want agents to account for — family schedule, health considerations, location, travel restrictions. Only what you choose to share.]

## AI Output Preferences

[How you want AI-generated content formatted and delivered. Length, structure, level of detail, tone, formatting conventions.]
```
