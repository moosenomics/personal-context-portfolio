interface ScopeFrame {
  type: "include" | "exclude";
  tags: string[];
  userInScope: boolean;
}

const INCLUDE_OPEN = /^<!--\s*@@\s*include:\s*(.+?)\s*-->$/;
const EXCLUDE_OPEN = /^<!--\s*@@\s*exclude:\s*(.+?)\s*-->$/;
const INCLUDE_CLOSE = /^<!--\s*@@\s*end\s+include\s*-->$/;
const EXCLUDE_CLOSE = /^<!--\s*@@\s*end\s+exclude\s*-->$/;

function parseTags(raw: string): string[] {
  // Strip everything after | (created-by metadata)
  const beforePipe = raw.split("|")[0];
  return beforePipe.split(",").map((t) => t.trim()).filter(Boolean);
}

function isInScope(stack: ScopeFrame[]): boolean {
  return stack.every((frame) => frame.userInScope);
}

export function applyRedaction(content: string, userTags: string[]): string {
  const lines = content.split("\n");
  const stack: ScopeFrame[] = [];
  const output: string[] = [];
  let firstHeading: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Capture the first heading for empty-result fallback
    if (firstHeading === null && /^#\s+/.test(trimmed)) {
      firstHeading = line;
    }

    // Check for opening include marker
    const includeMatch = trimmed.match(INCLUDE_OPEN);
    if (includeMatch) {
      const tags = parseTags(includeMatch[1]);
      const userInScope = userTags.some((ut) => tags.includes(ut));
      stack.push({ type: "include", tags, userInScope });
      continue; // Strip marker
    }

    // Check for opening exclude marker
    const excludeMatch = trimmed.match(EXCLUDE_OPEN);
    if (excludeMatch) {
      const tags = parseTags(excludeMatch[1]);
      const userInScope = !userTags.some((ut) => tags.includes(ut));
      stack.push({ type: "exclude", tags, userInScope });
      continue; // Strip marker
    }

    // Check for closing include marker
    if (INCLUDE_CLOSE.test(trimmed)) {
      // Pop the most recent include frame
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].type === "include") {
          stack.splice(i, 1);
          break;
        }
      }
      continue; // Strip marker
    }

    // Check for closing exclude marker
    if (EXCLUDE_CLOSE.test(trimmed)) {
      // Pop the most recent exclude frame
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].type === "exclude") {
          stack.splice(i, 1);
          break;
        }
      }
      continue; // Strip marker
    }

    // Content line — include only if in scope at every level
    if (isInScope(stack)) {
      output.push(line);
    }
  }

  // If everything was redacted, return just the first heading
  const result = output.join("\n").trim();
  if (result === "" && firstHeading) {
    return firstHeading;
  }

  return output.join("\n");
}
