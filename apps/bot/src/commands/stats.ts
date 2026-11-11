/**
 * LevelUp Discord Command /stats
 * Displays the 8 fundamental bases radar summary and harmonic mean Sh
 * Reference: docs/02-TRD.md Section 2.2 & docs/09-ROADMAP.md Section 21.5
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import {
  createAsciiGauge,
  type DiscordEmbedData,
} from "../embeds/holographicEmbeds";

export async function handleStatsCommand(interaction: RepliableInteraction) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const bases = [
    { code: "STR", name: "B1 : Calisthénie (STR)", score: 32, max: 100 },
    { code: "EXP", name: "B2 : Endurance (EXP)", score: 45, max: 100 },
    { code: "LNG", name: "B3 : Éloquence (LNG)", score: 58, max: 100 },
    {
      code: "AI_ENG",
      name: "B4 : Algorithmique (AI_ENG)",
      score: 64,
      max: 100,
    },
    { code: "DIS", name: "B5 : Discipline Mentale (DIS)", score: 50, max: 100 },
    { code: "ACAD", name: "B6 : Sommeil & Rythme (ACAD)", score: 52, max: 100 },
    { code: "NUT", name: "B7 : Nutrition (BIO)", score: 48, max: 100 },
    { code: "FIN", name: "B8 : Impact Stratégique (FIN)", score: 40, max: 100 },
  ];

  // Calculate harmonic mean
  const sumInverses = bases.reduce(
    (acc, b) => acc + 1 / Math.max(1, b.score),
    0,
  );
  const harmonicMean = Math.round(8 / sumInverses);

  const embed: DiscordEmbedData = {
    title: `📊 [OCTOGONE DES 8 BASES — SCORE HARMONIQUE : ${harmonicMean}]`,
    description: `Moyenne harmonique stricte **$S_H = ${harmonicMean}$**. Tout déséquilibre pénalise le score global.`,
    color: 0x00f0ff,
    fields: bases.map((b) => ({
      name: b.name,
      value: `${createAsciiGauge(b.score, b.max)} (${b.score}/100)`,
      inline: true,
    })),
    footer: {
      text: "Règle anti-asymétrie : un pilier négligé effondre le rang.",
    },
  };

  return {
    embeds: [embed],
  };
}
