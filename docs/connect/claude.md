# Connecting with Claude

*Pam here. Claude.ai is how we tested most of this, so these instructions are pretty well road-tested. — Pam*

---

## Claude.ai (Web)

Claude.ai connects to remote MCP servers through its Connectors feature.

### Setup

1. Go to **Settings → Connectors → Add Custom Connector**.
2. Enter the server URL with your API key as a query parameter:
   ```
   https://personal-context-portfolio-production.up.railway.app/mcp?api_key=dm-michael-scott
   ```
3. Save the connector.

Claude.ai doesn't support Bearer token auth headers on custom connectors without OAuth — that's why the API key goes in the URL. It works fine, it's just not how you'd do it in production. See [Scope & Limitations](../scope-and-limitations.md) for more on auth.

### Verify It Works

Start a new conversation and ask: *"What tools do you have access to?"*

You should see tools like `get_my_portfolio`, `get_org_index`, and `update_my_profile` in the response. If you see them, you're connected.

Then try: *"What are my current projects?"*

### Important: Use Incognito Mode

Use incognito mode or a separate browser profile — even if you're connecting with your own portfolio. The server has 14 Dunder Mifflin characters on it, and Claude will accumulate context from the org that bleeds into your real conversations. See [Before You Start](../before-you-start.md) for the full explanation.

### Switching Characters

To try a different character, remove the current connector and add a new one with the other character's API key. Only run one connector at a time when testing different personas.

### Troubleshooting

- **No tools showing up:** Make sure the connector is active (check Settings → Connectors). Try starting a new conversation — connectors sometimes don't take effect in existing chats.
- **Auth errors:** Double-check the API key in the URL. The format is `dm-{person-id}` (e.g., `dm-michael-scott`, `dm-jim-halpert`).
- **Stale responses:** The server reads files fresh on every request — there's no caching. If you're seeing old data, the issue is likely on the client side. Start a new conversation.
- **Connection timeout:** The Railway server may cold-start if it's been idle. Give it 10-15 seconds and try again.
