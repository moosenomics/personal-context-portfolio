# Wiring: Use Your Portfolio in Claude Projects

## What This Does

Claude Projects let you attach files that persist across every conversation in that project. By adding your portfolio files to a project, every conversation in that project starts with Claude already knowing who you are, how you work, and what you're working on.

This is the simplest wiring option — no setup, no servers, no configuration. Just upload files.

## How It Works

1. Create a new Claude Project (or open an existing one)
2. Add your portfolio files to the project's knowledge base
3. Every conversation in that project now has access to your full context

## Which Files to Add

You don't have to add all ten. Match the files to the project's purpose:

**For a general work assistant project:** `identity.md`, `role-and-responsibilities.md`, `current-projects.md`, `communication-style.md`, `preferences-and-constraints.md`

**For a meeting prep project:** `identity.md`, `team-and-relationships.md`, `current-projects.md`

**For a writing project:** `identity.md`, `communication-style.md`, `domain-knowledge.md`

**For a strategic planning project:** `identity.md`, `goals-and-priorities.md`, `current-projects.md`, `decision-log.md`

**For a "knows everything about me" project:** All ten files.

## Tips

- Claude Projects have a knowledge base size limit. All ten portfolio files should be well within it, but if you're adding other documents too, prioritize the most relevant portfolio files.
- Add a project instruction that says something like: "You have access to my personal context portfolio. Use it to inform your responses but don't reference it explicitly unless I ask. Just know me." This keeps the context active without Claude narrating what it knows.
- When you update a portfolio file (projects change, priorities shift), update the version in your Claude Project too. Stale context is worse than no context.
- You can use different subsets of files for different projects. Your writing assistant doesn't need your decision log. Your strategic advisor doesn't need your tools inventory.

## Limitations

- Files in Claude Projects are static uploads. If you want automatic updates when your portfolio changes, use the MCP approach instead.
- Each Claude Project is separate. If you have five projects, you'd need to add your files to each one individually.
- This only works with Claude. For other AI tools, see the other wiring guides.
