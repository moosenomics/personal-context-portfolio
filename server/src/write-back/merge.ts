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

/**
 * A contiguous block of hidden content extracted from a section.
 * Includes the opening marker, all content, and the closing marker.
 */
interface HiddenBlock {
  /** The lines comprising this hidden block (markers + content) */
  lines: string[];
  /** Index of the visible line BEFORE this hidden block appeared (or -1 if at start) */
  anchorAfterVisibleLine: number;
}

const HEADING_RE = /^##\s+/;
const INCLUDE_OPEN = /^<!--\s*@@\s*include:\s*(.+?)\s*-->$/;
const EXCLUDE_OPEN = /^<!--\s*@@\s*exclude:\s*(.+?)\s*-->$/;
const INCLUDE_CLOSE = /^<!--\s*@@\s*end\s+include\s*-->$/;
const EXCLUDE_CLOSE = /^<!--\s*@@\s*end\s+exclude\s*-->$/;

function parseTags(raw: string): string[] {
  const beforePipe = raw.split("|")[0];
  return beforePipe.split(",").map((t) => t.trim()).filter(Boolean);
}

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
    // Only split on ## headings that are NOT inside a redaction block.
    // But since redaction blocks can contain ## headings for hidden sections,
    // we need to track whether we're inside a hidden block.
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
 * Determine if a redaction block hides its content from the given user.
 */
function isBlockHiddenFromUser(openingMarker: string, userTags: string[]): boolean {
  const trimmed = openingMarker.trim();

  const excludeMatch = trimmed.match(EXCLUDE_OPEN);
  if (excludeMatch) {
    const tags = parseTags(excludeMatch[1]);
    // User is excluded if they have ANY of the listed tags
    return userTags.some((ut) => tags.includes(ut));
  }

  const includeMatch = trimmed.match(INCLUDE_OPEN);
  if (includeMatch) {
    const tags = parseTags(includeMatch[1]);
    // User is excluded if they have NONE of the listed tags
    return !userTags.some((ut) => tags.includes(ut));
  }

  return false;
}

/**
 * Extract hidden redaction blocks from section lines, returning:
 * - visibleLines: the lines the user can see (markers stripped)
 * - hiddenBlocks: extracted hidden blocks with anchor positions
 *
 * This separates the visible layer (what the LLM works with) from
 * the hidden layer (what must be preserved byte-for-byte).
 */
function extractHiddenBlocks(
  sectionLines: string[],
  userTags: string[]
): { visibleLines: string[]; hiddenBlocks: HiddenBlock[] } {
  const visibleLines: string[] = [];
  const hiddenBlocks: HiddenBlock[] = [];

  let visibleLineCount = 0;
  let i = 0;

  while (i < sectionLines.length) {
    const trimmed = sectionLines[i].trim();

    // Check for opening redaction marker
    const isExcludeOpen = EXCLUDE_OPEN.test(trimmed);
    const isIncludeOpen = INCLUDE_OPEN.test(trimmed);

    if (isExcludeOpen || isIncludeOpen) {
      const hidden = isBlockHiddenFromUser(trimmed, userTags);

      if (hidden) {
        // Collect the entire block (opening marker through closing marker)
        const blockLines: string[] = [sectionLines[i]];
        const closeRe = isExcludeOpen ? EXCLUDE_CLOSE : INCLUDE_CLOSE;
        let depth = 1;
        i++;

        while (i < sectionLines.length && depth > 0) {
          blockLines.push(sectionLines[i]);
          const innerTrimmed = sectionLines[i].trim();

          // Track nesting of same-type markers
          if (isExcludeOpen && EXCLUDE_OPEN.test(innerTrimmed)) depth++;
          if (isIncludeOpen && INCLUDE_OPEN.test(innerTrimmed)) depth++;
          if (closeRe.test(innerTrimmed)) depth--;

          i++;
        }

        hiddenBlocks.push({
          lines: blockLines,
          anchorAfterVisibleLine: visibleLineCount,
        });
        continue;
      }
      // If the block is visible to this user, its markers still get stripped
      // by the redaction parser — but we need to preserve them in raw output.
      // They're visible-layer markers. Keep them in visibleLines.
    }

    visibleLines.push(sectionLines[i]);
    // Count non-empty visible lines for anchoring (skip blank lines for stability)
    if (trimmed !== "") {
      visibleLineCount++;
    }
    i++;
  }

  return { visibleLines, hiddenBlocks };
}

/**
 * Reinsert hidden blocks into updated visible content.
 * Uses anchor positions to place blocks at their original relative positions.
 */
function reinsertHiddenBlocks(
  newVisibleLines: string[],
  hiddenBlocks: HiddenBlock[]
): string[] {
  if (hiddenBlocks.length === 0) return newVisibleLines;

  // Build output by interleaving visible lines and hidden blocks
  const result: string[] = [];
  let visibleNonEmptyCount = 0;
  let blockIdx = 0;
  let visibleIdx = 0;

  while (visibleIdx < newVisibleLines.length || blockIdx < hiddenBlocks.length) {
    // Insert any hidden blocks anchored at the current visible line count
    while (
      blockIdx < hiddenBlocks.length &&
      hiddenBlocks[blockIdx].anchorAfterVisibleLine <= visibleNonEmptyCount
    ) {
      // Add blank line separator before hidden block if result isn't empty
      if (result.length > 0 && result[result.length - 1].trim() !== "") {
        result.push("");
      }
      result.push(...hiddenBlocks[blockIdx].lines);
      // Add blank line after hidden block
      result.push("");
      blockIdx++;
    }

    if (visibleIdx < newVisibleLines.length) {
      const line = newVisibleLines[visibleIdx];
      result.push(line);
      if (line.trim() !== "") {
        visibleNonEmptyCount++;
      }
      visibleIdx++;
    } else {
      break;
    }
  }

  // Append any remaining hidden blocks (anchored past end of visible content)
  while (blockIdx < hiddenBlocks.length) {
    if (result.length > 0 && result[result.length - 1].trim() !== "") {
      result.push("");
    }
    result.push(...hiddenBlocks[blockIdx].lines);
    result.push("");
    blockIdx++;
  }

  return result;
}

/**
 * Check if a section's top-level content is entirely hidden from the user.
 * A section is entirely hidden if its first non-empty, non-heading line
 * is an opening marker that excludes the user, and spans the whole section.
 */
function isSectionEntirelyHidden(
  sectionLines: string[],
  userTags: string[]
): boolean {
  // A section is entirely hidden if extracting hidden blocks leaves only
  // the heading line (or nothing) as visible content.
  const { visibleLines } = extractHiddenBlocks(sectionLines, userTags);
  const nonEmpty = visibleLines.filter((l) => l.trim() !== "");
  // Only the heading line or nothing — the section is fully hidden
  return nonEmpty.length <= 1 && (nonEmpty.length === 0 || HEADING_RE.test(nonEmpty[0].trim()));
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
 *
 * For "replace" actions, this:
 * 1. Extracts hidden redaction blocks from the target section
 * 2. Replaces only the visible content with the LLM's update
 * 3. Reinserts hidden blocks at their original relative positions
 *
 * This ensures that `<!-- @@ exclude/include -->` blocks and their
 * content are preserved byte-for-byte through write-back updates.
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

  // Guard: don't replace sections that are entirely hidden from this user
  if (isSectionEntirelyHidden(targetSection.lines, userTags)) {
    return {
      content: rawFileContent,
      previousContent: "",
      success: false,
      warning: `Section "${update.section}" is hidden from the current user. Cannot replace.`,
    };
  }

  // CRITICAL: Extract hidden blocks before replacing visible content.
  // The heading is always the first line.
  const headingLine = targetSection.lines[0];
  const bodyLines = targetSection.lines.slice(1);

  // Separate hidden blocks from visible content
  const { visibleLines, hiddenBlocks } = extractHiddenBlocks(bodyLines, userTags);

  // Capture previous visible content for change history
  const previousContent = visibleLines.join("\n").trim();

  // Build the new body from LLM output
  let newBody = update.content;
  if (visibility) {
    newBody = wrapWithVisibility(update.content, visibility);
  }

  // Split new body into lines and reinsert hidden blocks
  const newBodyLines = ["", ...newBody.split("\n")];
  const mergedBodyLines = reinsertHiddenBlocks(newBodyLines, hiddenBlocks);

  // Rebuild this section
  sections[sectionIndex] = {
    heading: targetSection.heading,
    lines: [headingLine, ...mergedBodyLines],
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
