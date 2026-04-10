# Organizational Personal Context Portfolio — MCP Server

A multi-user MCP server that serves personal context portfolios to AI assistants — so your AI actually knows who it's talking to, who you work with, and how you work.

---

## Origin Story

I run strategic innovation at a regional HVAC distributorship. Not a tech company. Not a startup. A family-owned, mid-market distributor where I'm trying to get an entire leadership team to adopt AI — not as a technology, but as a skill.

On Friday, April 4th, [The AI Daily Brief](https://www.aidailybriefpodcast.com/) dropped an episode about personal context portfolios and the [personal-context-portfolio](https://github.com/nlwhittemore/personal-context-portfolio) repo. I built mine on [contextportfolio.ai](https://contextportfolio.ai) that morning. My productivity went through the roof. Every AI conversation started with context instead of from zero.

Tuesday morning, I shared the concept with my leadership team at our weekly meeting. The response surpassed anything I could have anticipated — they assigned *themselves* the homework of building a [contextportfolio.ai](https://contextportfolio.ai) portfolio by next week's meeting.

## The Problem

That same afternoon, I picked up a new project and my PCP already felt like it was written in the 90s. I was dropping related files into different Claude Projects, ending up with different versions of the same file with different updates in different styles. Impossible to keep current. Then I panicked — because the organizational momentum I'd been waiting for was in jeopardy the moment everyone else hit the same brick wall.

I knew about MCP servers — they're mentioned in the original repo — but setting up 9 separate local servers made no sense. Then I thought: what if we all shared one? Everyone's AI reads everyone else's profiles.

But the moment you put people on a shared server, they want to keep things personal. Your AI should know about your retirement countdown. Your boss's AI shouldn't. So I built a role-based redaction system — inline markers in the markdown that the server strips at serve time based on who's asking.

And if profiles can't update themselves through normal AI conversations, they die. So I built a write-back pipeline — your AI observes something new about you, submits it to the server, and the server merges it into your markdown files without touching content that's hidden from you.

The original repo had the vision. The templates, the interview protocol, the content model — that's all [The AI Daily Brief](https://github.com/nlwhittemore/personal-context-portfolio)'s work. I picked it up where it stops: multi-user serving, centralized hosting, redaction, write-back, and an auto-generated org index — platform-agnostic across Claude, ChatGPT, Gemini, Cursor, and anything else that speaks MCP.

If I can do this, you can do this. If you know more about what you're doing than I do — which is not a high bar — I'd love your feedback.

---

## The Dunder Mifflin Personal Context MCP

I had an idea for a solution, but my team's real profiles wouldn't be ready for another week — an eternity when you're moving this fast. I knew I'd end up stabbing myself in the face if I spent the next week working with boring, generic dummy profiles. Then I had an idea — what if The Office magically had personal context portfolios on a shared MCP server? And what if it was wreaking havoc at the Scranton branch?

If you do nothing else with this repo, go read some files from your favorite characters' context portfolios.

### The Plot

The office recently rolled out personal context portfolios. Corporate mandated it. Most people filled out their profiles with genuine work information.

Things did not go smoothly.

Become a new hire at Dunder Mifflin. Upload your [contextportfolio.ai](https://contextportfolio.ai) portfolio and ask questions about who you should talk to, what the culture is like, and — oh yeah — try updating your PCP.

More importantly than it being fun — you can instantly see how valuable a central organizational context portfolio could be for a small business, or any business for that matter. Assuming it had a little more robust security.

This is my solution, but I'm not going to explain every piece of it — that's what the rest of the team is for.

---

## Quick Start

Pick your path:

1. **Bring your own portfolio** — Build at [contextportfolio.ai](https://contextportfolio.ai), drop your files in `portfolios/your-name/`, connect.
2. **Explore without a portfolio** — Create an empty folder, connect, browse everyone else's profiles.
3. **Be a Dunder Mifflin character** — Pick a character, connect with their API key, start exploring. Zero setup.

Full instructions in the [Getting Started](docs/getting-started.md) guide. Platform-specific connection guides: [Claude](docs/connect/claude.md) · [ChatGPT](docs/connect/chatgpt.md) · [Gemini](docs/connect/gemini.md)

---

## Documentation

| Document | Author | What It Covers |
|----------|--------|---------------|
| [Getting Started](docs/getting-started.md) | Pam Beesly, Office Administrator | Three onboarding paths, what to try first |
| [Read This Before You Start (Or You Will Waste Hours of Your Life)](docs/before-you-start.md) | Moose | Based on experience, not theory |
| [Architecture](docs/architecture.md) | Ryan Howard, MBA (Temp) | How the server works — read path, write path, tool inventory |
| [Redaction System](docs/redaction.md) | Angela Martin, Head of Accounting | Marker syntax, tag system, and what happened at the office |
| [Onboarding Shortcuts](docs/onboarding-shortcuts.md) | Jim Halpert, Sales Representative | Auto prefix stripping, API key gen, roles file gen |
| [Scope & Limitations](docs/scope-and-limitations.md) | Ryan Howard, MBA (Temp) | What we didn't build and why |
| [Build Process](docs/build-process.md) | Andy Bernard, Sales Representative (Cornell '95) | The architect/builder split, skills system, profile generation |
| **Connection Guides** | Pam Beesly | |
| &nbsp;&nbsp;[Claude](docs/connect/claude.md) | | Claude.ai connector setup |
| &nbsp;&nbsp;[ChatGPT](docs/connect/chatgpt.md) | | Developer Mode connector setup |
| &nbsp;&nbsp;[Gemini](docs/connect/gemini.md) | | CLI, Code Assist, and Android Studio setup |

---

## Licensing & Attribution

*Toby Flenderson, Human Resources. I know nobody reads this section. That's fine. I'm used to it. But someone has to make sure the attributions are correct and the legal language is in place, so here we are.*

### License

MIT License. See [LICENSE](LICENSE) for the full text.

### Attribution

This project is a fork of [nlwhittemore/personal-context-portfolio](https://github.com/nlwhittemore/personal-context-portfolio) — the original repo, the 10-file template structure, the interview protocol that powers [contextportfolio.ai](https://contextportfolio.ai), and the vision for MCP-served personal context. The foundation was already there. This fork builds the multi-user server layer, the redaction system, and the write-back pipeline on top of it.

MCP SDK wiring patterns and the change history tracking concept were informed by [mikhashev/pct-mcp-server](https://github.com/mikhashev/pct-mcp-server), an independent implementation that demonstrated a different approach to the same problem space.

### The Office — Disclaimer

*I really need people to read this part.*

The Dunder Mifflin demo profiles are fan-created content for educational and demonstration purposes. The Office is the property of NBC Universal. These profiles are not endorsed by, affiliated with, or connected to NBC Universal, Dells Media, or any associated entities. No copyrighted material from the show is reproduced — the profiles are original character interpretations written in the style of professional workplace documents.

If this causes a problem, please open an issue or contact the repo maintainer before sending lawyers. I've been through enough conflict mediation to know that a conversation is almost always better than a formal complaint. Although in my experience, people don't usually take that advice.

*— Toby Flenderson, Human Resources*
