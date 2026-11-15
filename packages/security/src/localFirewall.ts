/**
 * LevelUp Local Firewall & Hosts Sentinel
 * Anti-Procrastination Network Restriction
 * Reference: docs/05-SECURITY.md & docs/09-ROADMAP.md
 */

import fs from "fs";

export const HOSTS_BLOCK_HEADER = "# >>> LEVELUP_ANTI_PROCRASTINATION_START";
export const HOSTS_BLOCK_FOOTER = "# <<< LEVELUP_ANTI_PROCRASTINATION_END";

export const DEFAULT_BLOCKED_HOSTS: readonly string[] = [
  "tiktok.com",
  "www.tiktok.com",
  "instagram.com",
  "www.instagram.com",
  "twitter.com",
  "www.twitter.com",
  "x.com",
  "www.x.com",
  "youtube.com",
  "www.youtube.com",
  "reddit.com",
  "www.reddit.com",
  "netflix.com",
  "www.netflix.com",
];

export interface ApplyHostsBlockResult {
  applied: boolean;
  reason?: string;
  path: string;
}

export function applyHostsBlock(
  hostsPath: string = process.platform === "win32"
    ? "C:\\Windows\\System32\\drivers\\etc\\hosts"
    : "/etc/hosts",
  active: boolean = true,
  domains: readonly string[] = DEFAULT_BLOCKED_HOSTS,
): ApplyHostsBlockResult {
  try {
    if (!fs.existsSync(hostsPath)) {
      return {
        applied: false,
        reason: `Fichier hosts introuvable : ${hostsPath}`,
        path: hostsPath,
      };
    }

    const currentContent = fs.readFileSync(hostsPath, "utf-8");
    const regex = new RegExp(
      `${HOSTS_BLOCK_HEADER}[\\s\\S]*?${HOSTS_BLOCK_FOOTER}\\r?\\n?`,
      "g",
    );
    const cleanedContent = currentContent.replace(regex, "");

    if (!active) {
      if (cleanedContent !== currentContent) {
        fs.writeFileSync(hostsPath, cleanedContent, "utf-8");
      }
      return { applied: true, path: hostsPath };
    }

    const blockLines = [
      HOSTS_BLOCK_HEADER,
      "# Mode Restriction Automatique LevelUp (Couvre-feu 22h00)",
      ...domains.map((d) => `127.0.0.1 ${d}`),
      HOSTS_BLOCK_FOOTER,
      "",
    ].join("\n");

    const newContent = cleanedContent.trimEnd() + "\n\n" + blockLines;
    fs.writeFileSync(hostsPath, newContent, "utf-8");
    return { applied: true, path: hostsPath };
  } catch (err) {
    return {
      applied: false,
      reason: err instanceof Error ? err.message : String(err),
      path: hostsPath,
    };
  }
}
