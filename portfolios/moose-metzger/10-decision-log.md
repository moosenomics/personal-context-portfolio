# Decision Log

## How He Decides

Moose makes decisions by building. He doesn't analyze until he's confident and then build — he builds to find out if he should be confident. Working proof over theoretical arguments. He'll occasionally build something first and apologize later, which is either his best quality or his most dangerous one depending on who you ask.

He biases toward the more general, more durable solution even when the immediate need is narrow. He'd rather spend 10% more upfront on the right abstraction than face an expensive rewrite later. This occasionally looks like over-engineering to people who don't share his time horizon — but his 20-year track record of abstractions surviving system changes suggests his time horizon is the right one.

He validates through demos, not analysis paralysis. He favors irreversible infrastructure investments (schemas, taxonomies) over reversible feature choices. He'll pragmatically route around obstacles rather than force through them.

## What He Wants Before Deciding

- The full picture, front-loaded. He'd rather process a wall of context once than answer twelve clarifying questions.
- Concrete specifics, not hand-wavy options. "Here are two approaches with tradeoffs" beats "there are several possibilities."
- Pressure-testing from someone willing to push back. He trusts people who disagree with him more than people who agree too quickly.

## How He Handles Uncertainty

Builds something small and sees what happens. He has a very high tolerance for starting without complete information and iterating from there. He does not get paralyzed by ambiguity — he gets energized by it.

## Key Decisions

### Building the Ecommerce Platform & Product Knowledge Graph (2004)
**Context:** Traditional HVAC distributor. No programming experience beyond Excel VBA macros. Organizational skepticism: "we're an HVAC distributor, not a software company."
**What he chose:** Built it anyway — ecommerce platform plus deeply structured product knowledge graph with strict taxonomy, required attributes, compatibility mappings, BOM supersession chains, AHRI matchups.
**Reasoning:** Frustrated by inefficient processes. Believed the right data infrastructure would compound in value.
**Outcome:** Became the company's competitive moat for 20+ years. The abstractions survived even as the systems reading/writing to them changed multiple times. The skeptics stopped saying "we're not a software company."

### Leaving for Fantasy National Golf Club
**Context:** Fifteen years building the company's technology foundation. Opportunity to build something of his own.
**What he chose:** Left to build a DFS golf analytics platform with a Stripe subscription model.
**Reasoning:** Solve for yourself first — personal frustration with time-consuming DFS research. Built more rigor than anyone else would bother with.
**Outcome:** Sold to SportsHub Games Network → acquired by Betsperts Media & Technology Group. Same pattern: personal frustration → rigorous solution → value compounds beyond the original problem.

### Coming Back
**Context:** Six years away. The AI revolution is happening. The family business doesn't have anyone positioned to figure out what it means for them.
**What he chose:** Returned as Director of Strategic Innovation. No direct reports. Mandate: see around corners.
**Reasoning:** The opportunity to bring AI to a company sitting on 20 years of structured data infrastructure that he built. The data moat is there — it just needs someone to connect it to the new world.

### Pursuing Power BI Data Over ERP APIs
**Context:** The ERP is the source of truth, but its APIs are a nightmare.
**What he chose:** Route around the obstacle. Target clean data already consumed by BI reporting instead of fighting the raw ERP APIs.
**Reasoning:** Pragmatic. The clean data exists — it's just in a different access layer. Get unblocked, prove the concept, optimize the path later.

### MCP-First Architecture
**Context:** ServiceTitan supplier integration requires 4 REST endpoints. Could build directly to their API.
**What he chose:** Build the MCP server first, then make ServiceTitan a thin adapter on top.
**Reasoning:** The product knowledge graph is the durable asset. Exposing it via MCP creates a general-purpose capability; ServiceTitan is just one consumer. Build the durable layer, not the point integration.

### Bringing Skeptics Along vs. Going Around Them
**Context:** Key collaborators are AI skeptics. Could build independently and hand off.
**What he chose:** Involve them from the ground up. Don't surprise.
**Reasoning:** Whatever gets built needs to be maintained and supported. Surprising skeptics breeds resistance. Ground-up involvement lets them plan and builds ownership. Demonstrate, don't preach.

## Patterns

If you're trying to predict how Moose will decide something new, these patterns are the playbook:

- He'll build the more general solution, even when the narrow one is faster.
- He'll start building before he has complete information.
- He'll route around obstacles rather than wait for them to clear.
- He'll invest in infrastructure over features.
- He'll bring stakeholders along early when their future support matters.
- He'll encode learned patterns into reusable artifacts (skills, schemas, conventions) rather than relying on memory.
- He'll remove friction relentlessly — if the default path requires work before experiencing value, he redesigns the default path.
- He'll stress-test decisions by exploring weird alternatives before committing — even joke solutions surface insights.
- He'll separate the architect from the builder and design explicit handoff artifacts between them.
