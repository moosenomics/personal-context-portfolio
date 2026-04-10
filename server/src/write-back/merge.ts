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
 * Count redaction opening markers in content.
 */
export function countMarkers(content: string): number {
  const lines = content.split("\n");
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (EXCLUDE_OPEN.test(trimmed) || INCLUDE_OPEN.test(trimmed)) {
      count++;
    }
  }
  return count;
}

/**
 * List all redaction opening marker lines in content (for diagnostics).
 */
function listMarkers(content: string): string[] {
  const lines = content.split("\n");
  const markers: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (EXCLUDE_OPEN.test(trimmed) || INCLUDE_OPEN.test(trimmed)) {
      markers.push(trimmed);
    }
  }
  return markers;
}

/**
 * Parse a raw markdown file into sections split on ## headings.
 * ### sub-headings are part of their parent ## section.
 * Content before the first ## heading is its own section with heading=null.
 *
 * CRITICAL: ## headings inside redaction blocks are NOT treated as section
 * boundaries. They are included as content within the enclosing section.
 * This prevents hidden sections from being split out and lost during merges.
 */
function parseSections(raw: string): RawSection[] {
  const lines = raw.split("\n");
  const sections: RawSection[] = [];
  let current: RawSection = { heading: null, lines: [] };
  let redactionDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track redaction block nesting
    if (EXCLUDE_OPEN.test(trimmed) || INCLUDE_OPEN.test(trimmed)) {
      redactionDepth++;
    }
    if (EXCLUDE_CLOSE.test(trimmed) || INCLUDE_CLOSE.test(trimmed)) {
      redactionDepth = Math.max(0, redactionDepth - 1);
    }

    // Only split on ## headings when NOT inside a redaction block
    if (
      redactionDepth === 0 &&
      HEADING_RE.test(trimmed) &&
      !trimmed.startsWith("### ")
    ) {
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
    return userTags.some((ut) => tags.includes(ut));
  }

  const includeMatch = trimmed.match(INCLUDE_OPEN);
  if (includeMatch) {
    const tags = parseTags(includeMatch[1]);
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
        const openRe = isExcludeOpen ? EXCLUDE_OPEN : INCLUDE_OPEN;
        let depth = 1;
        i++;

        while (i < sectionLines.length && depth > 0) {
          blockLines.push(sectionLines[i]);
          const innerTrimmed = sectionLines[i].trim();

          if (openRe.test(innerTrimmed)) depth++;
          if (closeRe.test(innerTrimmed)) depth--;

          i++;
        }

        hiddenBlocks.push({
          lines: blockLines,
          anchorAfterVisibleLine: visibleLineCount,
        });
        continue;
      }
    }

    visibleLines.push(sectionLines[i]);
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
      if (result.length > 0 && result[result.length - 1].trim() !== "") {
        result.push("");
      }
      result.push(...hiddenBlocks[blockIdx].lines);
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
 */
function isSectionEntirelyHidden(
  sectionLines: string[],
  userTags: string[]
): boolean {
  const { visibleLines } = extractHiddenBlocks(sectionLines, userTags);
  const nonEmpty = visibleLines.filter((l) => l.trim() !== "");
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
 * 1. Parses sections (respecting redaction block boundaries)
 * 2. Extracts hidden redaction blocks from the target section
 * 3. Replaces only the visible content with the LLM's update
 * 4. Reinserts hidden blocks at their original relative positions
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
  const markersBefore = countMarkers(rawFileContent);
  const markerListBefore = listMarkers(rawFileContent);

  if (markersBefore > 0) {
    console.error(`[PCP] Merge ${update.file}: ${markersBefore} redaction markers before merge`);
    for (const m of markerListBefore) {
      console.error(`[PCP]   marker: ${m}`);
    }
  }

  const sections = parseSections(rawFileContent);

  let merged: string;
  let previousContent = "";

  if (update.action === "append") {
    const newContent = visibility
      ? wrapWithVisibility(update.content, visibility)
      : update.content;

    merged = rawFileContent.trimEnd() + "\n\n" + newContent + "\n";
  } else if (update.action === "add") {
    let newSection = `${update.section}\n\n${update.content}`;
    if (visibility) {
      newSection = `${update.section}\n\n${wrapWithVisibility(update.content, visibility)}`;
    }

    merged = rawFileContent.trimEnd() + "\n\n" + newSection + "\n";
  } else {
    // action === "replace"
    if (!update.section) {
      return {
        content: rawFileContent,
        previousContent: "",
        success: false,
        warning: `Replace action requires a section heading, but none was provided for file ${update.file}`,
      };
    }

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

    if (isSectionEntirelyHidden(targetSection.lines, userTags)) {
      return {
        content: rawFileContent,
        previousContent: "",
        success: false,
        warning: `Section "${update.section}" is hidden from the current user. Cannot replace.`,
      };
    }

    // Extract hidden blocks before replacing visible content
    const headingLine = targetSection.lines[0];
    const bodyLines = targetSection.lines.slice(1);

    const { visibleLines, hiddenBlocks } = extractHiddenBlocks(bodyLines, userTags);

    if (hiddenBlocks.length > 0) {
      console.error(`[PCP] Merge ${update.file} section "${update.section}": extracted ${hiddenBlocks.length} hidden block(s)`);
      for (const hb of hiddenBlocks) {
        console.error(`[PCP]   hidden block: ${hb.lines[0].trim()}`);
      }
    }

    previousContent = visibleLines.join("\n").trim();

    let newBody = update.content;
    if (visibility) {
      newBody = wrapWithVisibility(update.content, visibility);
    }

    // Verify LLM output has no markers (it shouldn't)
    const llmMarkers = countMarkers(newBody);
    if (llmMarkers > 0) {
      console.error(`[PCP] ⚠ LLM output for ${update.file} contains ${llmMarkers} redaction markers — these should not be in LLM output`);
    }

    const newBodyLines = ["", ...newBody.split("\n")];
    const mergedBodyLines = reinsertHiddenBlocks(newBodyLines, hiddenBlocks);

    if (hiddenBlocks.length > 0) {
      const reinsertedMarkers = countMarkers(mergedBodyLines.join("\n"));
      console.error(`[PCP] Merge ${update.file}: ${reinsertedMarkers} markers after reinsertion into section`);
    }

    sections[sectionIndex] = {
      heading: targetSection.heading,
      lines: [headingLine, ...mergedBodyLines],
    };

    merged = sections
      .map((s) => s.lines.join("\n"))
      .join("\n\n");
  }

  // Final marker count verification
  const markersAfter = countMarkers(merged);
  if (markersBefore !== markersAfter) {
    console.error(
      `[PCP] ⚠ REDACTION MARKER MISMATCH: ${update.file} had ${markersBefore} markers before merge, has ${markersAfter} after merge`
    );
  } else if (markersBefore > 0) {
    console.error(`[PCP] Merge ${update.file}: marker count verified (${markersAfter}/${markersBefore})`);
  }

  return {
    content: merged,
    previousContent,
    success: true,
  };
}
