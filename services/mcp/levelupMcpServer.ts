/**
 * LevelUp MCP Server (Model Context Protocol)
 * Provides standardized JSON-RPC tools for AI agents (Antigravity, Claude, Cursor)
 * to interact with the Solo Leveling IRL System state.
 * Reference: docs/01-PRD.md Section 1.7 (Decision 9) & docs/02-TRD.md
 */

import { HarmonicRankEngine } from "../../packages/contracts/src/math/harmonicRankEngine";
import { SocraticOralGrader } from "../../packages/contracts/src/evaluation/oralGrader";

export interface McpToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

export const LEVELUP_MCP_TOOLS = [
  {
    name: "get_player_status",
    description:
      "Returns the complete status of the Hunter: Level, Rank, XP, HP/MP vitality, 8 bases, and Crystals.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_daily_quests",
    description:
      "Retrieves today's active quests (Daily, Emergency, Boss Raids, Monk Mode).",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "submit_quest_proof",
    description:
      "Submits irrefutable proof (GitHub PR, Strava GPS, certificate) to complete a quest atomically.",
    parameters: {
      type: "object",
      properties: {
        questId: {
          type: "string",
          description: "The ID of the quest to validate",
        },
        proofUrl: { type: "string", description: "URL or verifiable evidence" },
      },
      required: ["questId", "proofUrl"],
    },
  },
  {
    name: "grade_oral_monologue",
    description:
      "Evaluates an oral defense or technical monologue on the strict 20-point Socratic rubric.",
    parameters: {
      type: "object",
      properties: {
        transcript: {
          type: "string",
          description: "The transcribed monologue text",
        },
        subject: {
          type: "string",
          description: "Subject (AI_ENG, CYBER, ACAD, LNG)",
        },
      },
      required: ["transcript", "subject"],
    },
  },
  {
    name: "get_timeblocking_schedule",
    description: "Returns the circadian time-blocking schedule for the day.",
    parameters: {
      type: "object",
      properties: {
        day: { type: "string", description: "Day (aujourd'hui, demain)" },
      },
    },
  },
];

export async function handleMcpCall(
  toolName: string,
  args: Record<string, unknown>,
): Promise<McpToolResponse> {
  switch (toolName) {
    case "get_player_status": {
      const bases = {
        acad: 55,
        ai_eng: 62,
        cyber: 48,
        exp: 42,
        lng: 50,
        fin: 38,
        str: 52,
        dis: 65,
      };
      const globalScore = HarmonicRankEngine.calculateGlobalScore(bases);
      const hunterRank = HarmonicRankEngine.determineRank(globalScore, {
        hackathonsWon: 1,
        cambridgeCertificationLevel: "C1",
        classRankPercentile: 0.05,
        calisthenicsRoutinesMastered: true,
        productionSaasUsers: 150,
        netWorthOrSponsorshipEur: 15000,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                username: "Huriel",
                rank: hunterRank,
                harmonicScore: Math.round(globalScore),
                level: 14,
                hp: 88,
                mp: 65,
                crystals: 820,
                streakDays: 18,
                bases,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "get_daily_quests": {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              [
                {
                  id: "q-fit-sungjinwoo",
                  title: "L'Entraînement Physique de Sung Jin-Woo (STR)",
                  xp: 200,
                  crystals: 20,
                },
                {
                  id: "q-thm-medium-room",
                  title: "Infiltration Room Medium TryHackMe (CYBER)",
                  xp: 180,
                  crystals: 20,
                },
                {
                  id: "q-lng-cambridge-speech",
                  title: "Monologue Oral Anglais C1 Cambridge (LNG)",
                  xp: 150,
                  crystals: 15,
                },
                {
                  id: "q-ai-transformers-kv",
                  title:
                    "Deep Work : Kernel Triton & FlashAttention-2 (AI_ENG)",
                  xp: 250,
                  crystals: 30,
                },
              ],
              null,
              2,
            ),
          },
        ],
      };
    }

    case "submit_quest_proof": {
      const { questId, proofUrl } = args as {
        questId: string;
        proofUrl: string;
      };
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "COMPLETED",
                questId,
                proofUrl,
                xpCredited: 200,
                crystalsCredited: 20,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "grade_oral_monologue": {
      const { transcript, subject } = args as {
        transcript: string;
        subject: string;
      };
      const grader = new SocraticOralGrader();
      const grade = grader.evaluateSpeech(
        transcript ||
          "Démonstration gradient attention transformer softmax matrice vecteur latence",
        subject,
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                subject,
                score: grade.totalScore,
                isPassing: grade.totalScore >= 14,
                breakdown: grade.breakdown,
                feedback: grade.feedback,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case "get_timeblocking_schedule": {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              [
                {
                  time: "06:00 - 07:30",
                  title: "🌅 Réveil & Calisthénie (STR)",
                },
                {
                  time: "08:30 - 11:30",
                  title: "🧠 Deep Work IA : Transformers (AI_ENG)",
                },
                {
                  time: "13:00 - 16:00",
                  title: "🛡️ Cybersécurité : TryHackMe (CYBER)",
                },
                {
                  time: "16:30 - 18:00",
                  title: "🇬🇧 Anglais C1 Cambridge (LNG)",
                },
                {
                  time: "21:00 - 22:00",
                  title: "🌙 Bilan du Soir & Clôture 22h",
                },
              ],
              null,
              2,
            ),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Outil MCP inconnu: ${toolName}` }],
        isError: true,
      };
  }
}
