# Current Projects

## 1. Connecting AI to Internal Data (Primary Objective)
**What:** Establishing AI access to the company's internal databases and repositories — the foundational prerequisite for everything else.
**Status:** In progress — actively exploring access paths.
**Why it matters:** Nothing else works until the AI can see the data. Every other project is downstream of this.
**Challenge:** The ERP system is the source of truth, but its APIs are poorly documented, tables are archaic with complex joins, and business logic calculations aren't exposed. Moose is pursuing BI reporting data as a cleaner alternative path — the data's already been cleaned, it's just in a different access layer.

## 2. System/Process Documentation → AI-Readable Formats
**What:** Converting existing system and process documentation into formats AI tools can consume.
**Status:** In progress — working with the IT/purchasing team to understand what exists and design the conversion approach.
**Why it matters:** The knowledge already exists in documented form. Converting it respects work already done and gets to AI-readable state faster than rebuilding from scratch.

## 3. MCP Server — Product Knowledge Graph
**What:** Exposing the company's product knowledge graph (BOM supersession chains, AHRI matchups, verified compatibility mappings, account-scoped pricing) as contractor-facing tools via a Model Context Protocol server.
**Status:** Blocked — waiting on access to ecommerce site source code from external web agency.
**Why it matters:** The product knowledge graph is the company's competitive moat. The MCP strategy turns it into an externally accessible capability for contractor AI platforms like ServiceTitan and Bluon. Build the durable layer, not the point integration.
**Architecture:** Extract and reimplement existing business logic cleanly. Target stack: MySQL database + ERP REST API feeding MCP tools directly. No dependency on the current web framework.

## 4. Birst Analytics Pipeline
**What:** Multi-layer AI-powered data query framework. Python CLI traverses the BI catalog, extracts/normalizes queries, produces a structured registry. Deterministic routing with LLM strictly as intent normalizer — the LLM interprets, it never generates queries.
**Status:** In progress.

## 5. ServiceTitan Integration Middleware
**What:** ASP.NET Core API connecting ServiceTitan (contractor platform) to the ERP via OAuth2.
**Status:** In progress — becomes a thin adapter on top of the MCP server once that's built.

## 6. Getting the Leadership Team into AI — Personal Context Portfolios
**What:** Moose presented personal context portfolios to the 9-person leadership team and assigned everyone to create theirs. The idea: each person builds a structured profile of how they work, think, decide, and communicate — then AI tools read it and actually understand who they're talking to. Moose discovered the concept through a podcast, tested it himself, and within days had designed a full MCP server to host the profiles centrally and keep them current.
**Status:** Active. The leadership team was assigned to create their profiles at contextportfolio.ai during the April 7 L10 meeting. Moose is simultaneously building the infrastructure to serve those profiles — a standalone MCP server with role-based redaction (so people control what their AI shares with whom) and a write-back layer (so profiles stay current through normal AI conversations rather than manual updates).
**Why it matters:** This is the front door to AI adoption for the leadership team. It's not "here's a tool, figure it out." It's "your AI assistant now knows who you are, how you work, and what you care about." The portfolio is what makes the AI feel like a colleague rather than a stranger. And the infrastructure Moose is building ensures the profiles are living documents, not one-time questionnaires that go stale.
**The bigger picture:** The PCP MCP server is also a public project — shipping with a demo org (14 Dunder Mifflin characters with functional redaction markers) so people can explore the concept before building their own. Nobody else has built a multi-user personal context MCP server with structured write-back. Moose is first to market.
**Relationship to other projects:** Independent from but complementary to the organizational execution platform (Wade), which will eventually connect as an MCP client to read participant profiles during meetings.

## 7. Wade — Organizational Execution Platform
**What:** AI-powered platform for running the company's weekly leadership meetings, tracking issues, managing metrics. EOS framework with generic primitives for flexibility.
**Status:** Active side project. Complementary to the data infrastructure as the consumption layer.
**Priority:** Hours per week, not days. The data infrastructure (projects 1–5) is the primary focus.

## 8. Fantasy National Golf Club (Exited)
**What:** DFS golf analytics platform with Stripe subscription model.
**Status:** Complete. Sold to SportsHub Games Network → acquired by Betsperts Media & Technology Group in 2025.
**Why it's listed:** Same pattern as everything else — personal frustration → rigorous data solution → value compounded beyond the original problem. Also the reason he has a Twitter following (@TheMoosenomics) and an instinct for community building around data products.
