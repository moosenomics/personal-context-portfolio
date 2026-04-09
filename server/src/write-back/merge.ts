import type { NormalizationUpdate } from "../llm/types.js";

/**
 * Parsed section from a raw markdown file.
 * Includes any redaction markers that wrap the section.
 */
interface RawSection {
  /** The heading line (e.g., "## Project Name") or null for content before the first heading */
  heading: string | null;
  /** Full raw lines of this section including redaction markers and content */
  lines: string[];
}

const HEADING_RE = /^##\s+/;
const INCLUDE_OPEN = /^<!--\s*@@\s*include:\s*(.+?)\s*-->$/;
const EXCLUDE_OPEN = /^<!--\s*@@\s*exclude:\s*(.+?)\s*-->$/;
const INCLUDE_CLOSE = /^<!--\s*@@\s*end\s+include\s*-->$/;
const EXCLUDE_CLOSE = /^<!--\s*@@\s*end\s+exclude\s*-->$/;

/**
 * Parse a raw markdown file into sections split on ## headings.
 * ### sub-headings are part of their parent ## section.
 * Content before the first ## heading is its own section with heading=null.
 */
function parseSections(raw: string): RawSection[] {
  const lines = raw.split("\n");
  const sections: RawSection[] = [];
  let current: RawSection = { heading: null, lines: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    // Only split on ## headings (not ### or deeper)
    if (HEADING_RE.test(trimmed) && !trimmed.startsWith("### ")) {
      if (current.lines.length > 0 || current.heading !== null) {
        sections.push(current);
      }
      current = { heading: trimmed, lines: [line] };
    } else {
      current.lines.push(line);
    }
  }

  // Push the last section
  if (current.lines.length > 0 || current.heading !== null) {
    sections.push(current);
  }

  return sections;
}

/**
 * Check if a section heading is hidden from a user based on redaction markers.
 * A section is hidden if it's entirely within a redaction block that excludes the user.
 */
function isSectionHiddenFromUser(
  sectionLines: string[],
  userTags: string[]
): boolean {
  // Check if the section starts with an exclude marker that covers the user
  for (const line of sectionLines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const excludeMatch = trimmed.match(EXCLUDE_OPEN);
    if (excludeMatch) {
      const tags = excludeMatch[1]
        .split("|")[0]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return userTags.some((ut) => tags.includes(ut));
    }

    const includeMatch = trimmed.match(INCLUDE_OPEN);
    if (includeMatch) {
      const tags = includeMatch[1]
        .split("|")[0]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return !userTags.some((ut) => tags.includes(ut));
    }

    // First non-empty, non-heading line is not a marker — section is public
    break;
  }
  return false;
}

/**
 * Wrap content in redaction markers.
 */
function wrapWithVisibility(
  content: string,
  visibility: { include?: string[]; exclude?: string[] }
): string {
  if (visibility.exclude && visibility.exclude.length > 0) {
    return `<!-- @@ exclude: ${visibility.exclude.join(", ")} -->\n\n${content}\n\n<!-- @@ end exclude -->`;
  }
  if (visibility.include && visibility.include.length > 0) {
    return `<!-- @@ include: ${visibility.include.join(", ")} -->\n\n${content}\n\n<!-- @@ end include -->`;
  }
  return content;
}

export interface MergeResult {
  /** The merged file content */
  content: string;
  /** The previous content of the affected section (empty for add/append) */
  previousContent: string;
  /** Whether the merge was successful */
  success: boolean;
  /** Warning message if something went wrong but didn't fully fail */
  warning?: string;
}

/**
 * Apply a single update to a raw file, preserving redacted blocks.
 */
export function mergeUpdate(
  rawFileContent: string,
  update: NormalizationUpdate,
  userTags: string[],
  visibility: { include?: string[]; exclude?: string[] } | null
): MergeResult {
  const sections = parseSections(rawFileContent);

  if (update.action === "append") {
    // Append to end of file
    const newContent = visibility
      ? wrapWithVisibility(update.content, visibility)
      : update.content;

    const merged = rawFileContent.trimEnd() + "\n\n" + newContent + "\n";
    return {
      content: merged,
      previousContent: "",
      success: true,
    };
  }

  if (update.action === "add") {
    // Add a new section at the end of the file (before trailing whitespace)
    let newSection = `${update.section}\n\n${update.content}`;
    if (visibility) {
      newSection = `${update.section}\n\n${wrapWithVisibility(update.content, visibility)}`;
    }

    const merged = rawFileContent.trimEnd() + "\n\n" + newSection + "\n";
    return {
      content: merged,
      previousContent: "",
      success: true,
    };
  }

  // action === "replace"
  if (!update.section) {
    return {
      content: rawFileContent,
      previousContent: "",
      success: false,
      warning: `Replace action requires a section heading, but none was provided for file ${update.file}`,
    };
  }

  // Find the section to replace
  const targetHeading = update.section.trim();
  const sectionIndex = sections.findIndex(
    (s) => s.heading?.trim() === targetHeading
  );

  if (sectionIndex === -1) {
    return {
      content: rawFileContent,
      previousContent: "",
      success: false,
      warning: `Section "${update.section}" not found in ${update.file}. Skipping this update.`,
    };
  }

  const targetSection = sections[sectionIndex];

  // Guard: don't replace sections hidden from this user
  if (isSectionHiddenFromUser(targetSection.lines, userTags)) {
    return {
      content: rawFileContent,
      previousContent: "",
      success: false,
      warning: `Section "${update.section}" is hidden from the current user. Cannot replace.`,
    };
  }

  // Extract previous content (lines after heading, excluding redaction markers at section level)
  const previousLines = targetSection.lines.slice(1); // skip heading line
  const previousContent = previousLines.join("\n").trim();

  // Build replacement: keep the heading, replace the body
  // Preserve any redaction markers that wrap the section
  const headingLine = targetSection.lines[0];
  let newBody = update.content;
  if (visibility) {
    newBody = wrapWithVisibility(update.content, visibility);
  }

  // Rebuild sections
  const newSectionLines = [headingLine, "", newBody];
  sections[sectionIndex] = {
    heading: targetSection.heading,
    lines: newSectionLines,
  };

  // Reconstruct the file
  const merged = sections
    .map((s) => s.lines.join("\n"))
    .join("\n\n");

  return {
    content: merged,
    previousContent,
    success: true,
  };
}
