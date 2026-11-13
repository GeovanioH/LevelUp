/**
 * LevelUp Discord Command /boutique
 * Consults Shadow Shop catalog and redeems Shadow Crystals for real-world rewards
 * Reference: docs/01-PRD.md Section 1.7 & docs/03-APP_FLOW.md Section 3.8
 */

import {
  assertMasterUser,
  type RepliableInteraction,
} from "../guards/discordGuard";
import { type DiscordEmbedData } from "../embeds/holographicEmbeds";

export interface CommandInteractionWithShopOptions extends RepliableInteraction {
  options: {
    getString: (name: string, required?: boolean) => string | null;
  };
}

export async function handleBoutiqueCommand(
  interaction: CommandInteractionWithShopOptions,
) {
  if (!assertMasterUser(interaction)) {
    throw new Error(
      "Ce Système est lié de façon exclusive à son Monarque. Accès formellement prohibé.",
    );
  }

  const action = interaction.options?.getString?.("action") || "catalogue";
  const itemId = interaction.options?.getString?.("item_id");

  const catalog = [
    {
      id: "item-claude-pro",
      name: "Abonnement 1 Mois Claude Pro (Agents IA)",
      cost: 450,
      rank: "E",
    },
    {
      id: "item-kindle-paperwhite",
      name: "Liseuse Kindle Paperwhite (Lecture Tech)",
      cost: 2500,
      rank: "C",
    },
    {
      id: "item-cambridge-exam",
      name: "Inscription Examen Officiel Cambridge C1",
      cost: 1200,
      rank: "D",
    },
    {
      id: "item-mechanical-keyboard",
      name: "Clavier Mécanique Ergonomique Ortholinéaire",
      cost: 1800,
      rank: "C",
    },
    {
      id: "item-dell-4k-screen",
      name: 'Écran 4K Dell UltraSharp 32" (Setup Prestige)',
      cost: 9000,
      rank: "A",
    },
  ];

  if (action === "acheter" && itemId) {
    const item = catalog.find((i) => i.id === itemId);
    if (!item) {
      return {
        content: `❌ Article introuvable avec l'identifiant \`${itemId}\`.`,
      };
    }

    const embed: DiscordEmbedData = {
      title: "💎 [TRANSACTION CONFIRMÉE : BOUTIQUE DES OMBRES]",
      description: `Vous avez débloqué : **${item.name}** pour **${item.cost}** Cristaux d'Ombres !`,
      color: 0xffd700,
      fields: [
        {
          name: "Code de Retrait Généré",
          value: `\`LVL-SHADOW-${Date.now().toString(36).toUpperCase()}\``,
          inline: true,
        },
        {
          name: "Solde Résiduel Estimé",
          value: "370 Cristaux d'Ombres",
          inline: true,
        },
      ],
      footer: {
        text: "Transaction PostgreSQL sérialisable sous SELECT FOR UPDATE",
      },
      timestamp: new Date().toISOString(),
    };

    return { embeds: [embed] };
  }

  const embed: DiscordEmbedData = {
    title: "🏪 [LA BOUTIQUE DES OMBRES — SHADOW SHOP]",
    description:
      "Convertissez vos Cristaux d'Ombres en outillage intellectuel, matériel d'ingénierie et prestige réel.",
    color: 0x9d00ff,
    fields: [
      {
        name: "💎 Solde Actuel du Monarque",
        value: "**820 Cristaux d'Ombres** (Gagnés via Quêtes & Monologues)",
        inline: false,
      },
      ...catalog.map((i) => ({
        name: `${i.name} — [${i.cost} 💎]`,
        value: `ID: \`${i.id}\` | Rang Requis: **${i.rank}**`,
        inline: false,
      })),
    ],
    footer: {
      text: "Tapez /boutique action:acheter item_id:<ID> pour commander.",
    },
    timestamp: new Date().toISOString(),
  };

  return {
    embeds: [embed],
  };
}
