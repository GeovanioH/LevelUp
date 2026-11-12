/**
 * LevelUp Discord Command /programme
 * Displays circadian time-blocking schedule and daily Deep Work allocations
 * Reference: docs/01-PRD.md Section 1.7 & docs/03-APP_FLOW.md Section 3.4
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { type DiscordEmbedData } from "../embeds/holographicEmbeds";

export interface CommandInteractionWithDayOption extends RepliableInteraction {
  options: {
    getString: (name: string, required?: boolean) => string | null;
  };
}

export async function handleProgrammeCommand(
  interaction: CommandInteractionWithDayOption,
) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const jour = interaction.options?.getString?.("jour") || "aujourd'hui";

  const scheduleBlocks = [
    {
      time: "06:00 - 06:30",
      title: "🌅 [RÉVEIL & HYDRATATION]",
      base: "DIS",
      status: "✅ Complété",
    },
    {
      time: "06:30 - 07:30",
      title: "💪 [SPORT SUNG JIN-WOO]",
      base: "STR",
      status: "✅ Complété",
    },
    {
      time: "07:30 - 08:30",
      title: "🚿 [PETIT-DÉJEUNER & PRÉPARATION]",
      base: "DIS",
      status: "✅ Complété",
    },
    {
      time: "08:30 - 11:30",
      title: "🧠 [DEEP WORK IA : TRANSFORMERS]",
      base: "AI_ENG",
      status: "🔥 En cours",
    },
    {
      time: "11:30 - 12:30",
      title: "🚶 [DÉJEUNER & MARCHE RESTAURATION]",
      base: "EXP",
      status: "⏳ À venir",
    },
    {
      time: "12:30 - 13:00",
      title: "🎙️ [DICTÉE VOCALE & SYNTHÈSE]",
      base: "ACAD",
      status: "⏳ À venir",
    },
    {
      time: "13:00 - 16:00",
      title: "🛡️ [CYBERSÉCURITÉ TRYHACKME / CTF]",
      base: "CYBER",
      status: "⏳ À venir",
    },
    {
      time: "16:30 - 18:00",
      title: "🇬🇧 [ANGLAIS C1 CAMBRIDGE PRACTICE]",
      base: "LNG",
      status: "⏳ À venir",
    },
    {
      time: "18:00 - 20:00",
      title: "⚡ [PROJET PERSO MVP / LEVELUP DEV]",
      base: "AI_ENG",
      status: "⏳ À venir",
    },
    {
      time: "21:00 - 22:00",
      title: "🌙 [BILAN DU SOIR & AUDIT 22H00]",
      base: "DIS",
      status: "🔒 Verrou 22h",
    },
  ];

  const embed: DiscordEmbedData = {
    title: `📅 [PLANIFICATEUR DU MONARQUE — ${jour.toUpperCase()}]`,
    description:
      "Ordonnancement circadien inviolable en blocs de temps hermétiques (*Time-Blocking*).",
    color: 0x00e5ff,
    fields: scheduleBlocks.map((b) => ({
      name: `${b.time} — ${b.title}`,
      value: `Pilier : \`${b.base}\` | Statut : **${b.status}**`,
      inline: false,
    })),
    footer: {
      text: "Rappel : Clôture impérative des quêtes obligatoires à 22h00.",
    },
    timestamp: new Date().toISOString(),
  };

  return {
    embeds: [embed],
  };
}
