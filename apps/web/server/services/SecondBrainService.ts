/**
 * LevelUp Second Brain Service
 * Markdown Parsing, YAML Frontmatter Validation, Wikilinks Extraction & XSS Sanitization
 * Reference: docs/08-IMPLEMENTATION_PLAN.md Tâche 3.2
 */

import {
  NoteFrontmatterSchema,
  type NoteFrontmatter,
} from "@levelup/contracts";

export interface WikilinkMatch {
  target: string;
  alias?: string;
}

export interface MarkdownNote {
  title: string;
  base: string;
  tags: string[];
  body: string;
  frontmatter: NoteFrontmatter;
}

/**
 * Robust lightweight YAML frontmatter parser for Obsidian/Second Brain notes
 */
function parseYaml(yamlStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlStr.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let valStr = trimmed.slice(colonIdx + 1).trim();

    // Remove quotes
    if (
      (valStr.startsWith('"') && valStr.endsWith('"')) ||
      (valStr.startsWith("'") && valStr.endsWith("'"))
    ) {
      valStr = valStr.slice(1, -1);
    }

    // Parse array if bracketed
    if (valStr.startsWith("[") && valStr.endsWith("]")) {
      const items = valStr
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
      result[key] = items;
    } else {
      result[key] = valStr;
    }
  }

  return result;
}

/**
 * Parses a raw Markdown note containing YAML frontmatter
 */
export function parseMarkdownNote(rawContent: string): MarkdownNote {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
  const match = rawContent.match(frontmatterRegex);

  if (!match) {
    // If no frontmatter block, default to generic note
    return {
      title: "Note sans titre",
      base: "AI_ENG",
      tags: [],
      body: rawContent.trim(),
      frontmatter: {
        title: "Note sans titre",
        base: "AI_ENG",
        tags: [],
      },
    };
  }

  const rawYaml = match[1];
  const body = match[2].trim();
  const parsedYaml = parseYaml(rawYaml);

  const validatedFrontmatter = NoteFrontmatterSchema.parse(parsedYaml);

  return {
    title: validatedFrontmatter.title,
    base: validatedFrontmatter.base,
    tags: validatedFrontmatter.tags,
    body,
    frontmatter: validatedFrontmatter,
  };
}

/**
 * Extracts Obsidian-style bidirectional wikilinks [[Target]] or [[Target|Alias]]
 */
export function extractWikilinks(content: string): WikilinkMatch[] {
  const wikilinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  const matches: WikilinkMatch[] = [];

  let match: RegExpExecArray | null;
  while ((match = wikilinkRegex.exec(content)) !== null) {
    matches.push({
      target: match[1].trim(),
      alias: match[2]?.trim(),
    });
  }

  return matches;
}

/**
 * Sanitizes markdown/HTML against XSS vulnerabilities, neutralizing script injections,
 * event handlers (onerror, onload, onclick) and dangerous URI protocols.
 */
export function sanitizeMarkdownContent(rawContent: string): string {
  let sanitized = rawContent;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // 2. Remove dangerous inline event handlers (onerror, onload, onclick, onmouseover, etc.)
  sanitized = sanitized.replace(
    /\s*on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi,
    "",
  );

  // 3. Neutralize javascript:, vbscript:, and data: URI schemes in hrefs and src
  sanitized = sanitized.replace(
    /(href|src)\s*=\s*['"]\s*(javascript|vbscript|data):[^'"]*['"]/gi,
    "",
  );

  // 4. Remove iframe, object, embed tags
  sanitized = sanitized.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    "",
  );
  sanitized = sanitized.replace(
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    "",
  );
  sanitized = sanitized.replace(/<embed\b[^>]*>/gi, "");

  return sanitized;
}
