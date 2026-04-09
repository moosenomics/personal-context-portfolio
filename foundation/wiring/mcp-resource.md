# Wiring: Expose Your Portfolio as an MCP Resource

## What This Does

MCP (Model Context Protocol) lets AI tools access external data sources. By exposing your context portfolio as an MCP resource, any MCP-compatible tool can read your files on demand — the agent pulls what it needs rather than you deciding what to paste.

This is the most powerful wiring option because it makes your portfolio automatically available to any agent that supports MCP, without you copying and pasting anything.

## How It Works

Your portfolio is a folder of markdown files. An MCP server exposes that folder as a resource. Any MCP-compatible client (Claude Desktop, Claude Code, OpenClaw, etc.) connects to the server and can read any file in your portfolio.

## Basic Setup

**Option 1: Local MCP server (filesystem)**

If your portfolio lives on your local machine, use the MCP filesystem server to expose the directory.

1. Store your portfolio files in a dedicated folder (e.g., `~/context-portfolio/`)
2. Configure your MCP client to connect to the filesystem server pointing at that directory
3. Any connected AI tool can now read your portfolio files

The exact configuration depends on your MCP client. Check your tool's documentation for how to add an MCP filesystem resource.

**Option 2: Remote MCP server**

If you want your portfolio accessible from multiple devices or by remote agents, you'll need to serve it from a remote location — a cloud server, a GitHub repo exposed via MCP, or a custom MCP server.

This is a more involved setup. If you're building with Claude Code, you can ask it to help you build a simple MCP server that serves your portfolio files.

## Tips

- Start with the filesystem approach if you're just trying it out. You can move to remote later.
- You don't have to expose all ten files. Start with identity, role, and current projects — those three cover most use cases.
- Update the files in your folder and the MCP resource updates automatically. No redeployment needed.
- Consider access control if you're serving remotely. Your portfolio contains personal and professional information you may not want publicly accessible.

## What to Build Next

Once your portfolio is available via MCP, the natural next step is building agents that read specific files at the start of their workflow. A meeting prep agent that reads `team-and-relationships.md` and `current-projects.md`. A writing assistant that reads `communication-style.md`. A planning agent that reads `goals-and-priorities.md`. The portfolio becomes the context layer that every agent draws from.
