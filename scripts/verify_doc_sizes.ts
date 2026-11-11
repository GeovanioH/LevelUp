import { statSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * LevelUp Documentation Integrity Sentinel
 * Enforces the non-negotiable invariant: All 12 master documentation files MUST be >= 100,000 bytes.
 * Reference: docs/09-ROADMAP.md Section 21.7 (Test 6.3)
 */

export interface DocVerificationResult {
  path: string;
  sizeBytes: number;
  isValid: boolean;
}

export const CANONICAL_DOCS = [
  "docs/01-PRD.md",
  "docs/02-TRD.md",
  "docs/03-APP_FLOW.md",
  "docs/04-BACKEND_SCHEMA.md",
  "docs/05-SECURITY.md",
  "docs/06-API_SPEC.md",
  "docs/07-TEST_PLAN.md",
  "docs/08-IMPLEMENTATION_PLAN.md",
  "docs/09-ROADMAP.md",
  "README.md",
  "CLAUDE.md",
  "AGENTS.md",
];

export const MIN_DOC_SIZE_BYTES = 100_000;

export function verifyDocumentationSizes(rootDir: string = process.cwd()): {
  results: DocVerificationResult[];
  allValid: boolean;
} {
  const results: DocVerificationResult[] = [];
  let allValid = true;

  for (const docRelPath of CANONICAL_DOCS) {
    const fullPath = resolve(rootDir, docRelPath);
    if (!existsSync(fullPath)) {
      results.push({
        path: docRelPath,
        sizeBytes: 0,
        isValid: false,
      });
      allValid = false;
      continue;
    }

    const stats = statSync(fullPath);
    const sizeBytes = stats.size;
    const isValid = sizeBytes >= MIN_DOC_SIZE_BYTES;

    if (!isValid) {
      allValid = false;
    }

    results.push({
      path: docRelPath,
      sizeBytes,
      isValid,
    });
  }

  return { results, allValid };
}

// CLI entry point
if (
  require.main === module ||
  (typeof process !== "undefined" &&
    process.argv[1]?.endsWith("verify_doc_sizes.ts"))
) {
  console.log("=".repeat(80));
  console.log(
    "[AUDIT DOCUMENTAIRE] Contrôle d'Intégrité des 12 Fichiers Maîtres (>= 100 000 octets)",
  );
  console.log("=".repeat(80));

  const { results, allValid } = verifyDocumentationSizes();

  for (const r of results) {
    const statusTag = r.isValid ? "[VALIDE]" : "[CORROMPU / INVALIDE]";
    const formattedBytes = r.sizeBytes.toLocaleString("fr-FR");
    console.log(
      `  ${statusTag.padEnd(22)} ${r.path.padEnd(35)} : ${formattedBytes} octets`,
    );
  }

  console.log("=".repeat(80));
  if (!allValid) {
    console.error(
      "❌ ÉCHEC : Au moins un fichier de documentation ne respecte pas l'invariant de 100 000 octets.",
    );
    process.exit(1);
  }

  console.log(
    "✅ SUCCÈS : Les 12 fichiers maîtres respectent rigoureusement l'invariant >= 100 000 octets.",
  );
  process.exit(0);
}
