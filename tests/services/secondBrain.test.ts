import { describe, it, expect } from "vitest";
import {
  parseMarkdownNote,
  extractWikilinks,
  sanitizeMarkdownContent,
  type MarkdownNote,
} from "../../apps/web/server/services/SecondBrainService";

describe("Second Brain Markdown Parser & Security", () => {
  it("extracts valid YAML frontmatter and markdown body", () => {
    const rawContent = `---
title: "Architecture Transformers & Attention Mécanisme"
base: "AI_ENG"
tags: ["deep-learning", "transformers", "attention"]
created_at: "2026-11-11T10:00:00Z"
---
# Mécanisme d'Attention

L'équation canonique de l'attention de Vaswani et al. :
$$Attention(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
`;

    const note = parseMarkdownNote(rawContent);
    expect(note.title).toBe("Architecture Transformers & Attention Mécanisme");
    expect(note.base).toBe("AI_ENG");
    expect(note.tags).toEqual(["deep-learning", "transformers", "attention"]);
    expect(note.body).toContain("$$Attention(Q, K, V)");
  });

  it("extracts wikilinks accurately with slugs and aliases", () => {
    const content = `
Dans ce module, nous étudions [[NeuralNetworks|Réseaux de Neurones]] et son application
directe dans [[Backpropagation]] ainsi que [[AttentionMechanism]].
`;

    const links = extractWikilinks(content);
    expect(links).toHaveLength(3);
    expect(links[0]).toEqual({
      target: "NeuralNetworks",
      alias: "Réseaux de Neurones",
    });
    expect(links[1]).toEqual({ target: "Backpropagation", alias: undefined });
    expect(links[2]).toEqual({
      target: "AttentionMechanism",
      alias: undefined,
    });
  });

  it("neutralizes malicious XSS script injections and event handlers", () => {
    const maliciousContent = `
# Titre Légitime
<script>alert("XSS Attack!");</script>
<img src="x" onerror="stealTokens()" />
<a href="javascript:alert('pwned')">Cliquez ici</a>
Texte sain et pur.
`;

    const sanitized = sanitizeMarkdownContent(maliciousContent);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("onerror=");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).toContain("Texte sain et pur.");
  });
});
