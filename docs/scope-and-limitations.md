# Scope & Limitations

*Ryan Howard. This section documents what we intentionally didn't build, and why. Every item here is a deliberate decision, not an oversight. I went to business school. I know the difference.*

---

## Authentication

The demo uses API keys passed as URL query parameters (`?api_key=dm-michael-scott`). This is a demo shortcut. Production deployments should use OAuth 2.1 with PKCE — the MCP spec supports it. We didn't build it because fictional characters don't need real auth, and zero-friction onboarding matters more than security theater on a proof of concept.

## Tag Governance

There's no admin UI for managing role tags. You edit `_roles.md` files directly. For 9-15 people, a text file is fine. For 500 people, you'd want a proper interface. We're at 15.

## Logging & Admin Dashboard

Change history exists — `_change-history.json` per person records every write-back operation. But there's no dashboard to view it. Read the files directly or build a viewer. The data's there; the UI isn't.

## Admin Interface

None. This is a server, not an application. Configuration is files and environment variables. If you need a settings page, this isn't that.

## Async Write-Back Staging

The architecture supports it — JSON arrives, gets queued, gets processed. The show-repo uses inline synchronous processing because the added complexity of a queue isn't worth it at this scale. Add the queue when you need a human review gate between submission and merge.

## Preview/Confirm on Writes

Write-back is one-step: observation in, normalized content merged. If something's wrong, submit a correction. A preview-and-confirm step is a good idea for production — we didn't build it because the current flow is sufficient for testing and demo purposes.

## Rate Limiting

None. Fifteen people on a Railway hobby plan don't need rate limiting. Add it when they do.

## Input Validation

The server-side LLM normalizer is the only gate on observation quality. It works well — enforces voice, density, template conformance — but it's not deterministic validation. Garbage in can still produce polished garbage out.

## Multi-Org

Single org per server instance. Want two orgs? Run two servers. Multi-tenancy is a different project.

## Backup & Restore

The server uses filesystem storage. Railway's filesystem is ephemeral — write-back changes persist until the next deploy, then reset. This is fine for a demo where the profiles are committed to the repo and redeployed fresh. It's not fine for production. Phase 2 uses Azure Blob Storage with proper persistence.

## Microsoft Copilot

Copilot supports MCP but requires enterprise paths — Copilot Studio, custom agents, admin approval. It's not the zero-friction "paste a URL and connect" model that Claude, ChatGPT, and Gemini offer. If your org runs Copilot, check [Microsoft's MCP documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-mcp-actions) for the current setup process.

---

*Every one of these is a Phase 2 problem. The ability to distinguish Phase 1 from Phase 2 is what separates strategy from feature creep.*

*— Ryan Howard, MBA*
