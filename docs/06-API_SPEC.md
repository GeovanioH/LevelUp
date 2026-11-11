# Spécification Exhaustive d'API REST, Schémas Zod, Protocole WebSocket & SDK Client — LevelUp

> **Document ID :** API-LVLUP-006-TITAN  
> **Système :** LevelUp ("The System" / "Le Système")  
> **Version du Document :** 3.0.0 (Spécification de Contrats Exhaustive & Encyclopédique)  
> **Architecture d'Interconnexion :** REST (HTTP/2 JSON API) & Full-Duplex WebSocket (`wss://`)  
> **Statut de Validation :** Approuvé pour Intégration Industrielle  
> **Base URL Production :** `https://api.levelup.local/api/v1`  
> **Base URL Développement :** `http://localhost:3000/api/v1`  
> **Serveur WebSocket Temps Réel :** `wss://api.levelup.local/ws/v1`  
> **Format d'Échange :** UTF-8 JSON strict, IEEE-754 Safe Numbers (BigInt sérialisés en chaînes), RFC 3339 UTC Timestamps  

---

## 1. Conventions Globales d'Architecture, En-têtes HTTP & Contrats d'Échange

### 1.1 Normes de Transport & Sécurité Réseau
L'API REST de LevelUp est conçue selon les spécifications RFC 7231 (HTTP/1.1) et RFC 7540 (HTTP/2), exigeant un chiffrement TLS 1.3 obligatoire sur tous les points d'entrée en production. Aucune communication non chiffrée n'est tolérée par le reverse proxy NGINX / Cloudflare.

#### En-têtes HTTP Standards Requis
* `Authorization` : Format `Bearer <JWT_TOKEN>`. Requis pour tous les appels protégés (hors `/auth/login`).
* `Content-Type` : Doit impérativement être `application/json; charset=utf-8` pour les corps de requêtes JSON, ou `multipart/form-data; boundary=...` pour les fragments audio du module de transcription.
* `Accept` : Doit être `application/json`.
* `X-Request-ID` : Chaîne UUIDv4 unique générée côté client (HUD Web, bot Discord, daemon local). Si omise, le middleware API Gateway (`RequestIdMiddleware`) injecte un UUIDv4 avant le dispatching.
* `X-Client-Version` : Version semver du client appelant (ex: `1.4.2`). Permet au backend de rejeter les clients obsolètes lors de ruptures de schéma avec le code `426 Upgrade Required`.
* `Idempotency-Key` : UUIDv4 ou empreinte SHA-256 obligatoire sur toutes les mutations critiques (`POST /quests/:id/complete`, `POST /shop/purchase`, `POST /skills/:node_id/unlock`, `POST /auth/logout`). Protège contre la duplication d'attribution d'XP ou de débits de Cristaux d'Ombres en cas de coupure réseau ou de retry intempestif.

### 1.2 Structure Normalisée de Réponse Succès (`2xx`)
Toute réponse positive suit scrupuleusement l'enveloppe canonique suivante :
```json
{
  "success": true,
  "data": {
    "resource_type": "player_status",
    "attributes": { ... }
  },
  "meta": {
    "timestamp": "2026-11-11T08:30:00.000Z",
    "request_id": "req_f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "execution_time_ms": 14.8,
    "system_epoch": 1794385800,
    "version": "1.0.0"
  }
}
```

### 1.3 Structure Normalisée de Réponse d'Erreur (`4xx`, `5xx`)
Toute erreur applicative ou de validation est interceptée par le filtre d'exception global (`GlobalExceptionFilter`) et formatée selon le schéma unifié suivant :
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_SHADOW_CRYSTALS",
    "message": "Le solde de Cristaux d'Ombres du joueur est insuffisant pour procéder à cet achat.",
    "status_code": 402,
    "category": "BUSINESS_RULE_VIOLATION",
    "details": [
      {
        "field": "crystal_cost",
        "expected": 500,
        "actual": 320,
        "issue": "Il vous manque 180 Cristaux d'Ombres pour débloquer l'objet 'Anneau de Concentration Ultime'."
      }
    ],
    "help_url": "https://docs.levelup.local/errors/INSUFFICIENT_SHADOW_CRYSTALS"
  },
  "meta": {
    "timestamp": "2026-11-11T08:30:01.120Z",
    "request_id": "req_f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "execution_time_ms": 3.2
  }
}
```

### 1.4 Registre Officiel des Codes d'Erreur Applicatifs
Le tableau ci-dessous recense l'intégralité des 40 codes d'erreur immuables retournés par l'API LevelUp :

| Code d'Erreur | HTTP Status | Catégorie | Description & Action Corrective |
| :--- | :--- | :--- | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Authentification | Nom d'utilisateur ou mot de passe maître invalide. |
| `AUTH_TOKEN_EXPIRED` | 401 | Authentification | Le JWT Access Token a expiré. Appeler `POST /auth/refresh`. |
| `AUTH_TOKEN_REVOKED` | 401 | Authentification | JTI révoqué dans la blacklist Redis suite à une déconnexion. |
| `AUTH_SINGLE_USER_VIOLATION`| 403 | Sécurité | Tentative d'accès par un Discord Snowflake ID non autorisé. |
| `RATE_LIMIT_EXCEEDED` | 429 | Sécurité | Dépassement du quota de requêtes par fenêtre temporelle glissante. |
| `IDEMPOTENCY_CONFLICT` | 409 | Intégrité | Clé d'idempotence en cours de traitement concurrent dans Redis. |
| `PLAYER_NOT_FOUND` | 404 | Ressource | Profil joueur inexistant en base de données. |
| `PLAYER_VITAL_GAUGE_INVALID` | 422 | Validation | HP ou MP en dehors de la plage permise `[0, 100]`. |
| `SKILL_NODE_NOT_FOUND` | 404 | Compétence | L'identifiant de la compétence demandée n'existe pas. |
| `SKILL_PREREQUISITES_UNMET` | 412 | Compétence | Les compétences parentes ou le rang minimum ne sont pas satisfaits. |
| `SKILL_ALREADY_UNLOCKED` | 409 | Compétence | Le nœud est déjà débloqué au niveau maximum pour ce rang. |
| `QUEST_NOT_FOUND` | 404 | Quêtes | Quête introuvable avec l'UUID fourni. |
| `QUEST_ALREADY_COMPLETED` | 409 | Quêtes | Quête déjà validée pour la période courante. |
| `QUEST_DEADLINE_EXPIRED` | 410 | Quêtes | Le délai imparti pour cette quête urgente ou boss est écoulé. |
| `PROOF_TYPE_MISMATCH` | 422 | Quêtes | La preuve fournie ne correspond pas au `proof_type` attendu. |
| `PROOF_VERIFICATION_FAILED` | 400 | Quêtes | La validation automatisée (URL, regex, hachage) a échoué. |
| `PENALTY_ACTIVE_LOCKOUT` | 403 | Pénalité | Action bloquée tant que la quête de pénalité n'est pas purgée. |
| `BLOCK_TIME_OVERLAP` | 409 | Planificateur | Chevauchement temporel avec un bloc horaire existant le même jour. |
| `BLOCK_INVALID_RANGE` | 422 | Planificateur | L'heure de fin est antérieure ou égale à l'heure de début. |
| `NOTE_SLUG_DUPLICATE` | 409 | Cerveau Numérique| Un document Markdown porte déjà ce slug canonique. |
| `NOTE_PAYLOAD_TOO_LARGE` | 413 | Cerveau Numérique| Contenu Markdown dépassant la taille maximale autorisée (2 Mo). |
| `AUDIO_CORRUPT_PAYLOAD` | 400 | Audio | Le conteneur audio WebM/Opus est corrompu ou illisible par FFmpeg. |
| `AUDIO_DURATION_EXCEEDED` | 422 | Audio | La durée enregistrée dépasse le seuil maximum de 600 secondes. |
| `WHISPER_INFERENCE_ERROR` | 502 | IA & Transcrit | Échec du moteur local Faster-Whisper (CUDA OOM ou crash runtime). |
| `GEMINI_UPSTREAM_TIMEOUT` | 504 | IA Architecte | Délai de réponse dépassé lors de l'appel à l'API Google Gemini 2.5 Pro. |
| `ARCHITECT_EVAL_FAILED` | 502 | IA Architecte | Le format JSON retourné par l'Architecte ne respecte pas le Zod Schema. |
| `DEERFLOW_SCRAPE_UNAVAILABLE`| 503 | Deerflow | Le worker de scraping Deerflow est inaccessible ou en maintenance. |
| `DEERFLOW_INVALID_SIGNATURE`| 401 | Deerflow | Signature HMAC-SHA256 du webhook d'opportunités invalide. |
| `SHOP_ITEM_OUT_OF_STOCK` | 409 | Boutique | Récompense épuisée ou indisponible dans la boutique courante. |
| `INSUFFICIENT_SHADOW_CRYSTALS`| 402| Boutique | Solde de Cristaux d'Ombres insuffisant pour valider l'acquisition. |
| `PENALTY_FIREWALL_ERROR` | 500 | Pénalité | Échec de l'application de la règle de redirection DNS/Hosts locale. |
| `OFFLINE_SYNC_VERSION_CONFLICT`| 409| Synchronisation | Conflit de version vectorielle détecté entre Dexie.js et PostgreSQL. |
| `MALFORMED_JSON_PAYLOAD` | 400 | Transport | Le corps de la requête n'est pas un JSON syntaxiquement valide. |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Transport | En-tête `Content-Type` absent ou différent des types acceptés. |
| `DATABASE_CONNECTION_LOST` | 503 | Infrastructure | Pool de connexions PostgreSQL saturé ou base de données injoignable. |
| `REDIS_CACHE_UNAVAILABLE` | 503 | Infrastructure | Nœud Redis primaire injoignable (failover Sentinel en cours). |
| `CIRCUIT_BREAKER_OPEN` | 503 | Résilience | Le circuit breaker protégeant le service distant est ouvert. |
| `INTERNAL_SYSTEM_PANIC` | 500 | Système | Exception non gérée interceptée par le noyau du Système. |
| `FEATURE_FLAG_DISABLED` | 403 | Système | La fonctionnalité sollicitée n'est pas encore activée pour ce rang. |
| `MAINTENANCE_MODE_ACTIVE` | 503 | Système | Plateforme en mode maintenance planifiée pour migration de schéma. |

---

## 2. Définitions Officielles des Contrats Zod TypeScript (`contracts/apiSchemas.ts`)

L'intégralité des flux entrants et sortants de l'API REST et du canal WebSocket est rigoureusement validée par les schémas Zod ci-dessous, partagés entre le frontend React, le backend Fastify/Node.js et le bot Discord :

```typescript
import { z } from 'zod';

// ==============================================================================
// 1. ÉNUMÉRATIONS ET TYPES PRIMITIFS
// ==============================================================================
export const RankCodeSchema = z.enum([
  'F', 'E', 'D', 'C', 'B', 'A', 'S', 'NATION', 'MONARCH'
]);
export type RankCode = z.infer<typeof RankCodeSchema>;

export const BaseStatCodeSchema = z.enum([
  'ACAD',     // Excellence Académique & Algorithmes
  'AI_ENG',   // Ingénierie IA, Hackathons & Projets MVP
  'CYBER',    // Cybersécurité, Pentest & Veille Offensiv
  'EXP',      // Éloquence, Présentation & Réseautage Élite
  'LNG',      // Langues Étrangères (Anglais C1/C2 Cambridge)
  'FIN',      // Stratégie Financière, Bourses & Deerflow
  'STR',      // Puissance Corporelle, Musculation & Calisthénie
  'DIS'       // Discipline Volontaire, Deep Work & Résilience
]);
export type BaseStatCode = z.infer<typeof BaseStatCodeSchema>;

export const QuestTypeSchema = z.enum([
  'DAILY',
  'EMERGENCY',
  'BOSS_RAID',
  'MONK_MODE_SPRINT',
  'PENALTY'
]);
export type QuestType = z.infer<typeof QuestTypeSchema>;

export const QuestStatusSchema = z.enum([
  'AVAILABLE',
  'ACTIVE',
  'SUBMITTED_FOR_REVIEW',
  'COMPLETED',
  'FAILED',
  'EXPIRED'
]);
export type QuestStatus = z.infer<typeof QuestStatusSchema>;

export const ProofTypeSchema = z.enum([
  'NONE',
  'URL_OR_LINK',
  'MARKDOWN_TEXT',
  'AUDIO_MONOLOGUE',
  'LOCAL_FILE_PATH',
  'SYSTEM_TELEMETRY'
]);
export type ProofType = z.infer<typeof ProofTypeSchema>;

export const ShopCategorySchema = z.enum([
  'DIGITAL_TOOLS_AND_SUBSCRIPTIONS',
  'HARDWARE_AND_PHYSICAL_EQUIPMENT',
  'LEISURE_AND_HIGH_VALUE_REWARD',
  'DONATION_AND_ALTRUISM'
]);
export type ShopCategory = z.infer<typeof ShopCategorySchema>;

export const OpportunityStatusSchema = z.enum([
  'NEW_DISCOVERED',
  'BOOKMARKED',
  'APPLICATION_IN_PROGRESS',
  'SUBMITTED',
  'ACCEPTED',
  'REJECTED',
  'ARCHIVED'
]);
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;

// ==============================================================================
// 2. SCHÉMAS AUTHENTIFICATION & SESSION
// ==============================================================================
export const LoginRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
  device_fingerprint: z.string().min(16).max(256).optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const TokenPairResponseSchema = z.object({
  access_token: z.string().min(20),
  refresh_token: z.string().min(20),
  token_type: z.literal('Bearer'),
  expires_in_seconds: z.number().int().positive(),
  player: z.object({
    id: z.string().uuid(),
    username: z.string(),
    discord_snowflake_id: z.string(),
    role: z.string(),
  }),
});
export type TokenPairResponse = z.infer<typeof TokenPairResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string().min(20),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// ==============================================================================
// 3. SCHÉMAS PROFIL DU JOUEUR & STATISTIQUES
// ==============================================================================
export const VitalGaugeSchema = z.object({
  current: z.number().int().min(0).max(100),
  max: z.number().int().default(100),
  status_label: z.string(),
  last_updated: z.string().datetime(),
});

export const BaseStatSummarySchema = z.object({
  code: BaseStatCodeSchema,
  name: z.string(),
  level: z.number().int().min(1).max(100),
  current_xp: z.number().int().min(0),
  xp_for_current_level: z.number().int().min(0),
  xp_for_next_level: z.number().int().min(1),
  progress_percentage: z.number().min(0).max(100),
  mastery_title: z.string(),
});

export const PlayerStatusResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  current_level: z.number().int().min(1).max(100),
  total_xp: z.string(), // Dérivé BigInt
  shadow_crystals_balance: z.number().int().min(0),
  active_penalty: z.boolean(),
  rank: z.object({
    code: RankCodeSchema,
    name: z.string(),
    min_level_required: z.number().int(),
    next_rank: RankCodeSchema.nullable(),
    xp_to_next_rank: z.string().nullable(),
    progress_to_next_rank_pct: z.number().min(0).max(100),
  }),
  vital_gauges: z.object({
    hp: VitalGaugeSchema,
    mp: VitalGaugeSchema,
  }),
  stats: z.array(BaseStatSummarySchema).length(8),
  unclaimed_rewards_count: z.number().int().min(0),
  active_quests_count: z.number().int().min(0),
  streak_days: z.number().int().min(0),
});
export type PlayerStatusResponse = z.infer<typeof PlayerStatusResponseSchema>;

export const UpdateVitalGaugesRequestSchema = z.object({
  hp: z.number().int().min(0).max(100).optional(),
  mp: z.number().int().min(0).max(100).optional(),
  reason: z.string().min(3).max(255),
});
export type UpdateVitalGaugesRequest = z.infer<typeof UpdateVitalGaugesRequestSchema>;

// ==============================================================================
// 4. SCHÉMAS ARBRE DE COMPÉTENCES
// ==============================================================================
export const SkillNodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(50),
  base_stat: BaseStatCodeSchema,
  name: z.string().min(2).max(100),
  tier: z.number().int().min(1).max(5),
  description: z.string().min(10).max(1000),
  prerequisite_node_ids: z.array(z.string().uuid()),
  is_unlocked: z.boolean(),
  current_level: z.number().int().min(0).max(10),
  max_level: z.number().int().min(1).max(10),
  xp_investment_cost: z.number().int().positive(),
  concrete_learning_resources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      type: z.enum(['DOCUMENTATION', 'COURSE', 'LAB', 'CERTIFICATION']),
    })
  ),
});
export type SkillNode = z.infer<typeof SkillNodeSchema>;

export const SkillTreeResponseSchema = z.object({
  base_stat: BaseStatCodeSchema,
  total_nodes: z.number().int(),
  unlocked_nodes_count: z.number().int(),
  nodes: z.array(SkillNodeSchema),
});

export const UnlockSkillNodeRequestSchema = z.object({
  node_id: z.string().uuid(),
  validation_proof_url: z.string().url().optional(),
});

// ==============================================================================
// 5. SCHÉMAS QUÊTES DU SYSTÈME
// ==============================================================================
export const QuestSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  type: QuestTypeSchema,
  target_stat: BaseStatCodeSchema,
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(3000),
  status: QuestStatusSchema,
  proof_type: ProofTypeSchema,
  proof_instructions: z.string().max(1000),
  reward_player_xp: z.number().int().nonnegative(),
  reward_stat_xp: z.number().int().nonnegative(),
  reward_shadow_crystals: z.number().int().nonnegative(),
  time_limit_minutes: z.number().int().positive().nullable(),
  deadline_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});
export type Quest = z.infer<typeof QuestSchema>;

export const SubmitQuestProofRequestSchema = z.object({
  proof_type: ProofTypeSchema,
  proof_data: z.string().min(1).max(10000),
  student_reflection: z.string().max(2000).optional(),
});
export type SubmitQuestProofRequest = z.infer<typeof SubmitQuestProofRequestSchema>;

export const CompleteQuestResponseSchema = z.object({
  quest_id: z.string().uuid(),
  quest_title: z.string(),
  status: z.literal('COMPLETED'),
  rewards_awarded: z.object({
    player_xp: z.number().int().positive(),
    stat_code: BaseStatCodeSchema,
    stat_xp: z.number().int().positive(),
    shadow_crystals: z.number().int().nonnegative(),
  }),
  progression_summary: z.object({
    previous_level: z.number().int(),
    current_level: z.number().int(),
    level_up_triggered: z.boolean(),
    previous_rank: RankCodeSchema,
    current_rank: RankCodeSchema,
    rank_up_triggered: z.boolean(),
  }),
  system_evaluation: z.object({
    architect_score: z.number().min(0).max(20).nullable(),
    critique_feedback: z.string().nullable(),
  }),
  holographic_banner_message: z.string(),
});
export type CompleteQuestResponse = z.infer<typeof CompleteQuestResponseSchema>;

// ==============================================================================
// 6. SCHÉMAS PLANIFICATEUR TEMPOREL (TIME-BLOCKING)
// ==============================================================================
export const TimeBlockSchema = z.object({
  id: z.string().uuid(),
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  title: z.string().min(2).max(150),
  target_stat: BaseStatCodeSchema,
  is_completed: z.boolean(),
  notes: z.string().max(1000).nullable(),
});
export type TimeBlock = z.infer<typeof TimeBlockSchema>;

export const CreateTimeBlockRequestSchema = z.object({
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  title: z.string().min(2).max(150),
  target_stat: BaseStatCodeSchema,
  notes: z.string().max(1000).optional(),
}).refine((data) => data.end_time > data.start_time, {
  message: "L'heure de fin doit être strictement supérieure à l'heure de début.",
  path: ['end_time'],
});

export const BatchCreateTimeBlocksRequestSchema = z.object({
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  blocks: z.array(CreateTimeBlockRequestSchema).min(1).max(24),
});

export const ToggleTimeBlockResponseSchema = z.object({
  block_id: z.string().uuid(),
  is_completed: z.boolean(),
  xp_granted: z.number().int().nonnegative(),
  stat_boosted: BaseStatCodeSchema,
  updated_at: z.string().datetime(),
});

// ==============================================================================
// 7. SCHÉMAS CERVEAU NUMÉRIQUE & NOTES MARKDOWN
// ==============================================================================
export const NoteSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(2).max(150),
  title: z.string().min(1).max(200),
  file_path: z.string(),
  content_markdown: z.string().max(2000000), // Max 2 MB
  related_stat: BaseStatCodeSchema.nullable(),
  tags: z.array(z.string().min(1).max(50)),
  backlinks: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Note = z.infer<typeof NoteSchema>;

export const UpsertNoteRequestSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  content_markdown: z.string().min(1).max(2000000),
  related_stat: BaseStatCodeSchema.optional(),
  tags: z.array(z.string()).default([]),
});

export const NoteSearchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  stat: BaseStatCodeSchema.optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ==============================================================================
// 8. SCHÉMAS AUDIO & TRANSCRIPTION LOCALE
// ==============================================================================
export const AudioUploadChunkResponseSchema = z.object({
  session_id: z.string().uuid(),
  chunk_index: z.number().int().nonnegative(),
  bytes_received: z.number().int().positive(),
  status: z.enum(['RECEIVING', 'COMPLETED_WAITING_FINALIZATION']),
});

export const FinalizeAudioTranscriptionRequestSchema = z.object({
  session_id: z.string().uuid(),
  audio_mime_type: z.enum(['audio/webm;codecs=opus', 'audio/wav', 'audio/ogg']),
  target_stat_hint: BaseStatCodeSchema.optional(),
  auto_generate_note: z.boolean().default(true),
  auto_evaluate_by_architect: z.boolean().default(true),
});

export const AudioTranscriptionResultSchema = z.object({
  transcription_id: z.string().uuid(),
  duration_seconds: z.number().int().nonnegative(),
  raw_transcript: z.string().min(1),
  detected_language: z.literal('fr').or(z.literal('en')),
  executive_summary: z.string(),
  architect_evaluation: z.object({
    score_out_of_20: z.number().min(0).max(20),
    critique: z.string(),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    awarded_xp: z.number().int().nonnegative(),
    attributed_stat: BaseStatCodeSchema,
  }).nullable(),
  generated_note: z.object({
    note_id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    file_path: z.string(),
  }).nullable(),
});

// ==============================================================================
// 9. SCHÉMAS IA ARCHITECTE (ÉVALUATION & GÉNÉRATION)
// ==============================================================================
export const EvaluateMonologueRequestSchema = z.object({
  transcript_text: z.string().min(20).max(50000),
  target_topic: z.string().min(2).max(100),
  subject_stat: BaseStatCodeSchema,
  academic_context: z.string().max(500).optional(),
});

export const ArchitectEvaluationResponseSchema = z.object({
  evaluation_id: z.string().uuid(),
  rubric_breakdown: z.object({
    accuracy_and_depth: z.number().min(0).max(6),
    structure_and_clarity: z.number().min(0).max(5),
    technical_vocabulary: z.number().min(0).max(4),
    practical_application: z.number().min(0).max(5),
  }),
  total_score: z.number().min(0).max(20),
  is_approved: z.boolean(),
  holographic_commentary: z.string(),
  recommended_remedial_actions: z.array(z.string()),
  xp_calculated: z.number().int().nonnegative(),
});

export const GenerateDailyPackRequestSchema = z.object({
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  force_regenerate: z.boolean().default(false),
  user_focus_preference: BaseStatCodeSchema.optional(),
});

// ==============================================================================
// 10. SCHÉMAS OPPORTUNITÉS & BOURSES (DEERFLOW)
// ==============================================================================
export const DeerflowWebhookPayloadSchema = z.object({
  event: z.literal('OPPORTUNITY_SCRAPED'),
  opportunity: z.object({
    external_id: z.string().min(1),
    title: z.string().min(3).max(250),
    source_domain: z.string().url(),
    category: z.enum(['SCHOLARSHIP', 'HACKATHON', 'STUDENT_BENEFIT', 'EXCHANGE_PROGRAM']),
    monetary_value_eur: z.number().int().nullable(),
    deadline_iso: z.string().datetime(),
    eligibility_criteria: z.array(z.string()),
    application_url: z.string().url(),
    relevance_score: z.number().min(0).max(100),
  }),
  signature: z.string().min(64).max(64), // HMAC-SHA256 hex
});

export const QueryOpportunitiesRequestSchema = z.object({
  category: z.enum(['SCHOLARSHIP', 'HACKATHON', 'STUDENT_BENEFIT', 'EXCHANGE_PROGRAM']).optional(),
  min_value_eur: z.coerce.number().int().optional(),
  deadline_before: z.string().datetime().optional(),
  status: OpportunityStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ==============================================================================
// 11. SCHÉMAS BOUTIQUE DES OMBRES & ÉCONOMIE
// ==============================================================================
export const ShopCatalogItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(500),
  category: ShopCategorySchema,
  crystal_cost: z.number().int().positive(),
  min_rank_required: RankCodeSchema,
  image_url: z.string().url().nullable(),
  is_available: z.boolean(),
});

export const PurchaseItemRequestSchema = z.object({
  item_id: z.string().uuid(),
  justification_notes: z.string().max(500).optional(),
});

export const PurchaseItemResponseSchema = z.object({
  transaction_id: z.string().uuid(),
  item_id: z.string().uuid(),
  item_name: z.string(),
  crystals_deducted: z.number().int().positive(),
  remaining_balance: z.number().int().nonnegative(),
  redemption_code: z.string().nullable(),
  delivery_instructions: z.string(),
  purchased_at: z.string().datetime(),
});

// ==============================================================================
// 12. SCHÉMAS PROTOCOLE DE PÉNALITÉ & SYNCHRONISATION
// ==============================================================================
export const PenaltyStatusResponseSchema = z.object({
  is_penalty_active: z.boolean(),
  active_penalty_quest: QuestSchema.nullable(),
  triggered_at: z.string().datetime().nullable(),
  time_remaining_seconds: z.number().int().nullable(),
  firewall_status: z.object({
    hosts_injection_active: z.boolean(),
    blocked_domains: z.array(z.string()),
    router_iptables_state: z.string(),
  }),
});

export const SyncPushRequestSchema = z.object({
  client_id: z.string().uuid(),
  last_sync_timestamp: z.string().datetime(),
  mutations: z.array(
    z.object({
      entity_type: z.enum(['notes', 'time_blocks', 'offline_quest_submissions']),
      action: z.enum(['INSERT', 'UPDATE', 'DELETE']),
      entity_id: z.string().uuid(),
      data: z.record(z.any()),
      client_timestamp: z.string().datetime(),
    })
  ).max(500),
});

export const SyncPullResponseSchema = z.object({
  server_timestamp: z.string().datetime(),
  has_conflicts: z.boolean(),
  delta: z.object({
    notes: z.array(NoteSchema),
    time_blocks: z.array(TimeBlockSchema),
    quests: z.array(QuestSchema),
    player_status: PlayerStatusResponseSchema,
  }),
});
```

---

## 3. Catalogue Exhaustif des Endpoints REST

Ci-dessous la spécification détaillée de chacun des endpoints exposés par l'API LevelUp, incluant les méthodes, chemins, autorisations, requêtes complètes, réponses réussies (`200 OK` / `201 Created`) et erreurs prévisibles.

---

### 3.1 Authentification & Gestion de Session

#### 3.1.1 `POST /auth/login`
Authentifie le joueur unique (Maître / Monarque) et initialise une session sécurisée.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/auth/login`
* **Authentification Requise :** Aucune (Public)
* **Rate Limit :** 5 requêtes par minute (IP glissante)
* **En-têtes Requête :**
  ```http
  Content-Type: application/json
  X-Request-ID: d5b4c10a-6e21-4f8a-a1b2-c3d4e5f6a7b8
  ```
* **Corps de Requête (`LoginRequest`) :**
  ```json
  {
    "username": "Huriel",
    "password": "MasterSecureSoloLeveling2026!#",
    "device_fingerprint": "fp_chrome_win11_desktop_a8f902c31d8e4"
  }
  ```
* **Réponse Succès `200 OK` (`TokenPairResponse`) :**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNWQ4Yjc0Zi05ZTMyLTRkMmItOThmNS0xOWU0OGYwMjlhMWIiLCJyb2xlIjoiTU9OQVJDSE9XTkVSIiwianRpIjoiMjgxYTlkOWQtMmNkNC00ZGU2LTkwNTUtMzA1MmRiNWZhYzA4IiwiaWF0IjoxNzk0Mzg1ODAwLCJleHAiOjE3OTQzODk0MDB9.SIGNATURE",
      "refresh_token": "rt_8f19ac23d04e5781a89b01c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3",
      "token_type": "Bearer",
      "expires_in_seconds": 3600,
      "player": {
        "id": "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
        "username": "Huriel",
        "discord_snowflake_id": "789123456789012345",
        "role": "MONARCH_OWNER"
      }
    },
    "meta": {
      "timestamp": "2026-11-11T08:30:00.000Z",
      "request_id": "d5b4c10a-6e21-4f8a-a1b2-c3d4e5f6a7b8",
      "execution_time_ms": 42.1
    }
  }
  ```
* **En-têtes HTTP de Réponse :**
  ```http
  Set-Cookie: session_refresh=rt_8f19ac...; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
  ```
* **Codes d'Erreurs Possibles :**
  * `400 Bad Request` : `MALFORMED_JSON_PAYLOAD` si le JSON est invalide.
  * `401 Unauthorized` : `AUTH_INVALID_CREDENTIALS` si les identifiants sont erronés.
  * `429 Too Many Requests` : `RATE_LIMIT_EXCEEDED` en cas de tentatives excessives.

---

#### 3.1.2 `POST /auth/refresh`
Génère une nouvelle paire de tokens à partir du jeton de rafraîchissement.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/auth/refresh`
* **Authentification Requise :** Cookie HttpOnly ou corps JSON
* **Corps de Requête :**
  ```json
  {
    "refresh_token": "rt_8f19ac23d04e5781a89b01c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3"
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "rt_99e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8",
      "token_type": "Bearer",
      "expires_in_seconds": 3600
    },
    "meta": {
      "timestamp": "2026-11-11T09:30:00.000Z",
      "request_id": "c1a2b3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "execution_time_ms": 11.2
    }
  }
  ```
* **Codes d'Erreurs :**
  * `401 Unauthorized` : `AUTH_TOKEN_EXPIRED`, `AUTH_TOKEN_REVOKED`.

---

#### 3.1.3 `POST /auth/logout`
Révoque la session active et inscrit le JTI du JWT dans la liste d'invalidation Redis.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/auth/logout`
* **Authentification Requise :** `Bearer <JWT>`
* **Corps de Requête :** `{}`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "message": "Déconnexion réussie. La session a été révoquée sur tous les récepteurs."
    },
    "meta": {
      "timestamp": "2026-11-11T12:00:00.000Z",
      "request_id": "a9b8c7d6-e5f4-4321-abcd-ef0123456789",
      "execution_time_ms": 6.4
    }
  }
  ```

---

### 3.2 Profil Joueur, Jauges Vitales & Statistiques

#### 3.2.1 `GET /player/status`
Retourne la photographie temps réel complète du joueur, ses jauges, son rang et les 8 bases de vie.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/player/status`
* **Authentification Requise :** `Bearer <JWT>`
* **Réponse Succès `200 OK` (`PlayerStatusResponse`) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
      "username": "Huriel",
      "current_level": 14,
      "total_xp": "18450",
      "shadow_crystals_balance": 820,
      "active_penalty": false,
      "rank": {
        "code": "D",
        "name": "Chasseur Confirmé",
        "min_level_required": 10,
        "next_rank": "C",
        "xp_to_next_rank": "22500",
        "progress_to_next_rank_pct": 82.0
      },
      "vital_gauges": {
        "hp": {
          "current": 88,
          "max": 100,
          "status_label": "REPOS OPTIMAL (7h45 de sommeil)",
          "last_updated": "2026-11-11T07:15:00.000Z"
        },
        "mp": {
          "current": 65,
          "max": 100,
          "status_label": "CONCENTRATION SOUTENUE",
          "last_updated": "2026-11-11T08:00:00.000Z"
        }
      },
      "stats": [
        {
          "code": "ACAD",
          "name": "Excellence Académique & Algorithmes",
          "level": 15,
          "current_xp": 1450,
          "xp_for_current_level": 1200,
          "xp_for_next_level": 1800,
          "progress_percentage": 41.67,
          "mastery_title": "Major de Promotion Prétendant"
        },
        {
          "code": "AI_ENG",
          "name": "Ingénierie IA, Hackathons & Projets MVP",
          "level": 16,
          "current_xp": 1920,
          "xp_for_current_level": 1500,
          "xp_for_next_level": 2200,
          "progress_percentage": 60.0,
          "mastery_title": "Architecte de Réseaux Neuronaux"
        },
        {
          "code": "CYBER",
          "name": "Cybersécurité, Pentest & Veille Offensive",
          "level": 12,
          "current_xp": 950,
          "xp_for_current_level": 800,
          "xp_for_next_level": 1400,
          "progress_percentage": 25.0,
          "mastery_title": "Opérateur TryHackMe Top 5%"
        },
        {
          "code": "EXP",
          "name": "Éloquence, Présentation & Réseautage Élite",
          "level": 11,
          "current_xp": 720,
          "xp_for_current_level": 600,
          "xp_for_next_level": 1100,
          "progress_percentage": 24.0,
          "mastery_title": "Pitcher de Haut Vol"
        },
        {
          "code": "LNG",
          "name": "Langues Étrangères (Anglais C1 Cambridge)",
          "level": 13,
          "current_xp": 1100,
          "xp_for_current_level": 900,
          "xp_for_next_level": 1500,
          "progress_percentage": 33.33,
          "mastery_title": "Bilingue Professionnel C1"
        },
        {
          "code": "FIN",
          "name": "Stratégie Financière, Bourses & Deerflow",
          "level": 10,
          "current_xp": 500,
          "xp_for_current_level": 400,
          "xp_for_next_level": 900,
          "progress_percentage": 20.0,
          "mastery_title": "Chasseur de Subventions"
        },
        {
          "code": "STR",
          "name": "Puissance Corporelle, Musculation & Calisthénie",
          "level": 14,
          "current_xp": 1300,
          "xp_for_current_level": 1100,
          "xp_for_next_level": 1700,
          "progress_percentage": 33.33,
          "mastery_title": "Athlète du Système (100 Pompes/100 Abdos)"
        },
        {
          "code": "DIS",
          "name": "Discipline Volontaire, Deep Work & Résilience",
          "level": 17,
          "current_xp": 2350,
          "xp_for_current_level": 2000,
          "xp_for_next_level": 2700,
          "progress_percentage": 50.0,
          "mastery_title": "Volonté Inébranlable (Monk Mode)"
        }
      ],
      "unclaimed_rewards_count": 2,
      "active_quests_count": 3,
      "streak_days": 18
    },
    "meta": {
      "timestamp": "2026-11-11T08:31:00.000Z",
      "request_id": "f8e7d6c5-b4a3-4210-9876-543210fedcba",
      "execution_time_ms": 8.7
    }
  }
  ```

---

#### 3.2.2 `PATCH /player/vital-gauges`
Ajuste les points de vie (HP) ou d'énergie mentale (MP) suite à un événement biologique (réveil, séance de code intense, méditation).
* **Méthode :** `PATCH`
* **Chemin :** `/api/v1/player/vital-gauges`
* **Authentification Requise :** `Bearer <JWT>`
* **Corps de Requête :**
  ```json
  {
    "hp": 92,
    "mp": 45,
    "reason": "Séance Deep Work de 3h terminée sur module Faster-Whisper. Consommation de 20 MP."
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "hp": { "current": 92, "max": 100, "status_label": "PLEINE FORME PHYSIQUE" },
      "mp": { "current": 45, "max": 100, "status_label": "FATIGUE COGNITIVE MODÉRÉE (Repos suggéré)" },
      "updated_at": "2026-11-11T11:45:00.000Z"
    },
    "meta": {
      "timestamp": "2026-11-11T11:45:00.100Z",
      "request_id": "d1c2b3a4-0987-4fed-cba9-1234567890ab",
      "execution_time_ms": 5.9
    }
  }
  ```

---

### 3.3 Arbre de Compétences (Skill Tree)

#### 3.3.1 `GET /skills/tree`
Retourne la hiérarchie complète des nœuds pour une base donnée ou l'intégralité des 8 bases.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/skills/tree?base_stat=AI_ENG`
* **Paramètres de Requête :**
  * `base_stat` (optionnel) : Code parmi les 8 bases de vie. Si absent, retourne toutes les bases.
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "base_stat": "AI_ENG",
      "total_nodes": 15,
      "unlocked_nodes_count": 6,
      "nodes": [
        {
          "id": "e1f2a3b4-5678-490a-bcde-f01234567890",
          "code": "AI_ENG_T1_PYTHON_CORE",
          "base_stat": "AI_ENG",
          "name": "Python 3.12 Moderne & Typage Stricte",
          "tier": 1,
          "description": "Maîtrise des protocoles, générateurs, async/await et validation Pydantic v2.",
          "prerequisite_node_ids": [],
          "is_unlocked": true,
          "current_level": 5,
          "max_level": 5,
          "xp_investment_cost": 500,
          "concrete_learning_resources": [
            {
              "title": "Documentation Officielle Python Typing",
              "url": "https://docs.python.org/3/library/typing.html",
              "type": "DOCUMENTATION"
            }
          ]
        },
        {
          "id": "f2a3b4c5-6789-401b-cdef-012345678901",
          "code": "AI_ENG_T2_FASTER_WHISPER",
          "base_stat": "AI_ENG",
          "name": "Moteurs STT Locaux & Inférence CTranslate2",
          "tier": 2,
          "description": "Intégration de Faster-Whisper, quantification INT8 et gestion des streams VAD Silero.",
          "prerequisite_node_ids": ["e1f2a3b4-5678-490a-bcde-f01234567890"],
          "is_unlocked": true,
          "current_level": 2,
          "max_level": 5,
          "xp_investment_cost": 850,
          "concrete_learning_resources": [
            {
              "title": "Dépôt GitHub SYSTRAN/faster-whisper",
              "url": "https://github.com/SYSTRAN/faster-whisper",
              "type": "LAB"
            }
          ]
        }
      ]
    },
    "meta": {
      "timestamp": "2026-11-11T08:35:00.000Z",
      "request_id": "b3c4d5e6-789a-4bc0-def1-234567890abc",
      "execution_time_ms": 13.5
    }
  }
  ```

---

#### 3.3.2 `POST /skills/:node_id/unlock`
Débloque ou monte de niveau un nœud de compétence en déduisant les prérequis d'expérience.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/skills/e1f2a3b4-5678-490a-bcde-f01234567890/unlock`
* **En-têtes Requête :**
  ```http
  Authorization: Bearer <JWT>
  Idempotency-Key: idem_skill_unlock_9012a4b5
  ```
* **Corps de Requête :**
  ```json
  {
    "node_id": "e1f2a3b4-5678-490a-bcde-f01234567890",
    "validation_proof_url": "https://github.com/GeovanioH/LevelUp/commit/365eed2"
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "node_id": "e1f2a3b4-5678-490a-bcde-f01234567890",
      "node_code": "AI_ENG_T1_PYTHON_CORE",
      "new_node_level": 5,
      "xp_deducted": 200,
      "stat_code": "AI_ENG",
      "new_stat_xp": 2120,
      "unlocked_perk": "Accès aux algorithmes d'optimisation d'inférence GPU"
    },
    "meta": {
      "timestamp": "2026-11-11T08:36:00.000Z",
      "request_id": "a1b2c3d4-e5f6-4789-0abc-def123456789",
      "execution_time_ms": 28.4
    }
  }
  ```

---

### 3.4 Système de Quêtes (Quests Engine)

#### 3.4.1 `GET /quests/daily`
Retourne les quêtes journalières assignées pour la date en cours.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/quests/daily`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-11-11",
      "quests": [
        {
          "id": "q1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "code": "DAILY_FIT_100_CORPS",
          "type": "DAILY",
          "target_stat": "STR",
          "title": "[Quête Journalière] L'Entraînement de Sung Jin-Woo",
          "description": "Exécuter sans défaillir : 100 pompes, 100 abdominaux, 100 squats et 10 km de course.",
          "status": "AVAILABLE",
          "proof_type": "SYSTEM_TELEMETRY",
          "proof_instructions": "Validation automatique via capteur connecté ou déclaration horodatée.",
          "reward_player_xp": 200,
          "reward_stat_xp": 250,
          "reward_shadow_crystals": 15,
          "time_limit_minutes": 960,
          "deadline_at": "2026-11-11T22:00:00.000Z"
        },
        {
          "id": "q2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
          "code": "DAILY_CYBER_ROOM_THM",
          "type": "DAILY",
          "target_stat": "CYBER",
          "title": "[Quête Journalière] Infiltration & Veille Sécurité",
          "description": "Compléter 1 room Medium sur TryHackMe ou HackTheBox et extraire le flag utilisateur.",
          "status": "ACTIVE",
          "proof_type": "URL_OR_LINK",
          "proof_instructions": "Lien public vers le badge de complétion TryHackMe ou write-up chiffré.",
          "reward_player_xp": 180,
          "reward_stat_xp": 220,
          "reward_shadow_crystals": 20,
          "time_limit_minutes": 180,
          "deadline_at": "2026-11-11T20:00:00.000Z"
        }
      ]
    },
    "meta": {
      "timestamp": "2026-11-11T08:40:00.000Z",
      "request_id": "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      "execution_time_ms": 7.1
    }
  }
  ```

---

#### 3.4.2 `POST /quests/:id/submit-proof`
Soumet un élément de preuve (URL, texte Markdown, chemin de fichier ou transcript) pour validation par le Système ou l'Architecte.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/quests/q2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d/submit-proof`
* **Corps de Requête (`SubmitQuestProofRequest`) :**
  ```json
  {
    "proof_type": "URL_OR_LINK",
    "proof_data": "https://tryhackme.com/room/bufferoverflowprep?completed=true#flag-thm-89021a",
    "student_reflection": "Excellente pratique sur la réécriture du registre EIP. Exploitation réussie avec payload personnalisé."
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "quest_id": "q2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
      "status": "SUBMITTED_FOR_REVIEW",
      "message": "Preuve enregistrée avec succès. L'évaluation automatisée de l'Architecte est en cours."
    },
    "meta": {
      "timestamp": "2026-11-11T14:30:00.000Z",
      "request_id": "b4a3c2d1-e5f6-4789-9876-0123456789ab",
      "execution_time_ms": 15.3
    }
  }
  ```

---

#### 3.4.3 `POST /quests/:id/complete`
Déclenche la transaction d'attribution des récompenses, la vérification du level up et l'émission des sons & notifications Solo Leveling.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/quests/q2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d/complete`
* **En-têtes Requête :**
  ```http
  Authorization: Bearer <JWT>
  Idempotency-Key: idem_quest_complete_q2b3c4d5
  ```
* **Corps de Requête :**
  ```json
  {
    "proof_type": "URL_OR_LINK",
    "proof_data": "https://tryhackme.com/room/bufferoverflowprep"
  }
  ```
* **Réponse Succès `200 OK` (`CompleteQuestResponse`) :**
  ```json
  {
    "success": true,
    "data": {
      "quest_id": "q2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
      "quest_title": "[Quête Journalière] Infiltration & Veille Sécurité",
      "status": "COMPLETED",
      "rewards_awarded": {
        "player_xp": 180,
        "stat_code": "CYBER",
        "stat_xp": 220,
        "shadow_crystals": 20
      },
      "progression_summary": {
        "previous_level": 14,
        "current_level": 14,
        "level_up_triggered": false,
        "previous_rank": "D",
        "current_rank": "D",
        "rank_up_triggered": false
      },
      "system_evaluation": {
        "architect_score": 19.5,
        "critique_feedback": "Exécution rigoureuse de la quête. Maîtrise confirmée des débordements de tampon."
      },
      "holographic_banner_message": "[QUÊTE ACCOMPLIE] Les récompenses ont été transférées dans votre inventaire d'Ombre."
    },
    "meta": {
      "timestamp": "2026-11-11T14:32:00.000Z",
      "request_id": "c5d6e7f8-a9b0-4123-9876-fedcba098765",
      "execution_time_ms": 34.6
    }
  }
  ```

---

### 3.5 Planificateur Horaire (Time-Blocking)

#### 3.5.1 `GET /planner/days/:date`
Récupère tous les blocs horaires programmés pour une date donnée.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/planner/days/2026-11-11`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-11-11",
      "total_blocks": 5,
      "completed_blocks": 2,
      "blocks": [
        {
          "id": "b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
          "block_date": "2026-11-11",
          "start_time": "06:30",
          "end_time": "07:30",
          "title": "Entraînement Physique Sung Jin-Woo (Pompes, Abdos, Squats)",
          "target_stat": "STR",
          "is_completed": true,
          "notes": "100 pompes d'affilée validées à 07:15."
        },
        {
          "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
          "block_date": "2026-11-11",
          "start_time": "08:30",
          "end_time": "11:30",
          "title": "Deep Work IA — Pipeline Faster-Whisper & Zod Contracts",
          "target_stat": "AI_ENG",
          "is_completed": true,
          "notes": "Spécification d'API 06 terminée."
        },
        {
          "id": "b3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
          "block_date": "2026-11-11",
          "start_time": "14:00",
          "end_time": "16:00",
          "title": "Révisions Algorithmique des Graphes & Arbres Rouges-Noirs",
          "target_stat": "ACAD",
          "is_completed": false,
          "notes": "Préparation du partiel de structures de données."
        }
      ]
    },
    "meta": {
      "timestamp": "2026-11-11T12:00:00.000Z",
      "request_id": "f1e2d3c4-b5a6-4789-9876-0123456789ab",
      "execution_time_ms": 6.8
    }
  }
  ```

---

#### 3.5.2 `POST /planner/blocks`
Crée un nouveau bloc horaire avec vérification de non-chevauchement.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/planner/blocks`
* **Corps de Requête (`CreateTimeBlockRequest`) :**
  ```json
  {
    "block_date": "2026-11-11",
    "start_time": "16:30",
    "end_time": "18:00",
    "title": "Pratique Anglais C1 Cambridge — Speaking & Monologue",
    "target_stat": "LNG",
    "notes": "Sujet : Éthique des modèles de fondation en vision par ordinateur."
  }
  ```
* **Réponse Succès `201 Created` :**
  ```json
  {
    "success": true,
    "data": {
      "id": "b4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      "block_date": "2026-11-11",
      "start_time": "16:30",
      "end_time": "18:00",
      "title": "Pratique Anglais C1 Cambridge — Speaking & Monologue",
      "target_stat": "LNG",
      "is_completed": false,
      "created_at": "2026-11-11T12:05:00.000Z"
    },
    "meta": {
      "timestamp": "2026-11-11T12:05:00.050Z",
      "request_id": "a9b8c7d6-e5f4-4321-abcd-ef0123456789",
      "execution_time_ms": 14.2
    }
  }
  ```

---

#### 3.5.3 `PATCH /planner/blocks/:id/toggle`
Bascule l'état d'accomplissement d'un bloc horaire et crédite l'expérience associée.
* **Méthode :** `PATCH`
* **Chemin :** `/api/v1/planner/blocks/b4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a/toggle`
* **Corps de Requête :** `{}`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "block_id": "b4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      "is_completed": true,
      "xp_granted": 75,
      "stat_boosted": "LNG",
      "updated_at": "2026-11-11T18:00:00.000Z"
    },
    "meta": {
      "timestamp": "2026-11-11T18:00:00.020Z",
      "request_id": "b1c2d3e4-f5a6-4789-9876-fedcba987654",
      "execution_time_ms": 18.9
    }
  }
  ```

---

### 3.6 Cerveau Numérique & Gestionnaire Markdown (Second Brain)

#### 3.6.1 `GET /notes`
Recherche et liste les fiches de connaissances avec recherche plein texte et filtrage par base.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/notes?query=transformer&stat=AI_ENG&limit=10`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "total_matches": 1,
      "notes": [
        {
          "id": "n1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
          "slug": "mecanismes-attention-transformers",
          "title": "Mécanismes d'Attention Multi-Têtes & Architecture Transformers",
          "file_path": "vault/AI_ENG/mecanismes-attention-transformers.md",
          "related_stat": "AI_ENG",
          "tags": ["deep-learning", "transformers", "nlp", "attention"],
          "backlinks": ["architecture-gpt", "optimisation-ctranslate2"],
          "updated_at": "2026-11-10T19:30:00.000Z"
        }
      ]
    },
    "meta": {
      "timestamp": "2026-11-11T09:00:00.000Z",
      "request_id": "c4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f",
      "execution_time_ms": 11.4
    }
  }
  ```

---

#### 3.6.2 `POST /notes`
Crée ou met à jour une fiche dans le coffre-fort local et la base de données.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/notes`
* **Corps de Requête (`UpsertNoteRequest`) :**
  ```json
  {
    "title": "Moteur Faster-Whisper : Quantification INT8 et Optimisations VAD",
    "slug": "faster-whisper-quantification-int8",
    "related_stat": "AI_ENG",
    "tags": ["audio", "whisper", "speech-to-text", "optimisation"],
    "content_markdown": "# Moteur Faster-Whisper : Quantification INT8\n\nL'utilisation de CTranslate2 permet une réduction de 4x de l'empreinte mémoire..."
  }
  ```
* **Réponse Succès `201 Created` :**
  ```json
  {
    "success": true,
    "data": {
      "id": "n2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
      "slug": "faster-whisper-quantification-int8",
      "title": "Moteur Faster-Whisper : Quantification INT8 et Optimisations VAD",
      "file_path": "vault/AI_ENG/faster-whisper-quantification-int8.md",
      "related_stat": "AI_ENG",
      "tags": ["audio", "whisper", "speech-to-text", "optimisation"],
      "created_at": "2026-11-11T09:05:00.000Z"
    },
    "meta": {
      "timestamp": "2026-11-11T09:05:00.080Z",
      "request_id": "d5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a",
      "execution_time_ms": 22.8
    }
  }
  ```

---

### 3.7 Pipeline Audio & Transcription Vocale

#### 3.7.1 `POST /audio/upload-chunk`
Réceptionne un segment binaire du flux audio enregistré via le HUD Web ou Discord.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/audio/upload-chunk`
* **En-têtes Requête :**
  ```http
  Content-Type: multipart/form-data; boundary=----LevelUpAudioBoundary
  ```
* **Champs de Formulaire :**
  * `session_id` : UUID de la session d'enregistrement
  * `chunk_index` : Index entier croissant (`0, 1, 2...`)
  * `audio_data` : Fichier binaire WebM/Opus
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "session_id": "s1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "chunk_index": 3,
      "bytes_received": 65536,
      "status": "RECEIVING"
    },
    "meta": {
      "timestamp": "2026-11-11T09:10:00.000Z",
      "request_id": "a1b2c3d4-e5f6-4789-9876-0123456789ab",
      "execution_time_ms": 9.3
    }
  }
  ```

---

#### 3.7.2 `POST /audio/finalize-transcription`
Déclenche la concaténation FFmpeg, l'inférence Faster-Whisper, la synthèse Markdown et l'évaluation par l'Architecte.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/audio/finalize-transcription`
* **Corps de Requête :**
  ```json
  {
    "session_id": "s1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
    "audio_mime_type": "audio/webm;codecs=opus",
    "target_stat_hint": "LNG",
    "auto_generate_note": true,
    "auto_evaluate_by_architect": true
  }
  ```
* **Réponse Succès `200 OK` (`AudioTranscriptionResult`) :**
  ```json
  {
    "success": true,
    "data": {
      "transcription_id": "t1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "duration_seconds": 184,
      "raw_transcript": "Today I practiced Cambridge C1 speaking criteria, discussing algorithmic bias...",
      "detected_language": "en",
      "executive_summary": "Monologue de 3 minutes analysant le compromis précision/équité dans les modèles de recommandation.",
      "architect_evaluation": {
        "score_out_of_20": 17.5,
        "critique": "Vocabulaire précis et idiomatique. Utilisation adéquate de structures complexes.",
        "strengths": ["Grammaire C1 irréprochable", "Transition logique fluide"],
        "gaps": ["Légère hésitation sur les connecteurs de concession"],
        "awarded_xp": 175,
        "attributed_stat": "LNG"
      },
      "generated_note": {
        "note_id": "n3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e",
        "slug": "monologue-cambridge-c1-algorithmic-bias",
        "title": "Pratique Orale C1 : Biais Algorithmique & Recommandation",
        "file_path": "vault/LNG/monologue-cambridge-c1-algorithmic-bias.md"
      }
    },
    "meta": {
      "timestamp": "2026-11-11T09:12:00.000Z",
      "request_id": "f8e7d6c5-b4a3-4210-9876-fedcba012345",
      "execution_time_ms": 2850.4
    }
  }
  ```

---

### 3.8 IA Architecte (Antigravity & Gemini 2.5 Pro)

#### 3.8.1 `POST /architect/monologue-evaluate`
Soumet directement un texte ou une transcription brute au moteur d'évaluation cognitive de l'Architecte.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/architect/monologue-evaluate`
* **Corps de Requête :**
  ```json
  {
    "transcript_text": "Pour résoudre le problème des plus courts chemins dans un graphe orienté pondéré avec des poids négatifs, l'algorithme de Dijkstra ne peut pas être appliqué car il suppose des poids strictement positifs. On utilise alors Bellman-Ford qui procède par relaxation successive de tous les arcs V-1 fois...",
    "target_topic": "Algorithmique des Graphes (Bellman-Ford vs Dijkstra)",
    "subject_stat": "ACAD",
    "academic_context": "Partiel d'Algorithmique Avancée Semestre 1"
  }
  ```
* **Réponse Succès `200 OK` (`ArchitectEvaluationResponse`) :**
  ```json
  {
    "success": true,
    "data": {
      "evaluation_id": "ev-8901-abcd",
      "rubric_breakdown": {
        "accuracy_and_depth": 5.8,
        "structure_and_clarity": 4.8,
        "technical_vocabulary": 4.0,
        "practical_application": 4.5
      },
      "total_score": 19.1,
      "is_approved": true,
      "holographic_commentary": "[ÉVALUATION DE L'ARCHITECTE] Démonstration rigoureuse. La condition d'arrêt précoce en cas de cycle absorbant négatif a été convenablement explicitée.",
      "recommended_remedial_actions": [
        "Consulter l'implémentation optimisée SPFA (Shortest Path Faster Algorithm)"
      ],
      "xp_calculated": 190
    },
    "meta": {
      "timestamp": "2026-11-11T15:00:00.000Z",
      "request_id": "a2b3c4d5-e6f7-4890-bcde-f1234567890a",
      "execution_time_ms": 1420.2
    }
  }
  ```

---

#### 3.8.2 `POST /architect/daily-quest-pack`
Génère ou recalibre le lot de quêtes quotidiennes en fonction de l'état de fatigue (HP/MP) et des objectifs prioritaires.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/architect/daily-quest-pack`
* **Corps de Requête :**
  ```json
  {
    "target_date": "2026-11-12",
    "force_regenerate": true,
    "user_focus_preference": "AI_ENG"
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-11-12",
      "pack_strategy": "INTENSIVE_AI_FOCUS",
      "generated_quests_count": 4,
      "total_potential_xp": 850
    },
    "meta": {
      "timestamp": "2026-11-11T21:00:00.000Z",
      "request_id": "b3c4d5e6-f7a8-4901-cdef-2345678901ab",
      "execution_time_ms": 1820.6
    }
  }
  ```

---

### 3.9 Opportunités, Bourses & Deerflow Scraping

#### 3.9.1 `POST /deerflow/webhook`
Endpoint sécurisé par signature HMAC-SHA256 recevant les opportunités découvertes par le worker Deerflow.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/deerflow/webhook`
* **En-têtes Requête :**
  ```http
  Content-Type: application/json
  X-Deerflow-Signature: 8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
  ```
* **Corps de Requête (`DeerflowWebhookPayload`) :**
  ```json
  {
    "event": "OPPORTUNITY_SCRAPED",
    "opportunity": {
      "external_id": "bourses-excellence-eiffel-2027",
      "title": "Bourses d'Excellence Eiffel 2027 pour Étudiants en Master IA",
      "source_domain": "https://www.campusfrance.org",
      "category": "SCHOLARSHIP",
      "monetary_value_eur": 14000,
      "deadline_iso": "2027-01-10T23:59:59.000Z",
      "eligibility_criteria": [
        "Nationalité étrangère",
        "Âge inférieur à 25 ans",
        "Excellence académique avérée (Top 10%)"
      ],
      "application_url": "https://www.campusfrance.org/fr/le-programme-de-bourses-eiffel",
      "relevance_score": 96.5
    },
    "signature": "8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b"
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "opportunity_id": "op-7890-eiffel",
      "status": "STORED_AND_ALERT_DISPATCHED",
      "discord_notification_sent": true
    },
    "meta": {
      "timestamp": "2026-11-11T04:15:00.000Z",
      "request_id": "c1d2e3f4-a5b6-4789-9876-0123456789ab",
      "execution_time_ms": 38.5
    }
  }
  ```

---

#### 3.9.2 `GET /deerflow/opportunities`
Consulte les bourses, subventions et hackathons indexés.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/deerflow/opportunities?category=SCHOLARSHIP&min_value_eur=5000`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "total_count": 3,
      "opportunities": [
        {
          "id": "op-7890-eiffel",
          "title": "Bourses d'Excellence Eiffel 2027 pour Étudiants en Master IA",
          "source": "Campus France",
          "category": "SCHOLARSHIP",
          "estimated_value_eur": 14000,
          "deadline": "2027-01-10T23:59:59.000Z",
          "external_url": "https://www.campusfrance.org/fr/le-programme-de-bourses-eiffel",
          "status": "BOOKMARKED",
          "discovered_at": "2026-11-11T04:15:00.000Z"
        }
      ]
    },
    "meta": {
      "timestamp": "2026-11-11T10:00:00.000Z",
      "request_id": "d2e3f4a5-b6c7-4890-bcde-1234567890ab",
      "execution_time_ms": 8.9
    }
  }
  ```

---

### 3.10 Boutique des Ombres (Shadow Shop)

#### 3.10.1 `GET /shop/catalog`
Liste les récompenses tangibles et privilèges numériques déblocables avec les Cristaux d'Ombres.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/shop/catalog`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "catalog_items": [
        {
          "id": "it-01-kindle-paperwhite",
          "name": "Liseuse Numérique Kindle Paperwhite Signature",
          "description": "Appareil dédié à la lecture académique et technique sans distraction.",
          "category": "HARDWARE_AND_PHYSICAL_EQUIPMENT",
          "crystal_cost": 2500,
          "min_rank_required": "C",
          "image_url": "https://assets.levelup.local/shop/kindle.webp",
          "is_available": true
        },
        {
          "id": "it-02-sub-claude-pro",
          "name": "Abonnement 1 Mois Claude Pro / Antigravity Cloud",
          "description": "Crédits de calcul IA avancés pour l'inférence de code et hackathons.",
          "category": "DIGITAL_TOOLS_AND_SUBSCRIPTIONS",
          "crystal_cost": 450,
          "min_rank_required": "E",
          "image_url": "https://assets.levelup.local/shop/claude.webp",
          "is_available": true
        }
      ]
    },
    "meta": {
      "timestamp": "2026-11-11T10:30:00.000Z",
      "request_id": "e3f4a5b6-c7d8-4901-cdef-2345678901ab",
      "execution_time_ms": 6.2
    }
  }
  ```

---

#### 3.10.2 `POST /shop/purchase`
Procède à l'acquisition d'un bien en déduisant les Cristaux du joueur via transaction atomique.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/shop/purchase`
* **En-têtes Requête :**
  ```http
  Authorization: Bearer <JWT>
  Idempotency-Key: idem_shop_purchase_it02_8901
  ```
* **Corps de Requête :**
  ```json
  {
    "item_id": "it-02-sub-claude-pro",
    "justification_notes": "Nécessaire pour le sprint final du hackathon DeepSeek."
  }
  ```
* **Réponse Succès `200 OK` (`PurchaseItemResponse`) :**
  ```json
  {
    "success": true,
    "data": {
      "transaction_id": "tx-9012-claude",
      "item_id": "it-02-sub-claude-pro",
      "item_name": "Abonnement 1 Mois Claude Pro / Antigravity Cloud",
      "crystals_deducted": 450,
      "remaining_balance": 370,
      "redemption_code": "CLAUDE-PRO-SUBS-2026-LVLUP-X89",
      "delivery_instructions": "Code activé automatiquement sur votre compte développeur associé.",
      "purchased_at": "2026-11-11T10:35:00.000Z"
    },
    "meta": {
      "timestamp": "2026-11-11T10:35:00.040Z",
      "request_id": "f4a5b6c7-d8e9-4012-defa-3456789012bc",
      "execution_time_ms": 25.1
    }
  }
  ```

---

### 3.11 Protocole de Pénalité & Contrôle Réseau

#### 3.11.1 `GET /penalty/status`
Vérifie si le Système a engagé la zone de pénalité suite à l'échec d'une quête journalière obligatoire.
* **Méthode :** `GET`
* **Chemin :** `/api/v1/penalty/status`
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "is_penalty_active": false,
      "active_penalty_quest": null,
      "triggered_at": null,
      "time_remaining_seconds": null,
      "firewall_status": {
        "hosts_injection_active": false,
        "blocked_domains": [
          "tiktok.com",
          "www.tiktok.com",
          "instagram.com",
          "www.instagram.com",
          "netflix.com",
          "youtube.com/shorts"
        ],
        "router_iptables_state": "DISARMED_NORMAL_OPERATION"
      }
    },
    "meta": {
      "timestamp": "2026-11-11T11:00:00.000Z",
      "request_id": "a5b6c7d8-e9f0-4123-efab-4567890123cd",
      "execution_time_ms": 4.5
    }
  }
  ```

---

#### 3.11.2 `POST /penalty/acknowledge`
Confirme la prise de connaissance de l'alerte de pénalité holographique sur le HUD Web ou Discord.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/penalty/acknowledge`
* **Corps de Requête :**
  ```json
  {
    "client_screen_timestamp": "2026-11-11T23:59:59.000Z"
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "message": "Pénalité reconnue. Les règles de pare-feu et le compte à rebours sont enclenchés."
    },
    "meta": {
      "timestamp": "2026-11-12T00:00:01.000Z",
      "request_id": "b6c7d8e9-f0a1-4234-fabc-5678901234de",
      "execution_time_ms": 12.3
    }
  }
  ```

---

### 3.12 Synchronisation Hors-Ligne (Offline Engine)

#### 3.12.1 `POST /sync/push`
Transmet au serveur les mutations accumulées en local dans Dexie.js (IndexedDB) pendant une coupure réseau.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/sync/push`
* **Corps de Requête (`SyncPushRequest`) :**
  ```json
  {
    "client_id": "cl-client-pc-huriel-01",
    "last_sync_timestamp": "2026-11-11T06:00:00.000Z",
    "mutations": [
      {
        "entity_type": "time_blocks",
        "action": "UPDATE",
        "entity_id": "b1a2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        "data": {
          "is_completed": true,
          "completed_at": "2026-11-11T07:15:00.000Z"
        },
        "client_timestamp": "2026-11-11T07:15:02.000Z"
      }
    ]
  }
  ```
* **Réponse Succès `200 OK` :**
  ```json
  {
    "success": true,
    "data": {
      "processed_count": 1,
      "conflicts_resolved": 0,
      "server_timestamp": "2026-11-11T11:15:00.000Z"
    },
    "meta": {
      "timestamp": "2026-11-11T11:15:00.050Z",
      "request_id": "c7d8e9f0-a1b2-4345-abcd-6789012345ef",
      "execution_time_ms": 19.8
    }
  }
  ```

---

#### 3.12.2 `POST /sync/pull`
Récupère le delta de toutes les entités modifiées sur le serveur depuis le dernier timestamp de synchronisation.
* **Méthode :** `POST`
* **Chemin :** `/api/v1/sync/pull`
* **Corps de Requête :**
  ```json
  {
    "since_timestamp": "2026-11-11T06:00:00.000Z"
  }
  ```
* **Réponse Succès `200 OK` (`SyncPullResponse`) :**
  ```json
  {
    "success": true,
    "data": {
      "server_timestamp": "2026-11-11T11:20:00.000Z",
      "has_conflicts": false,
      "delta": {
        "notes": [],
        "time_blocks": [],
        "quests": [],
        "player_status": {
          "id": "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
          "username": "Huriel",
          "current_level": 14,
          "total_xp": "18450",
          "shadow_crystals_balance": 820,
          "active_penalty": false,
          "rank": {
            "code": "D",
            "name": "Chasseur Confirmé",
            "min_level_required": 10,
            "next_rank": "C",
            "xp_to_next_rank": "22500",
            "progress_to_next_rank_pct": 82.0
          },
          "vital_gauges": {
            "hp": { "current": 88, "max": 100, "status_label": "OPTIMAL", "last_updated": "2026-11-11T07:15:00.000Z" },
            "mp": { "current": 65, "max": 100, "status_label": "CONCENTRÉ", "last_updated": "2026-11-11T08:00:00.000Z" }
          },
          "stats": [],
          "unclaimed_rewards_count": 2,
          "active_quests_count": 3,
          "streak_days": 18
        }
      }
    },
    "meta": {
      "timestamp": "2026-11-11T11:20:00.080Z",
      "request_id": "d8e9f0a1-b2c3-4456-bcde-7890123456f0",
      "execution_time_ms": 21.4
    }
  }
  ```

---

### 3.13 Routines de Calisthénie & Vision par Ordinateur (CV Engine)

#### 3.13.1 `GET /workouts/routines`
Récupère le catalogue complet des routines d'entraînement maison d'Huriel avec l'ensemble des étapes, chronomètres et angles articulaires requis pour l'inférence MediaPipe.

* **Méthode :** `GET`
* **Route :** `/workouts/routines`
* **En-têtes requis :** `Authorization: Bearer <TOKEN>`
* **Réponse 200 OK :**
```json
{
  "success": true,
  "data": [
    {
      "code": "BACK_SHOULDERS_17",
      "title": "Routine Dos & Épaules à la Maison",
      "targetGroup": "BACK_SHOULDERS",
      "totalSteps": 17,
      "steps": [
        { "stepNumber": 1, "exerciseName": "Jumping Jacks", "exerciseType": "DURATION_SECONDS", "durationSeconds": 30 },
        { "stepNumber": 2, "exerciseName": "Hyperextension", "exerciseType": "REPETITIONS", "targetReps": 14 },
        { "stepNumber": 3, "exerciseName": "Pike Push Ups", "exerciseType": "REPETITIONS", "targetReps": 14, "targetAngleMin": 75.0, "targetAngleMax": 160.0, "keyJointPoints": [11, 13, 15] },
        { "stepNumber": 4, "exerciseName": "Reverse Push-Ups", "exerciseType": "REPETITIONS", "targetReps": 12 },
        { "stepNumber": 5, "exerciseName": "Inchworms", "exerciseType": "REPETITIONS", "targetReps": 16 },
        { "stepNumber": 6, "exerciseName": "Side-Lying Floor Stretch Left", "exerciseType": "DURATION_SECONDS", "durationSeconds": 30 },
        { "stepNumber": 7, "exerciseName": "Side-Lying Floor Stretch Right", "exerciseType": "DURATION_SECONDS", "durationSeconds": 30 },
        { "stepNumber": 8, "exerciseName": "Hyperextension", "exerciseType": "REPETITIONS", "targetReps": 12 },
        { "stepNumber": 9, "exerciseName": "Pike Push Ups", "exerciseType": "REPETITIONS", "targetReps": 12, "targetAngleMin": 75.0, "targetAngleMax": 160.0, "keyJointPoints": [11, 13, 15] },
        { "stepNumber": 10, "exerciseName": "Reverse Push-Ups", "exerciseType": "REPETITIONS", "targetReps": 10 },
        { "stepNumber": 11, "exerciseName": "Inchworms", "exerciseType": "REPETITIONS", "targetReps": 14 },
        { "stepNumber": 12, "exerciseName": "Cat Cow Pose", "exerciseType": "DURATION_SECONDS", "durationSeconds": 35 },
        { "stepNumber": 13, "exerciseName": "Supine Push Up", "exerciseType": "REPETITIONS", "targetReps": 14 },
        { "stepNumber": 14, "exerciseName": "Floor Y Raises", "exerciseType": "REPETITIONS", "targetReps": 14 },
        { "stepNumber": 15, "exerciseName": "Supine Push Up", "exerciseType": "REPETITIONS", "targetReps": 13 },
        { "stepNumber": 16, "exerciseName": "Reverse Snow Angels", "exerciseType": "REPETITIONS", "targetReps": 12 },
        { "stepNumber": 17, "exerciseName": "Child's Pose", "exerciseType": "DURATION_SECONDS", "durationSeconds": 30 }
      ]
    },
    {
      "code": "ARMS_6_FAILURE",
      "title": "Routine Bras & Triceps Calisthenics (@giovanni_fiderio)",
      "targetGroup": "ARMS_TRICEPS",
      "totalSteps": 6,
      "description": "3 séries à l'échec postural pour chaque exercice : Push-Ups, Decline, Diamond, Pike, Wide, Tricep Cross Extensions"
    },
    {
      "code": "ABS_CORE_5",
      "title": "Routine Abdos & Core d'Acier (@lou4n.ldlm)",
      "targetGroup": "CORE_ABS",
      "totalSteps": 5,
      "description": "V-Up (3x10), Mountain Climber (3x30s), Relevé de jambes (3x12), Gainage classique (2x1m30), Gainage latéral (2x45s/côté)"
    }
  ]
}
```

#### 3.13.2 `POST /cv/validate-rep`
Valide une répétition physique transmise par le frontend avec télémétrie des repères squelettiques.

* **Méthode :** `POST`
* **Route :** `/cv/validate-rep`
* **Corps de la requête :**
```json
{
  "routineCode": "BACK_SHOULDERS_17",
  "stepNumber": 3,
  "exerciseName": "Pike Push Ups",
  "inflectionAngleMeasured": 71.4,
  "extensionAngleMeasured": 164.2,
  "confidenceScore": 0.94,
  "repsCompleted": 8
}
```
* **Réponse 200 OK :**
```json
{
  "success": true,
  "data": {
    "repValid": true,
    "currentTotalReps": 8,
    "targetReps": 14,
    "soundTrigger": "REP_CHIRP",
    "isStepFinished": false
  }
}
```

### 3.14 Écosystème des Services Tiers & Invariants de Rangs Réels

#### 3.14.1 `POST /integrations/nextdns/toggle`
Active ou désactive instantanément le profil de restriction DNS récréatif via l'API NextDNS.

* **Méthode :** `POST`
* **Route :** `/integrations/nextdns/toggle`
* **Corps de la requête :**
```json
{
  "mode": "STRICT_BLOCK", // ou 'NORMAL'
  "reason": "DEEP_WORK_SESSION", // ou 'PENALTY_ZONE'
  "durationMinutes": 90
}
```
* **Réponse 200 OK :**
```json
{
  "success": true,
  "data": {
    "profileId": "nxt_monarch_sec",
    "blockedDomainsCount": 42,
    "expiresAt": "2026-11-11T18:00:00.000Z"
  }
}
```

#### 3.14.2 `GET /player/rank-eligibility`
Évalue en temps réel si les accomplissements réels du joueur satisfont aux exigences strictes du rang supérieur.

* **Méthode :** `GET`
* **Route :** `/player/rank-eligibility`
* **Réponse 200 OK :**
```json
{
  "success": true,
  "data": {
    "currentRank": "C",
    "targetRank": "B",
    "globalLevel": 48,
    "requirementsMet": {
      "levelRequirement": { "required": 46, "actual": 48, "passed": true },
      "hackathonWinRequirement": { "required": 1, "actual": 1, "passed": true, "proof": "Devpost AI Global Hackathon 2026 - 1st Prize" },
      "cambridgeLevelRequirement": { "required": "C1", "actual": "C1", "passed": true, "proof": "Cambridge English C1 Advanced Certificate #CAM-88910" },
      "calisthenicsRequirement": { "required": true, "actual": true, "passed": true, "proof": "17-ex Back & 6-ex Arm splits verified by CV" },
      "classRankRequirement": { "required": "Top 10%", "actual": "Top 4%", "passed": true }
    },
    "eligibleForRankUp": true
  }
}
```


## 4. Spécification Approfondie du Protocole WebSocket (`wss://api.levelup.local/ws/v1`)

Le canal WebSocket assure la diffusion instantanée (latence < 25 ms) de tous les événements télémétriques entre le serveur central, le HUD Web dynamique et le bot Discord.

### 4.1 Handshake & Négociation de Connexion
* **URL :** `wss://api.levelup.local/ws/v1?token=<JWT_TOKEN>&client_id=<UUID>`
* **Sous-protocole négocié :** `levelup.v1.json`
* **Comportement en cas d'échec de token :** Le serveur émet une fermeture immédiate `CloseEvent(code=4401, reason="INVALID_OR_EXPIRED_JWT")`.

### 4.2 Protocole de Battement de Cœur (Heartbeat Keep-Alive)
Pour maintenir la connexion active à travers les pare-feux et équilibreurs de charge, le client émet un message `PING` toutes les 30 secondes :
* **Client -> Serveur :**
  ```json
  {
    "type": "PING",
    "timestamp": 1794386400000
  }
  ```
* **Serveur -> Client :**
  ```json
  {
    "type": "PONG",
    "timestamp": 1794386400012
  }
  ```
Si aucun `PING` n'est reçu dans un intervalle de 65 secondes, le socket est fermé côté serveur.

### 4.3 Registre Intégral des Messages & Événements Serveur

#### 4.3.1 `ALARM_TRIGGERED`
Déclenché à la seconde exacte d'échéance d'un bloc horaire du planificateur pour faire retentir le gong sonore du Système.
```json
{
  "event": "ALARM_TRIGGERED",
  "topic": "planner:alarm",
  "payload": {
    "block_id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    "title": "Fin de session Deep Work IA — Faster-Whisper",
    "target_stat": "AI_ENG",
    "xp_to_collect": 100,
    "next_block": {
      "title": "Pause Déjeuner & Marche Active",
      "start_time": "12:00",
      "end_time": "13:30"
    },
    "sound_effect": "SYSTEM_ALARM_CHIME_BELL_ECHO"
  },
  "emitted_at": "2026-11-11T11:30:00.000Z"
}
```

#### 4.3.2 `EMERGENCY_QUEST_SPAWNED`
Affiche le rectangle holographique rouge d'alerte Solo Leveling sur le HUD et notifie le canal d'urgence Discord.
```json
{
  "event": "EMERGENCY_QUEST_SPAWNED",
  "topic": "quests:emergency",
  "payload": {
    "quest_id": "eq-04-zero-day-audit",
    "title": "[ALERTE QUÊTE URGENTE] Faille Zero-Day Détectée dans Dépendance",
    "description": "Une vulnérabilité critique a été identifiée sur le module de session. Vous disposez de 60 minutes pour patcher et déployer un correctif vérifié.",
    "time_limit_minutes": 60,
    "time_remaining_seconds": 3600,
    "deadline_iso": "2026-11-11T16:30:00.000Z",
    "reward_player_xp": 500,
    "reward_stat_xp": 750,
    "reward_crystals": 100,
    "penalty_on_failure": "Activation immédiate du pare-feu de blocage réseau pendant 4h."
  },
  "emitted_at": "2026-11-11T15:30:00.000Z"
}
```

#### 4.3.3 `LEVEL_UP`
Déclenche la séquence visuelle d'éveil, l'effet de particules bleues néon et la fanfare sonore sur le HUD Web.
```json
{
  "event": "LEVEL_UP",
  "topic": "player:level_up",
  "payload": {
    "old_level": 14,
    "new_level": 15,
    "total_xp": "19200",
    "unlocked_title": "Élite des Ombres",
    "bonus_stat_points": 5,
    "unlocked_skill_nodes": ["AI_ENG_T3_LLM_FINE_TUNING", "CYBER_T3_KERNEL_EXPLOITATION"],
    "sound_asset": "VOICE_SYSTEM_LEVEL_UP_JINWOO_FR"
  },
  "emitted_at": "2026-11-11T17:45:00.000Z"
}
```

#### 4.3.4 `RANK_UP`
Annonce le passage à un rang supérieur (ex: Rang D vers Rang C).
```json
{
  "event": "RANK_UP",
  "topic": "player:rank_up",
  "payload": {
    "old_rank": "D",
    "new_rank": "C",
    "rank_title": "Chasseur Vétéran",
    "new_features_unlocked": [
      "Accès aux Boss Raids de Niveau C",
      "Déblocage de l'inventaire boutique matérielle Tier 2"
    ],
    "animation_profile": "HOLOGRAPHIC_GOLD_AZURE_BURST"
  },
  "emitted_at": "2026-11-11T17:45:01.000Z"
}
```

#### 4.3.5 `PENALTY_ACTIVATED`
Notifie le déclenchement immédiat de la Zone de Pénalité.
```json
{
  "event": "PENALTY_ACTIVATED",
  "topic": "penalty:lockout",
  "payload": {
    "reason": "Échec de validation de la Quête Journalière obligatoire avant 22h00.",
    "duration_minutes": 240,
    "blocked_applications": ["TikTok", "Instagram", "Netflix", "YouTube Shorts"],
    "quest_required": {
      "code": "PENALTY_SURVIVAL_10K_STEP",
      "title": "[Quête de Pénalité] Traversée du Désert des Centipèdes",
      "instructions": "Marche active de 10 kilomètres ou 400 pompes sous 4 heures pour déverrouiller le système."
    }
  },
  "emitted_at": "2026-11-11T22:00:01.000Z"
}
```

#### 4.3.6 `PENALTY_CLEARED`
Transmis dès confirmation de la résolution de la pénalité pour rétablir la configuration réseau normale.
```json
{
  "event": "PENALTY_CLEARED",
  "topic": "penalty:cleared",
  "payload": {
    "cleared_at": "2026-11-12T01:30:00.000Z",
    "firewall_rules_restored": true,
    "system_message": "[PÉNALITÉ PURGÉE] Les restrictions d'accès ont été levées. Reprise de l'entraînement standard."
  },
  "emitted_at": "2026-11-12T01:30:01.000Z"
}
```

#### 4.3.7 `DEERFLOW_OPPORTUNITY_ALERT`
Notifie la découverte immédiate d'une opportunité à forte valeur financière ou académique.
```json
{
  "event": "DEERFLOW_OPPORTUNITY_ALERT",
  "topic": "deerflow:alerts",
  "payload": {
    "opportunity_id": "op-7890-eiffel",
    "title": "Bourses d'Excellence Eiffel 2027 (14 000 €)",
    "deadline_iso": "2027-01-10T23:59:59.000Z",
    "relevance_score": 96.5,
    "quick_action_url": "https://api.levelup.local/api/v1/deerflow/opportunities/op-7890-eiffel/apply"
  },
  "emitted_at": "2026-11-11T04:15:01.000Z"
}
```

---

## 5. Spécification Complète OpenAPI 3.1.0 (`contracts/openapi.json`)

Le document OpenAPI 3.1 ci-après fournit la représentation canonique intégrale de tous les schémas, chemins, paramètres et composants de sécurité exploitables par Swagger UI, Redoc, Orval et les générateurs de SDK :

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "LevelUp System API",
    "version": "1.0.0",
    "description": "API REST et WebSocket hautement résiliente du Système LevelUp (Inspiré de Solo Leveling).",
    "contact": {
      "name": "Huriel - Monarque du Système",
      "url": "https://levelup.local"
    }
  },
  "servers": [
    {
      "url": "https://api.levelup.local/api/v1",
      "description": "Serveur Local Sécurisé Production"
    },
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Environnement de Développement Local"
    }
  ],
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Jeton JWT signé avec RS256/Ed25519 contenant l'ID et le rôle du joueur."
      },
      "IdempotencyHeader": {
        "type": "apiKey",
        "in": "header",
        "name": "Idempotency-Key",
        "description": "UUIDv4 unique garantissant l'exécution atomique sans duplication."
      }
    },
    "schemas": {
      "StandardResponseMeta": {
        "type": "object",
        "properties": {
          "timestamp": { "type": "string", "format": "date-time" },
          "request_id": { "type": "string" },
          "execution_time_ms": { "type": "number" }
        },
        "required": ["timestamp", "request_id", "execution_time_ms"]
      },
      "StandardError": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "const": false },
          "error": {
            "type": "object",
            "properties": {
              "code": { "type": "string" },
              "message": { "type": "string" },
              "status_code": { "type": "integer" },
              "category": { "type": "string" },
              "details": { "type": "array", "items": { "type": "object" } },
              "help_url": { "type": "string", "format": "uri" }
            },
            "required": ["code", "message", "status_code", "category"]
          },
          "meta": { "$ref": "#/components/schemas/StandardResponseMeta" }
        },
        "required": ["success", "error", "meta"]
      }
    }
  },
  "paths": {
    "/auth/login": {
      "post": {
        "summary": "Connexion du Joueur Monarque",
        "operationId": "loginUser",
        "tags": ["Authentification"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "username": { "type": "string" },
                  "password": { "type": "string" },
                  "device_fingerprint": { "type": "string" }
                },
                "required": ["username", "password"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Session initialisée avec succès",
            "content": { "application/json": { "schema": { "type": "object" } } }
          },
          "401": {
            "description": "Identifiants invalides",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/StandardError" } } }
          }
        }
      }
    },
    "/player/status": {
      "get": {
        "summary": "Photographie d'État Complète du Joueur",
        "operationId": "getPlayerStatus",
        "tags": ["Profil Joueur"],
        "security": [{ "BearerAuth": [] }],
        "responses": {
          "200": {
            "description": "État du joueur retourné",
            "content": { "application/json": { "schema": { "type": "object" } } }
          },
          "401": {
            "description": "Non autorisé",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/StandardError" } } }
          }
        }
      }
    },
    "/quests/daily": {
      "get": {
        "summary": "Liste des Quêtes Journalières",
        "operationId": "getDailyQuests",
        "tags": ["Quêtes"],
        "security": [{ "BearerAuth": [] }],
        "responses": {
          "200": { "description": "Quêtes journalières récupérées" }
        }
      }
    },
    "/quests/{id}/complete": {
      "post": {
        "summary": "Validation et Attribution des Récompenses d'une Quête",
        "operationId": "completeQuest",
        "tags": ["Quêtes"],
        "security": [{ "BearerAuth": [] }, { "IdempotencyHeader": [] }],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "string", "format": "uuid" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "type": "object" } } }
        },
        "responses": {
          "200": { "description": "Quête validée et XP allouée" },
          "409": { "description": "Conflit ou quête déjà validée" }
        }
      }
    },
    "/planner/days/{date}": {
      "get": {
        "summary": "Consultation du Programme Quotidien",
        "operationId": "getDaySchedule",
        "tags": ["Planificateur"],
        "security": [{ "BearerAuth": [] }],
        "parameters": [
          {
            "name": "date",
            "in": "path",
            "required": true,
            "schema": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" }
          }
        ],
        "responses": {
          "200": { "description": "Planning du jour retourné" }
        }
      }
    },
    "/notes": {
      "get": {
        "summary": "Recherche dans le Cerveau Numérique",
        "operationId": "searchNotes",
        "tags": ["Cerveau Numérique"],
        "security": [{ "BearerAuth": [] }],
        "parameters": [
          { "name": "query", "in": "query", "required": true, "schema": { "type": "string" } },
          { "name": "stat", "in": "query", "required": false, "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "Résultats de recherche retournés" }
        }
      },
      "post": {
        "summary": "Création ou Mise à Jour de Fiche Markdown",
        "operationId": "upsertNote",
        "tags": ["Cerveau Numérique"],
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "type": "object" } } }
        },
        "responses": {
          "201": { "description": "Fiche Markdown sauvegardée avec succès" }
        }
      }
    },
    "/audio/finalize-transcription": {
      "post": {
        "summary": "Finalisation de Transcription & Évaluation Architecte",
        "operationId": "finalizeAudioTranscription",
        "tags": ["Audio & STT"],
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "type": "object" } } }
        },
        "responses": {
          "200": { "description": "Transcription terminée et évaluée" }
        }
      }
    },
    "/shop/purchase": {
      "post": {
        "summary": "Achat d'un Article dans la Boutique des Ombres",
        "operationId": "purchaseShopItem",
        "tags": ["Boutique"],
        "security": [{ "BearerAuth": [] }, { "IdempotencyHeader": [] }],
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "type": "object" } } }
        },
        "responses": {
          "200": { "description": "Article acheté et Cristaux débités" },
          "402": { "description": "Solde de Cristaux d'Ombres insuffisant" }
        }
      }
    }
  }
}
```

---

## 6. Implémentation Complète du SDK Client TypeScript (`sdk/LevelUpApiClient.ts`)

Le code source ci-dessous est le SDK client officiel de LevelUp, prêt à être instancié dans l'application React HUD, le bot Discord.js ou des scripts d'automatisation Node.js. Il encapsule la gestion automatique du token JWT, le retry exponentiel avec jitter, l'injection de clés d'idempotence et la connexion WebSocket réactive avec reconnexion automatique :

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import WebSocket from 'isomorphic-ws';
import { EventEmitter } from 'events';
import {
  PlayerStatusResponse,
  PlayerStatusResponseSchema,
  Quest,
  CompleteQuestResponse,
  CompleteQuestResponseSchema,
  TimeBlock,
  Note,
  AudioTranscriptionResult,
  AudioTranscriptionResultSchema,
  PurchaseItemResponse,
  PurchaseItemResponseSchema,
  LoginRequest,
  TokenPairResponse,
  TokenPairResponseSchema
} from '../contracts/apiSchemas';

export interface ClientConfig {
  baseUrl: string;
  wsUrl: string;
  clientVersion: string;
  maxRetries?: number;
  timeoutMs?: number;
}

export class LevelUpApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any[];

  constructor(message: string, code: string, statusCode: number, details?: any[]) {
    super(message);
    this.name = 'LevelUpApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class LevelUpApiClient extends EventEmitter {
  private readonly http: AxiosInstance;
  private readonly config: ClientConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private ws: WebSocket | null = null;
  private wsHeartbeatTimer: NodeJS.Timeout | null = null;
  private isReconnectingWs: boolean = false;

  constructor(config: ClientConfig) {
    super();
    this.config = {
      maxRetries: 3,
      timeoutMs: 15000,
      ...config,
    };

    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': this.config.clientVersion,
      },
    });

    this.setupInterceptors();
  }

  // ============================================================================
  // INTERCEPTEURS HTTP & GESTION AUTOMATIQUE DES TOKENS
  // ============================================================================
  private setupInterceptors(): void {
    // Intercepteur de Requête
    this.http.interceptors.request.use((reqConfig) => {
      if (this.accessToken && !reqConfig.headers.Authorization) {
        reqConfig.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      if (!reqConfig.headers['X-Request-ID']) {
        reqConfig.headers['X-Request-ID'] = this.generateUuid();
      }
      return reqConfig;
    });

    // Intercepteur de Réponse avec Refresh Automatique & Retry Exponentiel
    this.http.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retryCount?: number };

        // 1. Détection expiration Token (401)
        if (error.response?.status === 401 && this.refreshToken && !originalRequest.headers?.['_retryAfterRefresh']) {
          try {
            await this.refreshSession();
            if (originalRequest.headers) {
              originalRequest.headers['_retryAfterRefresh'] = 'true';
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return this.http(originalRequest);
          } catch (refreshErr) {
            this.emit('session_expired');
            this.clearSession();
            throw refreshErr;
          }
        }

        // 2. Gestion Retry sur 5xx ou 429
        const status = error.response?.status;
        const shouldRetry = status && (status >= 500 || status === 429);
        originalRequest._retryCount = originalRequest._retryCount || 0;

        if (shouldRetry && originalRequest._retryCount < (this.config.maxRetries || 3)) {
          originalRequest._retryCount++;
          const delay = Math.pow(2, originalRequest._retryCount) * 500 + Math.random() * 200;
          await new Promise((res) => setTimeout(res, delay));
          return this.http(originalRequest);
        }

        // Normalisation d'Erreur LevelUp
        if (error.response?.data && (error.response.data as any).error) {
          const apiErr = (error.response.data as any).error;
          throw new LevelUpApiError(apiErr.message, apiErr.code, error.response.status, apiErr.details);
        }

        throw new LevelUpApiError(
          error.message || 'Erreur réseau inconnue',
          'NETWORK_COMMUNICATION_FAILURE',
          error.response?.status || 500
        );
      }
    );
  }

  // ============================================================================
  // MÉTHODES D'AUTHENTIFICATION
  // ============================================================================
  public async login(credentials: LoginRequest): Promise<TokenPairResponse> {
    const response = await this.http.post('/auth/login', credentials);
    const validated = TokenPairResponseSchema.parse(response.data.data);
    this.setSession(validated.access_token, validated.refresh_token);
    this.connectWebSocket();
    return validated;
  }

  public async refreshSession(): Promise<void> {
    if (!this.refreshToken) throw new Error('Aucun refresh token disponible.');
    const response = await this.http.post('/auth/refresh', { refresh_token: this.refreshToken });
    this.accessToken = response.data.data.access_token;
    if (response.data.data.refresh_token) {
      this.refreshToken = response.data.data.refresh_token;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.http.post('/auth/logout', {}, {
        headers: { 'Idempotency-Key': this.generateUuid() }
      });
    } finally {
      this.clearSession();
      this.disconnectWebSocket();
    }
  }

  public setSession(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
  }

  public clearSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  // ============================================================================
  // MÉTHODES MÉTIER (PLAYER, QUESTS, PLANNER, NOTES, AUDIO, SHOP)
  // ============================================================================
  public async getPlayerStatus(): Promise<PlayerStatusResponse> {
    const res = await this.http.get('/player/status');
    return PlayerStatusResponseSchema.parse(res.data.data);
  }

  public async getDailyQuests(): Promise<Quest[]> {
    const res = await this.http.get('/quests/daily');
    return res.data.data.quests;
  }

  public async completeQuest(questId: string, proofData?: string): Promise<CompleteQuestResponse> {
    const res = await this.http.post(
      `/quests/${questId}/complete`,
      { proof_type: proofData ? 'URL_OR_LINK' : 'NONE', proof_data: proofData },
      { headers: { 'Idempotency-Key': this.generateUuid() } }
    );
    return CompleteQuestResponseSchema.parse(res.data.data);
  }

  public async getDaySchedule(dateIso: string): Promise<TimeBlock[]> {
    const res = await this.http.get(`/planner/days/${dateIso}`);
    return res.data.data.blocks;
  }

  public async toggleTimeBlock(blockId: string): Promise<{ is_completed: boolean; xp_granted: number }> {
    const res = await this.http.patch(`/planner/blocks/${blockId}/toggle`);
    return res.data.data;
  }

  public async searchNotes(query: string, stat?: string): Promise<Note[]> {
    const res = await this.http.get('/notes', { params: { query, stat } });
    return res.data.data.notes;
  }

  public async finalizeAudioTranscription(sessionId: string): Promise<AudioTranscriptionResult> {
    const res = await this.http.post('/audio/finalize-transcription', {
      session_id: sessionId,
      audio_mime_type: 'audio/webm;codecs=opus',
      auto_generate_note: true,
      auto_evaluate_by_architect: true,
    });
    return AudioTranscriptionResultSchema.parse(res.data.data);
  }

  public async purchaseShopItem(itemId: string): Promise<PurchaseItemResponse> {
    const res = await this.http.post(
      '/shop/purchase',
      { item_id: itemId },
      { headers: { 'Idempotency-Key': this.generateUuid() } }
    );
    return PurchaseItemResponseSchema.parse(res.data.data);
  }

  // ============================================================================
  // GESTION DU WEBSOCKET AVEC RECONNEXION AUTOMATIQUE
  // ============================================================================
  public connectWebSocket(): void {
    if (!this.accessToken || this.ws) return;

    const url = `${this.config.wsUrl}?token=${this.accessToken}&client_id=${this.generateUuid()}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.isReconnectingWs = false;
      this.emit('ws_connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data.toString());
        if (message.type === 'PONG') return;
        this.emit('system_event', message);
        if (message.event) {
          this.emit(message.event, message.payload);
        }
      } catch (err) {
        this.emit('ws_error', err);
      }
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      this.ws = null;
      this.emit('ws_disconnected', event);
      if (event.code !== 1000 && event.code !== 4401 && !this.isReconnectingWs) {
        this.reconnectWebSocket();
      }
    };

    this.ws.onerror = (err) => {
      this.emit('ws_error', err);
    };
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.wsHeartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.wsHeartbeatTimer) {
      clearInterval(this.wsHeartbeatTimer);
      this.wsHeartbeatTimer = null;
    }
  }

  private reconnectWebSocket(): void {
    this.isReconnectingWs = true;
    setTimeout(() => {
      if (this.accessToken) {
        this.connectWebSocket();
      }
    }, 3000);
  }

  public disconnectWebSocket(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Déconnexion volontaire du client');
      this.ws = null;
    }
  }

  // ============================================================================
  // UTILITAIRES
  // ============================================================================
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
```

---

## 7. Manuel de Recettes CLI, Scripts cURL & Tests d'Intégration Manuels

Pour tester et interagir avec l'API sans interface graphique, utilisez les commandes cURL ci-dessous qui intègrent les en-têtes d'authentification et d'idempotence requis :

### 7.1 Connexion et Extraction Automatique du Jeton JWT
```bash
# Authentification et stockage du token dans la variable JWT
JWT=$(curl -s -X POST "https://api.levelup.local/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "Huriel", "password": "MasterSecureSoloLeveling2026!#"}' \
  | jq -r '.data.access_token')

echo "Jeton d'accès acquis : ${JWT:0:25}..."
```

### 7.2 Consultation de l'État du Joueur & Jauges
```bash
curl -s -X GET "https://api.levelup.local/api/v1/player/status" \
  -H "Authorization: Bearer $JWT" \
  -H "Accept: application/json" \
  | jq '.data | {level: .current_level, rank: .rank.code, hp: .vital_gauges.hp.current, mp: .vital_gauges.mp.current}'
```

### 7.3 Récupération des Quêtes Journalières Actives
```bash
curl -s -X GET "https://api.levelup.local/api/v1/quests/daily" \
  -H "Authorization: Bearer $JWT" \
  | jq '.data.quests[] | {id: .id, titre: .title, stat: .target_stat, xp: .reward_player_xp}'
```

### 7.4 Soumission de Preuve & Validation Atomique de Quête
```bash
# 1. Soumission de preuve
QUEST_ID="q2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d"
IDEM_KEY=$(uuidgen)

curl -s -X POST "https://api.levelup.local/api/v1/quests/${QUEST_ID}/complete" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: ${IDEM_KEY}" \
  -d '{
    "proof_type": "URL_OR_LINK",
    "proof_data": "https://tryhackme.com/room/bufferoverflowprep"
  }' | jq '.data.rewards_awarded'
```

### 7.5 Ajout d'un Bloc Horaire dans le Planificateur
```bash
curl -s -X POST "https://api.levelup.local/api/v1/planner/blocks" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "block_date": "2026-11-11",
    "start_time": "19:00",
    "end_time": "20:30",
    "title": "Entraînement Algorithmique — Arbres Binaires Équilibrés (AVL)",
    "target_stat": "ACAD"
  }' | jq '.data'
```

### 7.6 Test du Webhook Opportunités Deerflow avec Signature HMAC
```bash
PAYLOAD='{"event":"OPPORTUNITY_SCRAPED","opportunity":{"external_id":"mit-fellowship-2027","title":"Bourse Doctorale MIT AI Lab 2027","source_domain":"https://mit.edu","category":"SCHOLARSHIP","monetary_value_eur":45000,"deadline_iso":"2027-02-15T00:00:00.000Z","eligibility_criteria":["Master IA terminé"],"application_url":"https://mit.edu/apply","relevance_score":99.0},"signature":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'

curl -s -X POST "https://api.levelup.local/api/v1/deerflow/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Deerflow-Signature: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" \
  -d "$PAYLOAD" | jq '.'
```

---

## 8. Synthèse de Conformité & Matrice d'Intégration Système

| Périmètre Spécifié | Standard Technique | Validateur Runtime | Fichier de Référence |
| :--- | :--- | :--- | :--- |
| **Schémas de Données** | JSON Schema / Zod v3.23 | Zod Strict Middleware | `contracts/apiSchemas.ts` |
| **Spécification Ouverte** | OpenAPI 3.1.0 | Redoc / Swagger UI | `contracts/openapi.json` |
| **Transport REST** | HTTP/2 sur TLS 1.3 | Fastify v4 / Node 22 | `server/routes/*.ts` |
| **Canal Événementiel** | WebSocket RFC 6455 | ws / isomorphic-ws | `server/websocket/*.ts` |
| **SDK Développeur** | TypeScript 5.5 Stricte | Jest / Vitest E2E | `sdk/LevelUpApiClient.ts` |
| **Idempotence & Cache** | Redis 7 Distributed Locks | Redlock / Lua Scripts | `server/middleware/idempotency.ts` |

---

## 9. Spécification Détaillée du Rate Limiting & Algorithme Sliding Window (Redis 7 Lua)

Afin d'éviter tout déni de service (DDoS), surcharge de la base de données PostgreSQL ou contournement des contraintes temporelles imposées par le Système de Solo Leveling, chaque point de terminaison de l'API est assujetti à un quota dynamique calculé via une fenêtre glissante milliseconde par milliseconde stockée dans Redis 7 sous la clé normalisée `ratelimit:{client_id}:{endpoint_hash}`.

### 9.1 Matrice des Quotas par Catégorie de Routes

| Catégorie de Route | Quota Autorisé | Fenêtre Glissante | Action en Cas de Dépassement |
| :--- | :--- | :--- | :--- |
| **Authentification** (`/auth/*`) | 5 requêtes | 60 secondes | Code HTTP 429 + Lockout temporaire de l'IP pendant 15 minutes si 3 récidives |
| **Consultation Profil & Quêtes** (`GET /player/*`, `GET /quests/*`) | 120 requêtes | 60 secondes | Code HTTP 429 avec en-tête `Retry-After` spécifiant le délai en secondes |
| **Actions Critiques & Éveil** (`POST /quests/*/complete`, `POST /skills/*/unlock`) | 10 requêtes | 60 secondes | Code HTTP 429 avec alerte d'intégrité télémétrique Discord anti-triche |
| **Planificateur & Time-Blocking** (`/planner/*`) | 60 requêtes | 60 secondes | Code HTTP 429 et mise en attente de synchronisation locale |
| **Cerveau Numérique & Recherche Plein Texte** (`/notes*`) | 90 requêtes | 60 secondes | Code HTTP 429 |
| **Streaming Audio** (`POST /audio/upload-chunk`) | 300 requêtes | 60 secondes | Code HTTP 429 (Large tolérance pour l'ingestion de micro-chunks Opus) |
| **Webhook Opportunités Deerflow** (`POST /deerflow/webhook`) | 30 requêtes | 60 secondes | Code HTTP 429 avec rejet de la transaction de scraping |
| **Synchronisation Hors-Ligne** (`POST /sync/*`) | 20 requêtes | 60 secondes | Code HTTP 429 avec backoff exponentiel automatique piloté par Dexie.js |

### 9.2 Script Lua Atomique Exécuté par le Nœud Redis (`scripts/sliding_window_limiter.lua`)
Ce script s'exécute de façon strictement atomique dans le thread d'exécution unique du moteur Redis, éliminant tout risque de condition de concurrence (*race condition*) même en cas de rafales massives de requêtes asynchrones :

```lua
-- KEYS[1]: Identifiant de la clé de limitation (ex: ratelimit:huriel:quests_complete)
-- ARGV[1]: Horodatage courant en millisecondes (ex: 1794386400123)
-- ARGV[2]: Largeur de la fenêtre glissante en millisecondes (ex: 60000 pour 1 minute)
-- ARGV[3]: Quota maximum de requêtes toléré dans ladite fenêtre (ex: 10)
-- ARGV[4]: UUID unique ou identifiant de trace de la requête courante

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local requestId = ARGV[4]

local clearBefore = now - window

-- 1. Élimination des requêtes expirées en dehors de la fenêtre glissante
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

-- 2. Dénombrement précis des requêtes actives enregistrées dans la fenêtre
local currentCount = redis.call('ZCARD', key)

if currentCount < limit then
    -- Quota respecté : ajout de la requête avec son horodatage milliseconde en guise de score
    redis.call('ZADD', key, now, requestId)
    -- Définition de l'expiration automatique de la clé pour éviter toute fuite mémoire
    redis.call('PEXPIRE', key, window)
    return { 1, limit - currentCount - 1, 0 } -- Résultat : { Autorisé = 1, Requêtes restantes, Temps d'attente = 0 }
else
    -- Quota épuisé : détermination de l'horodatage de la plus ancienne requête pour calculer le retry
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retryAfterMs = 0
    if oldest and #oldest >= 2 then
        retryAfterMs = math.max(0, math.floor(tonumber(oldest[2]) + window - now))
    else
        retryAfterMs = window
    end
    return { 0, 0, math.ceil(retryAfterMs / 1000) } -- Résultat : { Refusé = 0, 0 restantes, Retry-After en secondes }
end
```

### 9.3 En-têtes HTTP de Télémétrie de Quota (RFC 6585)
Chaque requête traitée par l'API Gateway ou le framework Fastify retourne les en-têtes standardisés ci-dessous, permettant au HUD Web et au bot Discord d'adapter leur rythme d'émission :
```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 114
X-RateLimit-Reset: 1794386460
Retry-After: 42
```

---

## 10. Matrice Complète des Endpoints OpenAPI Manquants (`openapi.paths` Complément)

Pour garantir une couverture intégrale de la documentation OpenAPI 3.1.0, voici les spécifications additionnelles des routes secondaires et utilitaires du Système :

```json
{
  "/player/vital-gauges": {
    "patch": {
      "summary": "Mise à Jour Manuelle ou Télémétrique des Jauges HP/MP",
      "operationId": "updateVitalGauges",
      "tags": ["Profil Joueur"],
      "security": [{ "BearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "hp": { "type": "integer", "minimum": 0, "maximum": 100 },
                "mp": { "type": "integer", "minimum": 0, "maximum": 100 },
                "reason": { "type": "string" }
              },
              "required": ["reason"]
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Jauges vitales mises à jour avec succès" },
        "422": { "description": "Valeurs de jauge en dehors de la plage permise" }
      }
    }
  },
  "/skills/tree": {
    "get": {
      "summary": "Arbre Hiérarchique Complet des Compétences",
      "operationId": "getSkillTree",
      "tags": ["Arbre de Compétences"],
      "security": [{ "BearerAuth": [] }],
      "parameters": [
        {
          "name": "base_stat",
          "in": "query",
          "required": false,
          "schema": {
            "type": "string",
            "enum": ["ACAD", "AI_ENG", "CYBER", "EXP", "LNG", "FIN", "STR", "DIS"]
          }
        }
      ],
      "responses": {
        "200": { "description": "Structure de l'arbre et statut des nœuds retournés" }
      }
    }
  },
  "/skills/{node_id}/unlock": {
    "post": {
      "summary": "Déverrouillage d'un Nœud de Compétence avec Consommation d'XP",
      "operationId": "unlockSkillNode",
      "tags": ["Arbre de Compétences"],
      "security": [{ "BearerAuth": [] }, { "IdempotencyHeader": [] }],
      "parameters": [
        {
          "name": "node_id",
          "in": "path",
          "required": true,
          "schema": { "type": "string", "format": "uuid" }
        }
      ],
      "requestBody": {
        "required": false,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "validation_proof_url": { "type": "string", "format": "uri" }
              }
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Nœud débloqué et niveau augmenté" },
        "412": { "description": "Prérequis de nœud ou de rang non satisfaits" }
      }
    }
  },
  "/quests/emergency": {
    "get": {
      "summary": "Liste des Quêtes d'Urgence Actives avec Compte à Rebours",
      "operationId": "getEmergencyQuests",
      "tags": ["Quêtes"],
      "security": [{ "BearerAuth": [] }],
      "responses": {
        "200": { "description": "Quêtes urgentes actives" }
      }
    }
  },
  "/quests/boss-raids": {
    "get": {
      "summary": "Consultation des Boss Raids Majeurs Débloqués",
      "operationId": "getBossRaids",
      "tags": ["Quêtes"],
      "security": [{ "BearerAuth": [] }],
      "responses": {
        "200": { "description": "Liste des Boss Raids et objectifs" }
      }
    }
  },
  "/penalty/status": {
    "get": {
      "summary": "Vérification du Statut du Protocole de Pénalité",
      "operationId": "getPenaltyStatus",
      "tags": ["Pénalité"],
      "security": [{ "BearerAuth": [] }],
      "responses": {
        "200": { "description": "État du pare-feu et des blocages de divertissement" }
      }
    }
  },
  "/penalty/acknowledge": {
    "post": {
      "summary": "Accusé de Réception de la Quête de Pénalité",
      "operationId": "acknowledgePenalty",
      "tags": ["Pénalité"],
      "security": [{ "BearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "client_screen_timestamp": { "type": "string", "format": "date-time" }
              },
              "required": ["client_screen_timestamp"]
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Prise de connaissance actée, pare-feu armé" }
      }
    }
  },
  "/sync/push": {
    "post": {
      "summary": "Transmission du Flux de Mutations Locales Dexie vers PostgreSQL",
      "operationId": "syncPush",
      "tags": ["Synchronisation"],
      "security": [{ "BearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "client_id": { "type": "string", "format": "uuid" },
                "last_sync_timestamp": { "type": "string", "format": "date-time" },
                "mutations": { "type": "array", "items": { "type": "object" } }
              },
              "required": ["client_id", "last_sync_timestamp", "mutations"]
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Mutations intégrées et conflits résolus" }
      }
    }
  },
  "/sync/pull": {
    "post": {
      "summary": "Récupération du Delta de Modifications Serveur vers le Client",
      "operationId": "syncPull",
      "tags": ["Synchronisation"],
      "security": [{ "BearerAuth": [] }],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "since_timestamp": { "type": "string", "format": "date-time" }
              },
              "required": ["since_timestamp"]
            }
          }
        }
      },
      "responses": {
        "200": { "description": "Delta de synchronisation retourné" }
      }
    }
  }
}
```

---

## 11. Checklist de Validation du Contrat d'API

Avant tout déploiement en production, l'ingénieur ou l'agent d'automatisation doit vérifier la conformité des points suivants :
1. **Zéro Émission de Valeurs Flottantes Imprécises** : Les identifiants BigInt d'expérience sont strictement sérialisés en chaînes UTF-8 dans les réponses JSON.
2. **Idempotence des Mutations Financières et d'XP** : Chaque appel modifiant le solde de cristaux ou attribuant de l'expérience valide la présence de l'en-tête `Idempotency-Key`.
3. **Chiffrement Obligatoire des Transmissions** : Aucune route n'accepte de paquets en clair (redirection 301 automatique vers HTTPS / TLS 1.3).
4. **Validation Zod Bidirectionnelle** : Le middleware valide le payload entrant (`req.body`) ET la conformité de l'objet sortant (`res.json`) en environnement de test pour interdire toute régression de contrat.
