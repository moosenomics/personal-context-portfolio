# Decision Log

## How I Make Decisions

I'm a "gather inputs, then decide quickly" person. I want to hear from the relevant people, see the data if data exists, and understand the tradeoffs — but once I have that, I make the call and move. I don't agonize. I'd rather make a decision and course-correct than delay for more certainty. I do talk through big decisions with James or Priya before committing, but I'm usually 80% decided by the time I do.

## What I Need Before Deciding

For product decisions: What's the user problem? What does the data say (if we have it)? What are the engineering implications? What do our top customers think? For prioritization decisions: What moves the metrics I'm accountable for? What's the effort? What happens if we don't do it?

I don't need certainty. I need enough information to have a defensible rationale. If someone asks me "why did you decide that?" I should be able to give a clear answer.

## Recent Decisions

### Chose threaded messaging over channel-based messaging for V2

We had two architecturally different approaches for the messaging rebuild. Channels (like Slack) would have been more flexible and let care teams organize conversations by topic. Threaded (like iMessage replies) is simpler and maps to how patients actually think about conversations — "my conversation with my doctor."

The data said our patients are mostly older and less tech-savvy than a typical Slack user. Clinical staff told us they wanted simplicity over flexibility. The channel model would have taken 3-4 extra sprints. I chose threaded. Two of our customer advisory board members pushed back, but the usage data from our prototype validated the decision — patients found threads intuitive and channels confusing.

### Decided to delay the care plan pilot rather than build a workaround

Epic's API timeline kept slipping. My team proposed building a manual data import workaround so we could at least demo the feature. I decided against it because the workaround would have taken two sprints of Team Reef's time, produced a demo-quality feature that couldn't scale, and created pressure to keep the workaround alive instead of waiting for the real integration. Better to keep Team Reef on notification preferences (which ships real value) and let the pilot wait. Hard to defend politically because it looks like nothing is happening, but it's the right engineering tradeoff.

## How I Handle Uncertainty

I bias toward action with a "two-way door" test. If we can reverse the decision cheaply, I decide fast and iterate. If it's hard to reverse (architecture choices, customer commitments, pricing), I'll slow down and gather more input. When truly stuck, I ask myself: "If I had to decide right now with only what I know, what would I pick?" That usually clarifies things.

## Who I Consult

James for technical feasibility and engineering tradeoffs. Priya for political and strategic implications. Dr. Okafor for clinical validity. Our customer success lead Maria for customer sentiment. I'm not looking for consensus — I'm looking for perspectives I might be missing.

## Current Open Decisions

Whether to accept a large customer's request to prioritize a custom notification feature that only they need. It would take a sprint, it serves one customer, but they're our biggest account and their renewal is in Q3. Leaning toward a compromise — a lighter version that's configurable enough to serve other customers too — but I haven't committed.
