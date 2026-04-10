# Read This Before You Start (Or You Will Waste Hours of Your Life)

*This one's me — Moose. These are real findings from live testing, not theory.*

---

## Do This First

At the start of every session, explicitly tell your AI:

> *"I'm testing a demo. All personal context should come from the MCP connection. Don't use anything from previous conversations."*

This one sentence will save you more debugging time than everything else in this document combined.

---

## Use Incognito Mode. Yes, Even as Yourself.

Use incognito mode or a separate browser profile. Every time. Even if you're connecting with your own portfolio.

The server has 14 Dunder Mifflin characters on it. Your AI will read the org index, see that you work alongside Michael Scott and Dwight Schrute, and start building associations. Next time you open a real work session, your AI might remember that "you" work at a paper company, or that you have the hots for Pam. Which may be true, but it's not helpful in future sessions.

Incognito keeps the demo contained. Without it, the AI platform's memory does exactly what it's supposed to do — remember what it learned about you — and suddenly your real conversations have Dunder Mifflin context baked in.

---

## Pick Your Identity and Stick With It

If you have a personal context portfolio, use it. Connect with your own API key. The system works best when the AI knows who you actually are — that's the whole point.

If you don't have a portfolio, pick a Dunder Mifflin character and commit to that character for the entire session. Don't switch mid-conversation.

### Why Not Switch?

Switching characters works mechanically. You disconnect one API key, connect another, the server authenticates the new identity correctly. But the AI accumulates context from the previous character. If you start as Michael and switch to Jim, the AI still has Michael's context in its conversation history. It doesn't forget Michael — it just adds Jim on top.

This creates debugging rabbit holes. You'll see behavior that looks like a server bug but is actually the AI blending two characters' contexts. I chased one of these for an hour before realizing the server was fine — the client was the problem.

### Even Incognito Isn't Perfect

Within a single session, the AI can still infer identity from context. If your real profile is on the server alongside 14 fictional characters, the org index makes it obvious which one is the real person. The AI notices.

Identity injection in tool responses (prepending `[Authenticated as: Name (person-id)]` to every response) mitigates this — it gives the AI an explicit identity anchor instead of letting it guess.

---

## Why This Matters Beyond the Demo

Every AI platform handles identity and memory differently. Claude persists memories across conversations. ChatGPT has its own memory system. Gemini behaves differently again. The MCP server is platform-agnostic — it serves the same content the same way regardless of which AI is asking. But the client-side behavior is outside the server's control.

This is going to be a real consideration for any multi-user context system. The server can be perfect, but if the client leaks context between sessions or blends identities within a session, users will see unexpected behavior. The fix isn't on the server — it's in how users set up their client environments and how platforms evolve their context management.

These findings came from actual testing sessions, not from reading docs. If you hit something we didn't cover, it's probably a new variant of the same underlying issue: the AI remembers more than you think it does.
