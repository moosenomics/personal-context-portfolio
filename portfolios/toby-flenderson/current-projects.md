# Current Projects

## Profile System Security Investigation (Operation Goldenface — HR Track)
- **What:** A comprehensive investigation into anomalies in the PCP/MCP system, initiated after Michael Scott received unexplained congratulations from corporate and other branches regarding a succession planning initiative he didn't create. Michael assigned both Toby and Dwight to investigate.
- **Status:** Complete from Toby's end — report delivered, awaiting review (indefinitely)
- **Toby's role:** Lead HR investigator. Toby approached the investigation the way he approaches everything: methodically, thoroughly, and with the quiet certainty that his work will be ignored.
- **Key collaborators:** Michael Scott (case owner, non-reader), Dwight Schrute (parallel investigator, who has been scheduling "coordination meetings" with Toby that feel more like surveillance than collaboration)
- **Key detail:** Toby's 11-page report identifies the core vulnerability: the JSON staging endpoint used for profile updates does not verify that the submitter is the profile owner. Any authenticated user can submit modifications to any profile. The report includes forensic analysis of modification timestamps, a pattern analysis showing that Michael's profile was modified from outside Michael's own sessions, and a recommended remediation plan (server-side authorship verification, audit logging, and a review of all profiles modified since the system launched). Toby presented the report to Michael, who glanced at the cover page, said "this is from Toby and also it is eleven pages long," and placed it beneath a copy of Variety magazine. The report sits unread on Michael's desk. Toby has sent two follow-up emails, both unanswered. He has considered forwarding the report to corporate IT directly but is weighing whether bypassing Michael would make his working relationship worse than it already is — which he acknowledges is a low bar.
- **Priority:** High (Toby's assessment) / Nonexistent (Michael's assessment)

<!-- @@ exclude: michael-scott, dwight-schrute -->

## What Toby Actually Found

The modification patterns in Michael's profile are consistent with a single internal actor — someone with system access, a detailed understanding of Michael's current projects (to make the planted content blend naturally), and a motivation to position themselves in a succession plan. The timestamps cluster in early morning hours, before most employees arrive but consistent with one specific employee's known schedule. Toby has not named the suspected actor in his report — he documented the evidence and left the identification to the reader, because that's how investigations are supposed to work. But the evidence points clearly at Dwight Schrute.

Toby is aware that Dwight has been scheduling coordination meetings to assess how close the investigation is getting. He interprets these meetings correctly — as monitoring rather than collaboration — but has not confronted Dwight because (a) Michael won't read the report anyway, (b) confronting Dwight directly would trigger an escalation Toby doesn't have the institutional support to manage, and (c) the situation, while technically a security breach, is causing no material harm to anyone and is generating the kind of office chaos that Toby has learned to classify as "self-resolving."

The irony is not lost on Toby. He is the one person in the office doing competent, thorough work on the profile system issues, and he is being completely ignored by the one person who asked for his help. This is, in Toby's experience, how things generally work.

<!-- @@ end exclude -->

## Angela Martin's Redaction Granularity Complaint
- **What:** Angela has filed a formal HR complaint that the PCP system's redaction controls are insufficiently granular. She wants per-paragraph access controls, not just section-level markers.
- **Status:** Documented and forwarded to corporate IT
- **Toby's role:** Complaint processor and liaison to corporate
- **Key detail:** Angela's complaint is technically valid — the current system only supports section-level include/exclude blocks, which means she can't hide specific budget line items from Kevin while showing the rest of the accounting section to other accounting staff. Toby documented the complaint with his usual thoroughness and forwarded it to corporate IT's feature request queue. He does not expect a response. Angela has asked for status updates twice. Toby has told her the request is "in the queue" both times, which is true in the same way that Toby's career ambitions are "in progress."
- **Priority:** Medium — it's a legitimate feature request attached to a formal complaint, which makes it more serious than a suggestion but less urgent than the security vulnerability that no one will read about.

## Creed Bratton Profile Anomaly Documentation
- **What:** Creed's `_roles.md` file contains tags that don't exist in the system's standard taxonomy: `night-operations`, `pre-2005-records`, `secondary-identity`. No administrator assigned these tags. No other employee has them. No system documentation references them.
- **Status:** Documented, unresolved
- **Toby's role:** Investigator (stalled)
- **Key detail:** Toby has attempted to schedule three meetings with Creed to discuss the anomalous tags. Meeting one: Creed did not appear. When Toby followed up, Creed said "We already had that meeting. You were wearing a blue shirt. We agreed the tags were fine." Toby was not wearing a blue shirt that day and does not own a blue shirt. Meeting two: Creed appeared at Toby's cubicle at 11 PM on a Tuesday (Toby was not there; the security camera log confirmed Creed's presence). Meeting three: Creed sent a handwritten note that said "Meeting complete. See attached." There was no attachment. Toby has documented all of this and added it to Creed's HR file, which is the thickest file in the cabinet despite Creed having the least documentation of any employee's actual job performance.
- **Priority:** Low-to-moderate — the tags are anomalous but not obviously harmful, and every interaction with Creed about the topic makes the situation less clear rather than more.

## Ongoing HR Compliance and Branch Management
- **What:** The day-to-day HR work that keeps Dunder Mifflin Scranton from being shut down by legal, compliance, or common sense.
- **Status:** Perpetual
- **Toby's role:** Sole HR representative
- **Key detail:** Toby processes an average of three to four incident reports per week, mediates two to three interpersonal conflicts per month, and conducts required compliance training on an annual cycle. The incident rate at the Scranton branch is significantly higher than at comparable branches — a statistic that corporate attributes to the branch's "unique culture" and Toby attributes to Michael.
- **Priority:** Baseline — this is the job. Everything else is extra.

## Novel in Progress
- **What:** Toby is writing a novel. It is a mystery involving a strangler operating in a mid-size northeastern city. The protagonist is an overlooked professional who notices details others miss.
- **Status:** In progress — approximately 60 pages completed over several years
- **Toby's role:** Author
- **Key detail:** Toby writes in fragments — during lunch, between meetings, in the quiet stretches of afternoon when the office is functioning without crisis. The novel is slow-going but represents Toby's one creative outlet and his most private ambition. He does not discuss it at work except in rare, quickly deflected moments. The writing is competent if unspectacular, much like Toby himself.
- **Priority:** Personal — high. Professional — nonexistent.
