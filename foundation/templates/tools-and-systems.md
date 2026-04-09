# Tools and Systems

## What This File Is For

What you use, how it's set up, and what connects to what. Agents use this to suggest workflows that fit your actual stack, avoid recommending tools you've already rejected, and understand where your data lives. If an agent is going to help you build something, it needs to know what it's building on top of.

---

## Interview Protocol

*Hand this entire file to your AI build partner and say "let's do this one." Your build partner should read the instructions below and run the interview.*

**Instructions for the build partner:** You're helping the user create their tools and systems file. This should be a practical inventory of their working environment, not an exhaustive list of every app on their phone. Focus on the tools that shape how they work day to day.

**Questions to ask:**

1. What tools and platforms do you use every day? Walk me through your core stack.
2. How is your setup customized? Any specific configurations, integrations, or workflows that an agent should know about?
3. Where does your important data live — docs, spreadsheets, databases, specific platforms?
4. Are there tools you're currently evaluating or planning to start using?
5. Anything you've tried and deliberately stopped using? What didn't work?

**When you have enough:** After 4-5 questions. Keep it practical.

**After drafting:** Present the draft. Ask the user if anything important is missing from the daily tools — people often forget to mention things they use so habitually they don't think of them as tools.

---

## Output Structure

```markdown
# Tools and Systems

## Daily Tools

[The tools and platforms you use every day. For each: what it is, what you use it for, and any notable configuration.]

## Data Sources

[Where your important data lives — documents, spreadsheets, databases, cloud storage, specific platforms. What lives where.]

## Integrations and Connections

[How your tools connect to each other. Automations, integrations, data flows between systems.]

## Evaluating or Planning to Adopt

[Tools you're looking at or planning to start using. What problem they'd solve.]

## Tried and Rejected

[Tools you've deliberately stopped using and why. Saves agents from recommending things you've already ruled out.]
```
