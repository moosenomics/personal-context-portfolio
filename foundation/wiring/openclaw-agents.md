# Wiring: Connect Your Portfolio to OpenClaw Agents

## What This Does

OpenClaw agents can read files from connected data sources. By connecting your portfolio to OpenClaw, every agent you build can access your context — your role, your projects, your communication style — and use it to produce better, more personalized output.

## How It Works

OpenClaw agents access external data through skills and connected data sources. Your portfolio files can be made available as a data source that any agent can read from.

**Option 1: Local files**

If your OpenClaw instance runs locally and your portfolio is a folder on the same machine, point your agents at the directory. In your agent's configuration or SOUL.md, reference the portfolio location and instruct the agent to read relevant files at the start of its workflow.

**Option 2: Via MCP**

If you've already exposed your portfolio as an MCP resource (see `mcp-resource.md`), connect OpenClaw to that MCP server. Your agents access the portfolio through the MCP connection.

**Option 3: Embedded in the agent**

For a quick approach, paste the relevant portfolio files directly into your agent's SOUL.md or system instructions. Less elegant but it works immediately. Best for agents that only need one or two files of context.

## Which Files for Which Agents

**Morning briefing agent:** `identity.md`, `current-projects.md`, `goals-and-priorities.md` — so it knows what to prioritize in the briefing.

**Meeting prep agent:** `team-and-relationships.md`, `current-projects.md` — so it knows who you're meeting with and what you're working on together.

**Competitor monitor agent:** `identity.md`, `domain-knowledge.md` — so it knows your industry context and what matters to flag.

**Content production agent:** `communication-style.md`, `domain-knowledge.md` — so it writes in your voice and at your knowledge level.

**Inbox triage agent:** `preferences-and-constraints.md`, `current-projects.md`, `team-and-relationships.md` — so it knows what's urgent, what's relevant, and who matters.

## Tips

- Don't dump all ten files into every agent. Each file adds to the context the agent processes, and not all of it is relevant. Be selective.
- Reference files by name in your agent's instructions: "Before producing the briefing, read `current-projects.md` for my active workstreams and prioritize accordingly."
- When you update your portfolio files, every agent that reads them gets the updated context automatically (if using the file or MCP approach, not the embedded approach).
- The portfolio is context, not instructions. Your agent's SOUL.md or system prompt still defines what the agent does. The portfolio defines who it's doing it for.
