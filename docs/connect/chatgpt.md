# Connecting with ChatGPT

*Pam here. We tested this live and the read side works great. Write-back has one known issue — see below. — Pam*

---

## ChatGPT Web (Developer Mode)

ChatGPT connects to remote MCP servers through its Developer Mode connectors.

### Setup

1. Go to **Settings → Apps & Connectors** (you may need to look under Advanced settings).
2. Toggle on **Developer Mode** if it isn't already enabled.
3. Click **Create** to add a new app/connector.
4. Enter the MCP server URL with your API key:
   ```
   https://personal-context-portfolio-production.up.railway.app/mcp?api_key=dm-michael-scott
   ```
5. Select **No Authentication** (the API key is in the URL).
6. Save.
7. **Start a new chat** — the connector won't appear in existing conversations.

### Verify It Works

In a new chat, ask: *"What tools do you have access to?"*

You should see the portfolio tools listed. Then try: *"Show me the org index."*

### Known Limitation: Write-Back on identity.md

The write-back tools (`update_my_profile`, `submit_profile_updates`) work for most files, but updates targeting `identity.md` may fail with a "section not found" error. This happens because `identity.md` uses a single `#` heading with no `##` subsections, and the merge function is being updated to handle that structure. Updates routed to other files (which all have `##` subsections) work correctly.

This fix ships with this release. See [Architecture](../architecture.md) for how the write path works.

### Troubleshooting

- **Connector not appearing:** Make sure Developer Mode is enabled. Restart the browser if needed. Always start a new chat after adding a connector.
- **Auth errors:** Verify the API key format: `dm-{person-id}` (e.g., `dm-michael-scott`).
- **Tools not called automatically:** ChatGPT sometimes needs a nudge. Try being explicit: *"Use the get_org_index tool to show me who works here."*
- **Connection timeout:** Railway may cold-start after inactivity. Wait 10-15 seconds and retry.
