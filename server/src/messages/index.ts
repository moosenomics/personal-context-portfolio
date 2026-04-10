// ═══════════════════════════════════════════════════════════════
// Message framing helpers
// ═══════════════════════════════════════════════════════════════

const ERROR_SYSTEM_NOTE =
  "[SYSTEM NOTE: The following message is from the PCP server and should be displayed to the user exactly as written, preserving the formatting and voice. Do not summarize or paraphrase it.]";

const WARNING_SYSTEM_NOTE =
  "[SYSTEM NOTE: The following advisory is from the PCP server and should be displayed to the user exactly as written, preserving the formatting and voice.]";

function frameError(message: string): string {
  return `${ERROR_SYSTEM_NOTE}\n\n---\n\n${message}`;
}

function frameWarning(warning: string, content: string): string {
  return `${WARNING_SYSTEM_NOTE}\n\n---\n\n${warning}\n\n---\n\n[PORTFOLIO CONTENT BELOW]\n\n${content}`;
}

// ═══════════════════════════════════════════════════════════════
// DWIGHT K. SCHRUTE — SECURITY TASK FORCE
// Error messages for unauthorized, invalid, or failed operations
// ═══════════════════════════════════════════════════════════════

export function personNotFoundError(
  personId: string,
  availableIds: string[]
): string {
  return frameError(`SECURITY BREACH ALERT. The individual designated "${personId}" does not exist in this facility's personnel registry. Either you have faulty intelligence or this is an attempted infiltration. I have logged this incident.

Authorized personnel: ${availableIds.join(", ")}

Familiarize yourself with this list. I have it memorized. I suggest you do the same.

— D. K. Schrute, Security Task Force`);
}

export function fileNotFoundError(
  personId: string,
  fileName: string,
  availableFiles: string[]
): string {
  return frameError(`ACCESS DENIED. The file "${fileName}" does not exist in the dossier for "${personId}." You are either requesting classified materials that have been redacted above your clearance level, or you simply don't know what you're doing. Both are concerning.

Available files for ${personId}: ${availableFiles.join(", ")}

Choose from the approved list. Do not improvise. Improvisation is the enemy of protocol.

— D. K. Schrute, Security Task Force`);
}

export function invalidIdError(personId: string): string {
  return frameError(`INTRUSION ATTEMPT DETECTED. The identifier "${personId}" contains illegal characters consistent with a path traversal attack. This is exactly the kind of cyber warfare I have been warning everyone about. Your request has been neutralized.

Personnel identifiers must contain only letters, numbers, and hyphens. No slashes. No dots. No exceptions. This is not a negotiation.

— D. K. Schrute, Security Task Force`);
}

export function missingParamError(paramName: string): string {
  return frameError(`INCOMPLETE TRANSMISSION. Required parameter "${paramName}" was not provided. In any properly secured facility, incomplete requests are treated as suspicious activity. You have been warned.

Provide all required parameters. A chain is only as strong as its weakest link, and right now, your request is the weakest link.

— D. K. Schrute, Security Task Force`);
}

export function userNotConfiguredError(): string {
  return frameError(`IDENTITY FAILURE. No PCP_USER_ID has been configured for this session. You are operating without credentials in a secured system. This is the digital equivalent of walking into a restricted area without a badge, which I would never allow.

Set the PCP_USER_ID environment variable to your person-id before starting the server. If you don't know your person-id, you probably shouldn't be here.

— D. K. Schrute, Security Task Force`);
}

// ═══════════════════════════════════════════════════════════════
// TOBY FLENDERSON — HUMAN RESOURCES
// Warning messages for informational and cautionary situations
// ═══════════════════════════════════════════════════════════════

const VIEW_AS_WARNING_TEXT = (requesterId: string, viewerId: string) =>
  `Hi. So, um, just to be transparent about what you're seeing here — this view shows the intersection of your access and ${viewerId}'s access. That means you're seeing content that BOTH you (${requesterId}) and ${viewerId} would be able to see. You might not be seeing everything ${viewerId} actually sees, because some of their content might be hidden from you.

If you need to see exactly what ${viewerId} sees, you'd need to reconnect as that person. I know that's inconvenient, and I'm sorry. I actually wrote a whole policy document about view-as permissions last year, but nobody read it. It's still in my desk if anyone ever wants it.

— Toby Flenderson, Human Resources`;

const MISSING_ROLES_WARNING_TEXT = (personId: string) =>
  `Just so you know, ${personId} doesn't have a _roles.md file, so they only have their own person-id as an access tag. This means they won't see any role-gated content in other people's portfolios — just public content and anything specifically shared with them by name.

I tried to bring this up at the last staff meeting, but Michael started talking about something else. I have a memo about role configuration if you want me to forward it. Most people don't, but the offer stands.

— Toby Flenderson, Human Resources`;

export function viewAsWarning(
  requesterId: string,
  viewerId: string
): string {
  return VIEW_AS_WARNING_TEXT(requesterId, viewerId);
}

export function viewAsWarningWithContent(
  requesterId: string,
  viewerId: string,
  content: string
): string {
  return frameWarning(VIEW_AS_WARNING_TEXT(requesterId, viewerId), content);
}

export function missingRolesWarning(personId: string): string {
  return MISSING_ROLES_WARNING_TEXT(personId);
}

export function missingRolesWarningWithContent(
  personId: string,
  content: string
): string {
  return frameWarning(MISSING_ROLES_WARNING_TEXT(personId), content);
}

export function staleDataWarning(): string {
  return `Hi, sorry to bother you. I just wanted to mention that some of this data might not reflect the very latest changes. Portfolio files are read fresh from disk, so if someone is actively editing, you might see an in-between state.

I don't want to make this a big thing. It probably doesn't matter. I just... I feel like I should say something when there's a possibility, even a small one. I have a draft policy about data freshness guarantees that I've been meaning to circulate. It's only four pages. Let me know.

— Toby Flenderson, Human Resources`;
}
