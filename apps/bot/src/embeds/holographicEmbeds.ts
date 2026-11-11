/**
 * LevelUp Holographic Discord Embeds Factory
 * Generates the 15 canonical Solo Leveling embeds with rank-specific borders and ASCII gauges
 * Reference: docs/02-TRD.md Section 2.2 & docs/09-ROADMAP.md Section 21.5
 */

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedData {
  title: string;
  description: string;
  color: number;
  fields: DiscordEmbedField[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

export const RANK_EMBED_COLORS: Record<string, number> = {
  E: 0x9e9e9e, // Slate Gray
  D: 0x4caf50, // Emerald Green
  C: 0x2196f3, // Azure Blue
  B: 0x9c27b0, // Shadow Purple
  A: 0xff9800, // Radiant Amber
  S: 0xffd700, // Sovereign Gold
  MONARCH: 0x00f0ff, // Transcendent Neon Cyan
};

/**
 * Generates an ASCII progress gauge for HP, MP, and XP
 * Example: createAsciiGauge(80, 100, 10) => "[████████░░] 80%"
 */
export function createAsciiGauge(
  current: number,
  max: number = 100,
  length: number = 10,
): string {
  const ratio = Math.max(0, Math.min(1, current / Math.max(1, max)));
  const filledCount = Math.round(ratio * length);
  const emptyCount = length - filledCount;
  const bar = "█".repeat(filledCount) + "░".repeat(emptyCount);
  const percentage = Math.round(ratio * 100);
  return `\`[${bar}]\` **${percentage}%**`;
}

// 1. STATUS_HUD
export function createStatusHudEmbed(data: {
  username: string;
  level: number;
  rank: string;
  hp: number;
  mp: number;
  currentXp: number;
  nextLevelXp: number;
  crystals: number;
  weakestBase?: string;
}): DiscordEmbedData {
  const color = RANK_EMBED_COLORS[data.rank] ?? 0x00f0ff;
  return {
    title: `[SYSTÈME : STATUT DU MONARQUE — ${data.rank}]`,
    description: `Chasseur **${data.username}** — Niveau Global Harmonis\u00e9 **${data.level}**`,
    color,
    fields: [
      {
        name: "Jauge HP (Résilience)",
        value: createAsciiGauge(data.hp, 100),
        inline: true,
      },
      {
        name: "Jauge MP (Focus)",
        value: createAsciiGauge(data.mp, 100),
        inline: true,
      },
      {
        name: "Progression XP",
        value: `${createAsciiGauge(data.currentXp, data.nextLevelXp)} (${data.currentXp}/${data.nextLevelXp} XP)`,
        inline: false,
      },
      {
        name: "Cristaux des Ombres",
        value: `💎 **${data.crystals}** Cristaux`,
        inline: true,
      },
      {
        name: "Pilier Prioritaire",
        value: data.weakestBase
          ? `⚠️ **${data.weakestBase}** (Score le plus faible)`
          : "✨ **Équilibre Harmonique Parfait**",
        inline: true,
      },
    ],
    footer: { text: "Système Solo Leveling IRL // Huriel Sovereign OS" },
    timestamp: new Date().toISOString(),
  };
}

// 2. QUEST_COMPLETED
export function createQuestCompletedEmbed(
  questId: string,
  xp: number,
  crystals: number,
): DiscordEmbedData {
  return {
    title: "🏆 [QUÊTE ACCOMPLIE : RÉCOMPENSE SYSTÈME]",
    description: `La quête **${questId}** a été vérifiée et enregistrée avec succès.`,
    color: 0x10b981,
    fields: [
      { name: "Gain d'XP (Expérience)", value: `+**${xp}** XP`, inline: true },
      { name: "Cristaux Crédités", value: `+**${crystals}** 💎`, inline: true },
    ],
    footer: { text: "Attribution atomique garantie sous verrou Redlock" },
    timestamp: new Date().toISOString(),
  };
}

// 3. QUEST_LIST
export function createQuestListEmbed(
  quests: Array<{ id: string; title: string; base: string; xp: number }>,
): DiscordEmbedData {
  return {
    title: "📜 [QUÊTES DU JOUR DU MONARQUE]",
    description: `${quests.length} quêtes actives pour harmoniser vos 8 piliers :`,
    color: 0x00f0ff,
    fields: quests.map((q) => ({
      name: `${q.base} : ${q.title}`,
      value: `ID: \`${q.id}\` | Gain: **${q.xp}** XP`,
      inline: false,
    })),
    footer: { text: "Rappel : Couvre-feu de validation à 22h00" },
  };
}

// 4. LEVEL_UP
export function createLevelUpEmbed(
  oldLevel: number,
  newLevel: number,
): DiscordEmbedData {
  return {
    title: "⚡ [ASCENSION DU MONARQUE : NIVEAU SUPÉRIEUR]",
    description: `Franchissement de palier ! Vous passez du niveau **${oldLevel}** au niveau **${newLevel}**.`,
    color: 0xffd700,
    fields: [
      {
        name: "Statut Vital",
        value: "Restauration intégrale HP & MP (100%)",
        inline: true,
      },
      {
        name: "Résonance Magique",
        value: "Capacité de focus augmentée",
        inline: true,
      },
    ],
  };
}

// 5. RANK_UP
export function createRankUpEmbed(
  oldRank: string,
  newRank: string,
): DiscordEmbedData {
  return {
    title: "👑 [TRANSCENDANCE DE RANG : ÉVEIL CONFIRMÉ]",
    description: `Votre condition réelle dans le monde tangible vous élève du **Rang ${oldRank}** au **Rang ${newRank}** !`,
    color: RANK_EMBED_COLORS[newRank] ?? 0xffd700,
    fields: [
      {
        name: "Nouveau Statut",
        value: `Chasseur de Rang **${newRank}**`,
        inline: false,
      },
    ],
  };
}

// 6. EMERGENCY_QUEST
export function createEmergencyQuestEmbed(
  title: string,
  details: string,
): DiscordEmbedData {
  return {
    title: "🚨 [QUÊTE D'URGENCE : MENACE IMMINENTE]",
    description: `Alerte rouge ! Une rupture d\'engagement exige une intervention immédiate :\n**${title}**`,
    color: 0xff003c,
    fields: [{ name: "Directive", value: details, inline: false }],
  };
}

// 7. PENALTY_ZONE_ALARM
export function createPenaltyZoneAlarmEmbed(
  blockedDomains: string[],
): DiscordEmbedData {
  return {
    title: "☠️ [ZONE DE PÉNALITÉ ACTIVÉE : COUVRE-FEU BRAFOUÉ]",
    description:
      "Les quêtes quotidiennes n'ont pas été validées à temps. Le pare-feu système s'active.",
    color: 0xff0000,
    fields: [
      {
        name: "Domaines Bloqués via NextDNS",
        value: blockedDomains.join(", "),
        inline: false,
      },
      {
        name: "Épreuve de Rédemption",
        value: "400 Pompes Calisthéniques strictes validées par caméra",
        inline: false,
      },
    ],
  };
}

// 8. DEEP_WORK_START
export function createDeepWorkStartEmbed(
  blockTitle: string,
  durationMinutes: number,
): DiscordEmbedData {
  return {
    title: "🛡️ [SESSION DE DEEP WORK ENGAGÉE]",
    description: `Début de la session **${blockTitle}** (${durationMinutes} min). Pare-feu anti-distraction actif.`,
    color: 0x8a2be2,
    fields: [
      {
        name: "Focus Cognitif",
        value: "Zéro notification. Concentration indomptable.",
        inline: false,
      },
    ],
  };
}

// 9. DEEP_WORK_END
export function createDeepWorkEndEmbed(blockTitle: string): DiscordEmbedData {
  return {
    title: "🎯 [SESSION DE DEEP WORK ACCOMPLIE]",
    description: `La session **${blockTitle}** a été menée à son terme avec succès.`,
    color: 0x10b981,
    fields: [
      {
        name: "Régénération",
        value: "+10 MP focus cognitif crédité",
        inline: false,
      },
    ],
  };
}

// 10. DAILY_RESET_MORNING
export function createDailyResetMorningEmbed(
  date: string,
  questCount: number,
): DiscordEmbedData {
  return {
    title: "🌅 [RITUEL DE L'AUBE : ÉVEIL À 06H00 UTC]",
    description: `Journée du **${date}** initialisée. ${questCount} nouvelles quêtes générées selon votre niveau d'énergie.`,
    color: 0x00f0ff,
    fields: [
      {
        name: "Objectif",
        value: "Maximiser le score harmonique des 8 piliers.",
        inline: false,
      },
    ],
  };
}

// 11. EVENING_AUDIT
export function createEveningAuditEmbed(
  completed: number,
  total: number,
  hp: number,
): DiscordEmbedData {
  return {
    title: "🌙 [BILAN DU SOIR : AUDIT 22H00]",
    description: `Bilan journalier : **${completed} / ${total}** quêtes achevées.`,
    color: completed === total ? 0x10b981 : 0xff9800,
    fields: [
      {
        name: "Résilience Finale",
        value: createAsciiGauge(hp, 100),
        inline: true,
      },
      {
        name: "Statut",
        value:
          completed === total
            ? "✅ Quota Quotidien Validé"
            : "⚠️ Zone de Pénalité Évitée de Justesse",
        inline: true,
      },
    ],
  };
}

// 12. CALISTHENICS_ROUTINE
export function createCalisthenicsRoutineEmbed(
  routineName: string,
  reps: number,
): DiscordEmbedData {
  return {
    title: "💪 [SÉANCE DE CALISTHÉNIE VALIDÉE]",
    description: `La routine **${routineName}** a été complétée sous contrôle cinématique MediaPipe Pose WASM.`,
    color: 0x00f0ff,
    fields: [
      {
        name: "Répétitions Strictes",
        value: `**${reps}** répétitions avec flexion <= 75° et extension >= 160°`,
        inline: false,
      },
    ],
  };
}

// 13. ORAL_DEFENSE_RESULT
export function createOralDefenseResultEmbed(
  score: number,
  feedback: string,
): DiscordEmbedData {
  return {
    title: "🎙️ [ÉVALUATION ORALE : GRILLE 20 POINTS]",
    description: `Note attribuée par l'Architecte : **${score} / 20**`,
    color: score >= 16 ? 0x10b981 : score >= 12 ? 0xff9800 : 0xff003c,
    fields: [{ name: "Analyse Socratique", value: feedback, inline: false }],
  };
}

// 14. OPPORTUNITY_ALERT
export function createOpportunityAlertEmbed(
  title: string,
  amount: string,
  deadline: string,
  url: string,
): DiscordEmbedData {
  return {
    title: "💰 [OPPORTUNITÉ STRATÉGIQUE DÉTECTÉE]",
    description: `Veille Deerflow AI : **${title}**`,
    color: 0xffd700,
    fields: [
      { name: "Dotation / Bourse", value: amount, inline: true },
      { name: "Date Limite", value: deadline, inline: true },
      { name: "Lien d'Accès", value: url, inline: false },
    ],
  };
}

// 15. SECURITY_BREACH_ATTEMPT
export function createSecurityBreachAttemptEmbed(
  intruderId: string,
): DiscordEmbedData {
  return {
    title: "⛔ [TENTATIVE D'INTRUSION REPOUSSÉE]",
    description:
      "Une tentative d'accès non autorisée a été bloquée par le SingleUserGuard.",
    color: 0xff003c,
    fields: [
      { name: "Identifiant Rejeté", value: `\`${intruderId}\``, inline: false },
    ],
  };
}
