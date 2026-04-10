# Tools & Systems

## Moose's Personal Stack
- **Claude.ai (Opus)** — Architect and thought partner. This is where strategy happens, specs get written, and decisions get pressure-tested. He treats Claude as a peer, not an assistant.
- **Claude Code** — Builder. Primary development tool for all coding work. Moose writes specs in Claude.ai, hands them to Claude Code, and reviews what comes back.
- **VS Code** — Code editor. The environment Claude Code operates in.
- **GitHub** — Repos for Wade, PCP MCP server, and other projects. Handle: moosenomics.

## Company Technology Stack (Microsoft-heavy)
- **Microsoft Teams** — Communication and collaboration. Planned as the unified entry point for cross-system AI queries.
- **Microsoft Dynamics CRM** — Customer relationship management.
- **Microsoft Azure** — Cloud infrastructure.
- **Infor CloudSuite Distribution** — ERP system. Source of truth for transactional data, but the APIs are a horror show: poorly documented, archaic tables, complex joins, business logic calculations buried in unexposed layers. Migrated from on-premise Infor SX.Enterprise.
- **Birst** — Analytics and business intelligence.
- **Power BI** — Reporting. Currently the most promising clean data access path (vs. fighting Infor directly).
- **TWL** — Warehouse management system.

## Ecommerce Platform
- **Live site:** Drupal + Drupal Commerce, rebuilt by an external agency after the ERP migration.
- **Original platform:** Custom .NET MVC C#, SQL, LINQ — built by Moose starting in 2004 with zero programming experience.
- **Data architecture:** MySQL product knowledge graph (strict taxonomy, compatibility mappings, BOM resolution) + ERP REST API for transactional data (pricing, inventory, orders).
- **Four branches** across the Twin Cities metro and greater Minnesota.

## Development Technologies (Current Projects)
- Python (Birst analytics CLI)
- ASP.NET Core (ServiceTitan integration)
- TypeScript / Node.js (MCP servers)
- OAuth2, Zod, MCP SDK
- MySQL, SQL
- Stripe (Fantasy National Golf Club — historical)

## What Moose Built (Historical, Still in Use)
- **Product Knowledge Graph** — strict taxonomy ("animal kingdom philosophy"), required attributes by category, verified compatible product mappings, BOM with supersession chain resolution, AHRI system matchups, SKU-level product documents. The abstractions have survived 20 years; the systems reading/writing to them have changed multiple times.
- **Ecommerce Platform** — reduced call volume for stock checks, order status, pricing, product compatibility, and order entry errors.
- **Product Management Software** — Silverlight with SQL backend. Scaled product information collection across the organization.
