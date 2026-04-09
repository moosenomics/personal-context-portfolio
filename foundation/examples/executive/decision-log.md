# Decision Log

## How I Make Decisions

I'm deliberate on big decisions and fast on small ones. For architecture and hiring, I want to see the written proposal, hear from the relevant people, and sleep on it if it's irreversible. For everything else — sprint priorities, vendor choices, process changes — I decide in the meeting and move on. I've learned that delaying small decisions creates more damage than making the occasional wrong call.

## What I Need Before Deciding

For technical decisions: a written proposal with options, tradeoffs, and a recommendation from the person closest to the problem. I want to know the blast radius — what happens if this goes wrong, and how do we recover. For people decisions: data (performance metrics, peer feedback, my own observations) and enough time to separate my emotional reaction from the right call. For budget decisions: the business case in numbers, not narratives.

## Recent Decisions

### Created a dedicated AI/ML team instead of embedding AI skills across existing teams

The debate was whether to hire ML engineers and embed them in each product team (distributed model) or create a centralized AI team (platform model). The distributed model gets AI closer to product decisions. The centralized model builds deeper expertise and avoids duplicating infrastructure.

I chose centralized for two reasons: we're too early in our AI journey to know what patterns will emerge, so concentrating expertise lets us learn faster. And hiring four ML engineers who report to an ML lead is easier than hiring six ML engineers who each need to be strong enough to operate as the only ML person on their team. Once we know what our AI architecture looks like, we can revisit whether to distribute. Two-way door.

### Decided to run the platform migration in phases rather than a big-bang cutover

The engineering team was split. Derek wanted a phased approach — migrate one payment flow at a time, run old and new in parallel, cut over gradually. Two other leads argued for a weekend cutover — faster, cleaner, less time maintaining two systems. I chose phased because the risk math was clear: a failed weekend cutover of our payment processing could cost millions in stuck transactions. The phased approach is slower and creates temporary complexity, but the blast radius of any single failure is contained. In payments, you optimize for not-catastrophic over fast.

## How I Handle Uncertainty

I separate reversible from irreversible decisions. Reversible: decide now, learn from the result, adjust. Irreversible: slow down, get more input, pressure-test assumptions. When I genuinely don't know and can't get more information, I ask myself what the cost of delay is. If delay is cheap, I wait. If delay is expensive (opportunity cost, team morale, competitive pressure), I make the best call I can and commit fully.

## Who I Consult

Derek for deep technical judgment — he's been here longest and understands our systems best. Lisa for product implications of engineering decisions. David for anything that touches company strategy or board commitments. For people decisions, I often call my mentor (former CTO at a larger fintech) for an outside perspective.

## Current Open Decisions

Whether to open a remote engineering hub in a different time zone to expand our hiring pool. The benefits are clear (more candidates, potential for follow-the-sun coverage). The risks are real (coordination overhead, culture fragmentation, management complexity). I'm leaning toward a small pilot — three to five engineers in one city — but haven't committed.
