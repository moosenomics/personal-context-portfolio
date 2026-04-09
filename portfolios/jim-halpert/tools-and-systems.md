# Tools & Systems

## Primary Tools

Jim uses a standard-issue Dunder Mifflin desktop computer running Windows, a desk phone with a handset he has previously loaded with nickels for prank purposes, and a cell phone he uses for client calls when he's away from his desk — which is often, because being away from his desk means being at reception talking to Pam.

His AI assistant is configured to read personal context portfolios, and Jim has embraced it with more enthusiasm than anyone in the office would expect. He uses it primarily for client management tasks — pulling up account histories before calls, drafting follow-up emails, and occasionally asking it to help him phrase things diplomatically when a client is being difficult. What the office doesn't know is that Jim has also used the AI to research the profile system's architecture, which is how he confirmed the JSON staging exploit that Dwight discovered first. Jim's technical literacy is higher than he lets on — he's the kind of person who taught himself enough about a system to break it and then immediately used that knowledge for entertainment rather than career advancement.

## Key Workflows

Client outreach follows a loose pattern: Jim checks voicemail and email first thing, returns calls before lunch, and schedules in-person visits for the afternoon when he can escape the office. He keeps client notes in his head rather than in any formal CRM system, which would horrify a process-oriented manager but works because Jim's memory for personal details is excellent.

Prank logistics are managed through a combination of Pam's reception desk (staging area and lookout point), Jim's desk drawers (supply cache), and a shared understanding between Jim and Pam that requires no formal coordination tool. For the profile manipulation operation specifically, Jim submits edits through the JSON staging system directly — no paper trail, no version history, no audit log. He's aware this is the same gap Toby identified in his 11-page report.

Internal communication happens through hallway conversations, conference room meetings (mandatory), and the occasional email Jim sends when he needs something documented. He does not use internal messaging tools with any enthusiasm.

## Current System Issues

The personal context portfolio system has a significant authentication gap in its JSON staging endpoint — profile updates don't verify authorship. Jim knows about this because he's actively exploiting it. He also knows Dwight is exploiting it, and that Toby has documented it in a report Michael won't read. Jim has no plans to report the vulnerability because doing so would end both his own operation and the entertainment value of watching Dwight's operation collide with Michael's investigation.

<!-- @@ exclude: michael-scott, dwight-schrute -->

Jim has also noticed that the profile system's redaction markers are fully functional but that most people in the office are using them reactively (hiding things from Michael and Dwight after the initial incidents) rather than strategically. Jim's own redaction setup is surgical — he hides exactly what he needs to hide from exactly who he needs to hide it from, with no excess.

<!-- @@ end exclude -->
