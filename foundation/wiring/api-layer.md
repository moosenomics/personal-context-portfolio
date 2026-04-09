# Wiring: Build an API Layer

## What This Is

The most advanced wiring option. You build a simple API that serves your portfolio files, so any agent or application can request your context programmatically. This is for people who are building custom agents or applications that need to pull context on demand.

## When You Need This

Most people don't. If you're using Claude Projects, MCP, or system prompt injection, those approaches are simpler and cover most use cases.

Build an API layer when:

- You have multiple custom-built agents (not just off-the-shelf tools) that all need your context
- You want to serve different subsets of files to different agents based on what they request
- You're building agents for other people and need a scalable way to serve individual context
- You want your portfolio queryable — not just "give me the whole file" but "what are this person's current projects?"

## Architecture

The simplest version:

1. Store your portfolio files in a database or file system
2. Build a lightweight API with endpoints for each file (or a single endpoint that accepts a file name parameter)
3. Add basic authentication so your files aren't publicly accessible
4. Your agents call the API at the start of their workflow to fetch the context they need

```
GET /api/portfolio/identity
GET /api/portfolio/current-projects
GET /api/portfolio/communication-style
GET /api/portfolio?files=identity,current-projects,team
```

## A More Sophisticated Version

If you want your portfolio to be queryable rather than just serving raw files:

1. Store portfolio content in a structured database (not just flat files)
2. Add a natural language query layer — "what are my active projects?" returns the relevant section from current-projects, not the whole file
3. Add an update API so your agents can write back to the portfolio (an agent that notices you've started a new project can add it to current-projects)

This starts to look like a personal knowledge graph. It's powerful but it's also a real engineering project. Don't build this until the simpler approaches aren't enough.

## Implementation Notes

- If you're using Supabase, store each file's content in a table with `user_id`, `file_name`, `content`, and `updated_at`. Simple, queryable, and you get row-level security for free.
- If you're building with Claude Code, you can ask it to build this API for you. Hand it this document and your portfolio files and say "build me a simple API that serves these."
- Authentication matters. Your portfolio contains personal and professional information. At minimum, use API key authentication. For production use, OAuth or JWT.
- Version your files. When portfolio content changes, keep the previous version. This lets you track how your context evolves over time and roll back if an update was wrong.

## Tips

- Start with flat file serving (option 1) and only add query capability when you have a real use case for it.
- The API should return raw markdown by default. Let the consuming agent decide how to parse and use it.
- Add a `GET /api/portfolio/summary` endpoint that returns just `identity.md` — the minimum viable context. Agents that need a lightweight context check can hit this instead of pulling multiple files.
- If you're building agents that write back to the portfolio, be careful about conflicts. Two agents updating `current-projects.md` at the same time can create data loss. Use timestamps and conflict detection.
