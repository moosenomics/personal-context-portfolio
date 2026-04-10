# Connecting with Gemini

*Pam here. Gemini has a few different connection paths depending on where you're working — terminal, IDE, or Android Studio. Pick the one that fits. — Pam*

---

## Method 1: Gemini CLI (Terminal Chat)

The Gemini CLI is the most direct way to connect. It supports both Streamable HTTP and SSE transports.

### Setup

1. **Install the CLI:**
   ```bash
   npm install -g @google/gemini-cli
   ```

2. **Add the remote server:**

   For Streamable HTTP:
   ```bash
   gemini mcp add my-portfolio --transport http "https://personal-context-portfolio-production.up.railway.app/mcp?api_key=YOUR_KEY"
   ```

   For SSE:
   ```bash
   gemini mcp add my-portfolio --transport sse "https://personal-context-portfolio-production.up.railway.app/sse?api_key=YOUR_KEY"
   ```

   Replace `YOUR_KEY` with your API key (e.g., `dm-michael-scott`).

3. **Verify connection:**
   ```bash
   gemini chat
   ```
   Inside the chat, type `/mcp` to see available tools.

---

## Method 2: Gemini Code Assist (VS Code / IntelliJ)

Connect your portfolio context to Gemini's Agent Mode in your IDE.

### Setup

1. **Open your Gemini settings file** at `~/.gemini/settings.json`.

2. **Add the remote server:**
   ```json
   {
     "mcpServers": {
       "portfolio": {
         "httpUrl": "https://personal-context-portfolio-production.up.railway.app/mcp?api_key=YOUR_KEY",
         "timeout": 60000
       }
     }
   }
   ```

3. **Activate Agent Mode:** Open the Gemini chat panel in your IDE and switch to the **Agent** tab. Gemini will automatically discover the tools from your remote server.

---

## Method 3: Android Studio (Ladybug+)

1. Navigate to **File → Settings → Tools → AI → MCP Servers** (on macOS: **Android Studio → Settings**).
2. Check the box for **Enable MCP Servers**.
3. Paste your MCP configuration (same JSON format as Method 2) into the configuration field.
4. In the Android Studio AI chat, type `/mcp` to verify the connection.

---

## Troubleshooting

- **Connection timeout:** Remote servers on Railway may cold-start after inactivity. Set the timeout to `60000` (60 seconds) in your config to account for this.
- **Auth errors:** Verify the API key format: `dm-{person-id}` (e.g., `dm-michael-scott`).
- **Tools not discovered:** In Code Assist, make sure you're in the **Agent** tab, not the standard chat tab. In the CLI, run `/mcp` to check server status.

<!-- VERIFY: Gemini CLI install command, settings.json path, and /mcp command should be confirmed against current Gemini docs before shipping. Source: Gemini's own output from a live session, April 2026. -->
