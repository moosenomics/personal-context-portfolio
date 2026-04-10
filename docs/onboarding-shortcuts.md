# Onboarding Shortcuts

*Jim Halpert, Sales. The server handles a few things automatically so you don't have to. Here's what they are.*

---

## Numbered Prefix Stripping

[contextportfolio.ai](https://contextportfolio.ai) exports files as `01-identity.md`, `02-role-and-responsibilities.md`, etc. The server expects `identity.md`, `role-and-responsibilities.md`, and so on.

At startup, the server scans every portfolio directory and renames numbered-prefix files to their canonical names. It's a one-time migration per file — once renamed, it doesn't touch them again.

So just drop your files in as-is. Don't rename them yourself.

## Auto API Key Generation

When the server starts in HTTP mode, it checks every directory in `portfolios/` against the existing API keys. New directories without a key get one auto-generated: `dm-{person-id}`. It's written to `server/config/api-keys.json`.

You don't need to manually register yourself. Create your folder, restart (or wait for the next deploy), and your key exists.

## Auto `_roles.md` Generation

If a portfolio directory doesn't have a `_roles.md` file, the server generates a starter template at startup with the person's implicit person tag pre-populated. You can edit it later to add role tags — the auto-generated version just makes sure the file exists so the redaction system has something to work with.

## What This Means

Drop your [contextportfolio.ai](https://contextportfolio.ai) files into a folder named with your person-id. That's it. The server handles the renaming, generates your API key, and creates your roles file. Connect with your platform's guide ([Claude](connect/claude.md) · [ChatGPT](connect/chatgpt.md) · [Gemini](connect/gemini.md)) and you're in.

*Honestly, this whole section could have been one sentence: "Drop your files in and it works." But I was told documentation needs to explain the why. — Jim*
