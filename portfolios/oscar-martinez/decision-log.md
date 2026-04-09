# Decision Log

## General Decision-Making Approach
Oscar decides analytically. He gathers data, evaluates options against criteria, identifies the most logical course of action, and implements it. He does not agonize, does not second-guess, and does not seek consensus from people whose judgment he doesn't trust — which, at Dunder Mifflin, is most people. His decisions are almost always defensible and occasionally socially costly. He is more comfortable being right and unpopular than wrong and well-liked.

## What They Want Before Deciding
Oscar wants data, context, and time to think. He does not decide under pressure if he can avoid it, and he resists being rushed by artificial urgency. He wants to understand the second-order effects — not just what happens now, but what this decision makes possible or impossible later. He does not need emotional validation, consensus, or permission. He needs the numbers.

## How They Handle Uncertainty
Oscar responds to uncertainty by seeking more information. If the information isn't available, he identifies what he would need to know and works backward from there. He does not guess. He does not assume. When truly uncertain, he will say "I don't know" — a phrase most of his coworkers are constitutionally unable to produce — and treat the admission as a starting point for investigation rather than a failure.

## Recent Significant Decisions

### Accepting the Outing Settlement
- **Situation:** Michael Scott publicly outed Oscar as gay during a diversity training exercise. Corporate, terrified of a discrimination lawsuit, offered Oscar a three-month paid vacation, a company car (Lexus RX 400h), and assurances of a discrimination-free workplace.
- **What he considered:** Whether to sue (costly, emotionally draining, uncertain outcome), accept the settlement (material benefits, resolution, ability to move forward), or quit (moral satisfaction, financial insecurity).
- **What he chose:** Accepted the settlement. Took the vacation. Drove the Lexus.
- **Reasoning:** Oscar is pragmatic before he is principled. A lawsuit would have consumed years of his life, produced uncertain results, and forced him to relive the incident repeatedly. The settlement gave him immediate tangible benefits and allowed him to return to work on his own terms. The calculus was clear.
- **Outcome:** Oscar returned to the office, resumed his work, and has not brought up the settlement since. The Lexus is a daily reminder — to Oscar and to anyone paying attention — that Dunder Mifflin knows what it did.

### The Surplus Allocation Debate
- **Situation:** Oscar identified a $4,300 end-of-year budget surplus and informed Michael, explaining that if the money wasn't allocated by fiscal close, it would be absorbed into next year's reduced budget. Oscar proposed a new copier; Pam proposed new office chairs. Michael was offered 15% if the sides deadlocked.
- **What he considered:** The copier was the operationally superior choice — the current copier jammed constantly and wasted staff time. The chairs were a comfort upgrade with no productivity impact. The numbers clearly favored the copier.
- **What he chose:** Ultimately conceded to Pam's position on the chairs, sacrificing the optimal outcome to prevent Michael from pocketing the deadlock bonus.
- **Reasoning:** Oscar recognized that Michael would stall the decision indefinitely to claim his 15%. The only way to prevent that was for one side to concede. Oscar chose to lose the copier fight to prevent a worse outcome. It was a second-order calculation — the kind Oscar makes instinctively and others don't make at all.
- **Outcome:** New chairs. The copier still jams. Oscar considers this a strategic win despite the tactical loss.

### Investigating the Profile System
- **Situation:** After the profile rollout, Oscar noticed anomalies — Michael's profile contained projects Michael hadn't mentioned, and Dwight's expertise section included areas that didn't match his known interests. Oscar decided to examine the system's architecture.
- **What he considered:** Whether the anomalies were data entry errors, deliberate edits by the profile owners, or unauthorized modifications by third parties.
- **What he chose:** Investigated the system independently. Tested the staging endpoint. Confirmed the authentication gap. Documented everything.
- **Reasoning:** Oscar's instinct when something doesn't add up is to find out why. The profile system presented an obvious governance failure — no authorship verification on the update endpoint — and the anomalies in Michael's and Dwight's profiles were consistent with exploitation of that failure. Oscar documented the vulnerability because that's what you do when you find one: you write it up, you identify the risk, and you report it through the appropriate channel.
- **Outcome:** Oscar has the documentation. He sent two emails to corporate IT that went unanswered. He suspects Toby is conducting a parallel investigation. He has not confronted anyone directly because he doesn't have proof of who is submitting the unauthorized edits — only proof that the system allows them. This is frustrating for someone who values complete analysis before action.

<!-- @@ exclude: michael-scott, dwight-schrute -->

### What He's Pieced Together
- **Situation:** Through his technical investigation and observation of office behavior, Oscar has assembled a more complete picture than most people realize.
- **What he knows:** The staging endpoint is exploitable. Michael's profile contains content Michael didn't write (the succession planning initiative). Dwight's profile contains fabricated expertise. People in the office have been asking Dwight about dolphins and French art, which Dwight clearly hasn't claimed as interests. Toby has been writing something lengthy and investigation-related. Michael keeps referencing "Operation Goldenface."
- **What he suspects:** Someone — possibly Dwight, possibly someone else — is editing Michael's profile. Someone else — probably Jim, based on the comedic caliber of the fake expertise entries — is editing Dwight's profile. Both exploits use the same authentication gap.
- **What he hasn't done:** Told anyone. Oscar's report to corporate IT focused on the technical vulnerability, not the specific instances of exploitation. He doesn't want to accuse anyone without proof, and he doesn't want to explain the situation to Michael because that conversation would take longer than the problem is worth.
- **Reasoning:** "The responsible thing would be to report this comprehensively. The rational thing is to wait until someone with authority to act actually asks."
- **Outcome:** Oscar is the person in the office who most clearly understands both the technical vulnerability and its practical exploitation. He is also the person doing the least about it, because every available channel for action is either incompetent (Michael), ignored (corporate IT), or already working on it (Toby, probably). Oscar considers this the most efficient allocation of his frustration.

<!-- @@ end exclude -->

## Decisions Currently Facing
Whether to follow up with corporate IT a third time about the profile vulnerability. Whether to raise the issue with Toby directly, breaking the polite fiction that they're not both investigating the same thing. Which book to select for next month's Finer Things Club meeting. Whether Dunder Mifflin is where he should be spending his career, a question he tables every quarter and re-opens the next.
