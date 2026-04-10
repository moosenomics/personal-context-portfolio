# Getting Started

*Hi, I'm Pam. I'm the office administrator here at Dunder Mifflin Scranton. I handle the phones, the supply closet, and apparently now I'm also the person who explains how the new AI profile system works. Which is fine. I actually like helping people get set up — it's way better than restocking the copier.*

*Pick the path that fits where you are, and I'll walk you through it.*

---

## Three Ways In

### Path 1: Bring Your Own Portfolio (Best Experience)

If you want to see what this system actually does — your AI knowing who you are, who you work with, and how you work — this is the path.

1. Build your portfolio at [contextportfolio.ai](https://contextportfolio.ai). It takes about 20 minutes. The AI interviews you and generates 10 markdown files.
2. Create a folder in `portfolios/` named with your person-id. Use kebab-case — typically `firstname-lastname` (e.g., `pam-beesly`). Three-part names, just pick what works.
3. Drop the individual `.md` files into your folder. Not the zip file. Not the extracted folder. Just the files themselves. If they have numbered prefixes like `01-identity.md`, that's fine — the server strips those automatically at startup.
4. The server auto-generates your API key (`dm-your-person-id`) and a starter `_roles.md` file at next startup. See [Onboarding Shortcuts](onboarding-shortcuts.md) for details on what happens behind the scenes.
5. Connect your AI tool using the guide for your platform: [Claude](connect/claude.md) · [ChatGPT](connect/chatgpt.md) · [Gemini](connect/gemini.md)

### Path 2: Explore Without a Portfolio

Want to poke around the org without uploading anything personal?

1. Create an empty folder in `portfolios/` with your person-id.
2. Connect using the guide for your platform.
3. You can read everyone else's profiles and explore the org index. Your AI just won't have personal context about you.

### Path 3: Be a Dunder Mifflin Character (Quickest)

The repo ships with 14 Dunder Mifflin characters, each with a complete portfolio and an API key ready to go.

1. Pick a character. We recommend starting as Michael Scott — then try Jim Halpert. You'll see why.
2. Connect using the API key `dm-{person-id}` (e.g., `dm-michael-scott`). See the connection guide for your platform: [Claude](connect/claude.md) · [ChatGPT](connect/chatgpt.md) · [Gemini](connect/gemini.md)
3. **Use incognito mode or a separate browser profile.** Seriously. See [Before You Start](before-you-start.md).
4. Commit to one character per session. Don't switch mid-conversation.

---

## Person-ID Convention

Your person-id is the name of your folder in `portfolios/`. It's kebab-case, your choice, typically `firstname-lastname`. It becomes your identity throughout the system — your API key, your redaction tag, your entry in the org index.

---

## What to Try First

Once you're connected, try these in order:

1. **"What are my current projects?"** — Your AI pulls your portfolio and gives you a briefing.
2. **"Tell me about Dwight Schrute"** — Your AI reads Dwight's profile, filtered through your redaction tags. What you see depends on who you are.
3. **"Show me the org index"** — A lightweight snapshot of everyone in the org (~800 tokens for 15 people).
4. **"View my profile as [someone else]"** — The `view_portfolio_as` tool shows you what another person's AI sees when it reads your profile. Try viewing yourself as different people. Notice what disappears.
5. **"Update my profile: I just completed the Q3 sales report"** — The write-back pipeline takes your observation, normalizes it, and merges it into the right file. Check your profile after to see what changed.

*That last one is Michael's favorite. He updates his profile constantly. — Pam*

---

## What's Next

- **Platform setup:** [Claude](connect/claude.md) · [ChatGPT](connect/chatgpt.md) · [Gemini](connect/gemini.md)
- **Before you start:** [Read This First](before-you-start.md)
- **How the system works:** [Architecture](architecture.md)
- **The redaction system:** [Redaction](redaction.md)
- **What the server handles for you:** [Onboarding Shortcuts](onboarding-shortcuts.md)
