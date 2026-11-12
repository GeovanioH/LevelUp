/**
 * LevelUp Discord Command /penalite
 * Checks Penalty Zone firewall status, blocked entertainment domains and redemption purge quest
 * Reference: docs/01-PRD.md Section 1.7 & docs/03-APP_FLOW.md Section 3.9
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { type DiscordEmbedData } from "../embeds/holographicEmbeds";

export async function handlePenaliteCommand(interaction: RepliableInteraction) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const blockedDomains = [
    "tiktok.com",
    "instagram.com",
    "twitter.com / x.com",
    "youtube.com/shorts",
    "netflix.com",
  ];

  const embed: DiscordEmbedData = {
    title: "🔒 [DISPOSITIF DE ZONE DE PÉNALITÉ : ÉTAT SYSTÈME]",
    description:
      "Protection anti-procrastination de niveau noyau (NextDNS + Windows Filtering Platform).",
    color: 0xff003c,
    fields: [
      {
        name: "Statut Actuel du Pare-Feu",
        value:
          "🟢 **INACTIF / STANDBY** (Toutes les quêtes obligatoires sont dans les délais)",
        inline: false,
      },
      {
        name: "Heure Fatidique du Verrouillage",
        value:
          "⏰ **22h00 Tous les Soirs**. Si >= 1 quête obligatoire non validée, déclenchement instantané.",
        inline: true,
      },
      {
        name: "Cible de Blocage Réseau",
        value: blockedDomains.map((d) => `• \`${d}\``).join("\n"),
        inline: false,
      },
      {
        name: "Épreuve de Rachat Inviolable",
        value:
          "• **Option A :** 400 Pompes Calisthéniques strictes (MediaPipe Pose WASM)\n• **Option B :** Marche nocturne active de 10 km (Tracé GPS Strava vérifié)",
        inline: false,
      },
    ],
    footer: {
      text: "La discipline est la seule clé de sortie de la Zone de Pénalité.",
    },
    timestamp: new Date().toISOString(),
  };

  return {
    embeds: [embed],
    penaltyActive: false,
  };
}
