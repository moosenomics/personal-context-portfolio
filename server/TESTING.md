# PCP MCP Server — Manual Testing Guide

## Prerequisites

```bash
cd server
npm install
npm run build
```

## Launching with MCP Inspector

```bash
PCP_USER_ID=michael-scott PCP_PORTFOLIOS_DIR=../portfolios npx @modelcontextprotocol/inspector tsx src/index.ts
```

Change `PCP_USER_ID` to test as different users. MCP Inspector opens a browser UI listing all registered tools and resources.

---

## Test Scenarios

### 1. Michael Scott — Own Portfolio Redaction

**User:** `PCP_USER_ID=michael-scott`
**Tool:** `get_my_portfolio`
**Expected:** The "Regional Manager Succession Planning Initiative" section in current-projects.md does NOT appear. The "Personal Development — Martial Arts and Wilderness Survival Training" section also does NOT appear. Both are `exclude: michael-scott` blocks planted by Dwight.

### 2. Jim Halpert — Cross-Person Read (Succession Plan Visible)

**User:** `PCP_USER_ID=jim-halpert`
**Tool:** `get_portfolio_file` with `person_id: michael-scott`, `file_name: current-projects`
**Expected:** The "Regional Manager Succession Planning Initiative" section IS visible — Jim is not in the exclude list.

### 3. Jim Halpert — Dwight's Fake Expertise Visible

**User:** `PCP_USER_ID=jim-halpert`
**Tool:** `get_portfolio_file` with `person_id: dwight-schrute`, `file_name: domain-knowledge`
**Expected:** The fake expertise entries (French Impressionist art, marine mammal psychology, interpretive dance therapy) ARE visible — Jim planted them and they're only excluded from Dwight.

### 4. Dwight Schrute — Own Domain Knowledge Redaction

**User:** `PCP_USER_ID=dwight-schrute`
**Tool:** `get_my_portfolio_file` with `file_name: domain-knowledge`
**Expected:** The fake expertise entries (French Impressionist art, marine mammal psychology, interpretive dance therapy) are NOT visible — they're in an `exclude: dwight-schrute` block.

### 5. Angela Martin — Party Planning Committee Content

**User:** `PCP_USER_ID=angela-martin`
**Tool:** `get_my_portfolio_file` with relevant files
**Expected:** Any Party Planning Committee content is visible to Angela (she has the `party-planning-committee` role tag).

### 6. Kevin Malone — Angela's Accounting Content with Nested Exclusion

**User:** `PCP_USER_ID=kevin-malone`
**Tool:** `get_portfolio_file` with `person_id: angela-martin`
**Expected:** Accounting-role content is visible (if Kevin has the `accounting` role). Any `exclude: kevin-malone` nested blocks within accounting-gated sections are hidden.

### 7. Michael Scott — View-As Jim (Intersection)

**User:** `PCP_USER_ID=michael-scott`
**Tool:** `view_portfolio_as` with `person_id: michael-scott`, `viewer_person_id: jim-halpert`
**Expected:**
- Toby warning about intersection behavior appears at the top
- The succession plan does NOT appear — even though Jim can see it, Michael's own access filters it out (intersection of both access levels)

### 8. Org Index — All 14 People

**User:** Any
**Tool:** `get_org_index`
**Expected:** Markdown table with all 14 people, their names, roles, and person-ids. No missing entries.

### 9. List People — All 14 IDs

**User:** Any
**Tool:** `list_people`
**Expected:** All 14 person-ids returned with display names.

### 10. Invalid Person ID — Dwight Error

**User:** Any
**Tool:** `get_portfolio_file` with `person_id: nobody-here`, `file_name: identity`
**Expected:** Dwight Schrute error message with list of valid person-ids. Signed "— D. K. Schrute, Security Task Force".

### 11. Get My Roles — Correct Tags

**User:** `PCP_USER_ID=michael-scott`
**Tool:** `get_my_roles`
**Expected:** Tags include `leadership`, `sales`, and `michael-scott` (implicit person-id tag).

### 12. Creed Bratton — Self-Only Content Visibility

**User:** `PCP_USER_ID=creed-bratton`
**Tool:** `get_my_portfolio_file` with files containing `include: creed-bratton` blocks
**Expected:** Creed-only include blocks ARE visible when running as Creed. Switch to another user (e.g., `PCP_USER_ID=jim-halpert`) and verify those same sections are NOT visible.

---

## Resource Testing

In MCP Inspector, navigate to the Resources tab:

1. **Portfolio file resources:** Verify `pcp://portfolios/{personId}/{fileName}` resources are listed for all people and files. Reading a resource applies redaction based on the current user.
2. **Org index resource:** Verify `pcp://org-index` returns the same content as the `get_org_index` tool.

---

## Validation Testing

Check stderr output when starting the server. It should show:
- `[PCP] Validating portfolios at ...`
- `[PCP] Found 14 people`
- Any warnings about missing files or unmatched markers
- `[PCP] Validation complete: 14 people, N warnings`
- `[PCP] Server running as {userId}`

To test validation warnings, temporarily rename a canonical file and restart the server.
