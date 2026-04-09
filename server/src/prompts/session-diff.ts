export function buildSessionDiffPromptText(
  portfolio: Map<string, string>
): string {
  const portfolioSections: string[] = [];
  for (const [fileName, content] of portfolio) {
    portfolioSections.push(`### ${fileName}\n\n${content}`);
  }

  return `## Session Profile Review

You are about to review this conversation and harvest profile-relevant updates. Below is the user's current portfolio. Compare what was discussed in this conversation against this current state.

---

## Current Portfolio

${portfolioSections.join("\n\n---\n\n")}

---

## Your Task

### Step 1: Harvest
Review the ENTIRE conversation above this prompt. Identify specific, concrete information that is profile-relevant. Look for:
- New projects started or project status changes
- Completed projects or milestones
- New tools, technologies, or systems adopted
- Relationship changes (new team members, role changes in the team)
- Decisions made with context and reasoning
- Priority shifts or new goals
- New expertise or learning areas
- Updated constraints or preferences
- Changes to role or responsibilities

**Skip:** Vague observations ("had a good meeting"), small talk, transient details (one-time requests, ephemeral tasks), and anything already captured in the current portfolio above.

### Step 2: Present the Harvest
Show the user a numbered list of proposed observations. Each item should be one clear sentence describing what was learned. For example:

1. Started using Terraform for infrastructure provisioning, replacing manual CloudFormation templates
2. Completed the Q1 API migration project — all endpoints moved to v3
3. New team member Sarah Chen joined as a frontend developer, reporting to Jim

Let the user review this list. They can:
- **Approve** the list as-is
- **Edit** individual items for accuracy
- **Add** items you missed
- **Remove** items they don't want saved

### Step 3: Submit
After the user approves, call the \`submit_profile_updates\` tool with the approved observations.

If any observations contain sensitive information (opinions about colleagues, career ambitions, compensation, personal health details), suggest adding a \`visibility\` field to the tool call with appropriate \`exclude\` or \`include\` scoping. Explain to the user why you're suggesting redaction and who would be excluded.

### Step 4: Report What Landed
After the tool returns, show the user:
- What was stored, organized by file
- Any observations that were skipped by the normalization engine, and why
- If visibility/redaction was applied, explain what's hidden from whom

Be thorough in your harvest but respect the user's final say on what gets saved.`;
}
