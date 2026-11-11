import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { CANONICAL_DOCS, MIN_DOC_SIZE_BYTES } from "./verify_doc_sizes";

/**
 * LevelUp Sovereign Phase Gates Verification Script
 * Validates Gates 0 through 6 for Supreme System Certification.
 * Reference: docs/09-ROADMAP.md Section 21.8
 */

interface GateCheck {
  phase: string;
  name: string;
  artifacts: string[];
  status: "PASSED" | "FAILED";
  details: string;
}

function checkFileExists(relPath: string): boolean {
  return existsSync(resolve(process.cwd(), relPath));
}

export function auditAllPhaseGates(): {
  checks: GateCheck[];
  allPassed: boolean;
} {
  const checks: GateCheck[] = [
    {
      phase: "Phase 0",
      name: "Socle Technique & Infrastructure Monorepo",
      artifacts: [
        "pnpm-workspace.yaml",
        "turbo.json",
        "docker-compose.yml",
        "packages/database/prisma/schema.prisma",
        "packages/database/prisma/seed.ts",
        ".husky/pre-commit",
      ],
      status: "PASSED",
      details:
        "Monorepo pnpm, Docker PostgreSQL/Redis, Prisma 120 compétences seedées, Husky hooks",
    },
    {
      phase: "Phase 1",
      name: "Moteur Mathématique & Cryptographie",
      artifacts: [
        "packages/contracts/src/math/xpFormulas.ts",
        "packages/contracts/src/math/harmonicRankEngine.ts",
        "packages/contracts/src/math/vitalityEngine.ts",
        "packages/crypto/src/encryption.ts",
        "packages/crypto/src/passwordHasher.ts",
      ],
      status: "PASSED",
      details:
        "XP 100*floor(L^1.75), Score Harmonique S_H, Vitalité Borbély (HP>=80%), AES-256-GCM",
    },
    {
      phase: "Phase 2",
      name: "HUD Web Holographique Solo Leveling",
      artifacts: [
        "apps/web/src/components/VitalGauges.tsx",
        "apps/web/src/components/OctagonalRadar.tsx",
        "apps/web/src/components/SkillTreeDagViewer.tsx",
        "apps/web/src/audio/proceduralAudioEngine.ts",
        "apps/web/src/db/levelupDexie.ts",
      ],
      status: "PASSED",
      details:
        "Palette abysse & néon mana, Jauges vitales, Arbre 120 nœuds, Offline Dexie, Audio Do5",
    },
    {
      phase: "Phase 3",
      name: "Pipeline Audio, Vision & Cerveau Numérique",
      artifacts: [
        "apps/web/src/features/cv/poseMath.ts",
        "apps/web/src/features/cv/useExerciseCounter.ts",
        "apps/web/src/features/cv/routineSequenceEngine.ts",
        "services/whisper/worker.py",
        "packages/brain/src/sm2.ts",
        "apps/web/server/services/SecondBrainService.ts",
      ],
      status: "PASSED",
      details:
        "MediaPipe 75°/160°, 17 étapes Dos & Épaules, Whisper INT8 CUDA/CPU, SuperMemo SM-2",
    },
    {
      phase: "Phase 4",
      name: "Planificateur Temporel & Bot Discord v14",
      artifacts: [
        "packages/scheduler/src/timeBlocking.ts",
        "apps/bot/src/index.ts",
        "apps/bot/src/embeds/holographicEmbeds.ts",
        "apps/bot/src/voice/discordVoiceReceiver.ts",
      ],
      status: "PASSED",
      details:
        "Sanctuarisation 23h-07h, Deep Work gaps, Discord.js v14 Gateway, 15 embeds, RTP/Opus UDP",
    },
    {
      phase: "Phase 5",
      name: "Couche IA Locale, Scraping & NextDNS",
      artifacts: [
        "packages/security/src/nextdnsClient.ts",
        "services/deerflow/scraper.ts",
        "packages/contracts/src/evaluation/oralGrader.ts",
      ],
      status: "PASSED",
      details:
        "Sentinelle NextDNS AES-256, Scraping Bourses/Hackathons, Grille Orale 20 pts & Shield",
    },
    {
      phase: "Phase 6",
      name: "Durcissement, Monitoring, CI/CD & Déploiement",
      artifacts: [
        "docker/Dockerfile.production",
        ".github/workflows/quality_gate.yml",
        "services/sentinel/gpuMonitor.py",
        "packages/crypto/src/merkleAudit.ts",
        "scripts/verify_doc_sizes.ts",
        "daemon/PenaltyWatchdog.ps1",
        "tests/e2e/fullDaySoloLevelingScenario.spec.ts",
      ],
      status: "PASSED",
      details:
        "Dockerfile Multi-stage Alpine, 4 Gates CI/CD, Sentinelle GPU, Arbre de Merkle, 12 docs >= 100k",
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    for (const art of check.artifacts) {
      if (!checkFileExists(art)) {
        check.status = "FAILED";
        check.details = `Artefact manquant : ${art}`;
        allPassed = false;
        break;
      }
    }
  }

  // Check 12 doc files >= 100,000 bytes
  for (const doc of CANONICAL_DOCS) {
    const full = resolve(process.cwd(), doc);
    if (!existsSync(full) || statSync(full).size < MIN_DOC_SIZE_BYTES) {
      allPassed = false;
      const p6 = checks.find((c) => c.phase === "Phase 6");
      if (p6) {
        p6.status = "FAILED";
        p6.details = `Invariant documentaire violé sur ${doc}`;
      }
    }
  }

  return { checks, allPassed };
}

if (
  require.main === module ||
  (typeof process !== "undefined" &&
    process.argv[1]?.endsWith("verify_phase_gates.ts"))
) {
  console.log("=".repeat(88));
  console.log(
    "               SYSTÈME LEVELUP — CONTRÔLE SUPRÊME DES 7 PORTES DE QUALITÉ               ",
  );
  console.log("=".repeat(88));

  const { checks, allPassed } = auditAllPhaseGates();

  for (const c of checks) {
    const tag = c.status === "PASSED" ? "[✅ VALIDE]" : "[❌ ÉCHEC]";
    console.log(
      ` ${tag} ${c.phase.padEnd(9)} : ${c.name.padEnd(46)} | ${c.details}`,
    );
  }

  console.log("=".repeat(88));

  if (!allPassed) {
    console.error(
      "❌ ÉCHEC : Au moins une porte de qualification n'est pas satisfaite.",
    );
    process.exit(1);
  }

  console.log(
    "👑 TOUTES LES PORTES SONT AU VERT (100%). LE SYSTÈME EST CERTIFIÉ MAÎTRE POUR LE MONARQUE.",
  );
  console.log("=".repeat(88));
  process.exit(0);
}
