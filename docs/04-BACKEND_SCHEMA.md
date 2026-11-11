# Modèle de Données & Schéma Backend — LevelUp

> **Nom du Projet :** LevelUp ("The System")  
> **Version :** 1.0.0  
> **SGBD :** PostgreSQL (via Prisma ORM ou SQLAlchemy)

---

## 1. Diagramme Entité-Relation (ERD Mermaid)

```mermaid
erDiagram
    PLAYER ||--o{ PLAYER_STAT : "possède 8 stats"
    PLAYER ||--o{ QUEST : "reçoit"
    PLAYER ||--o{ TIME_BLOCK : "programme"
    PLAYER ||--o{ SECOND_BRAIN_NOTE : "rédige"
    PLAYER ||--o{ OPPORTUNITY : "enregistre"
    
    PLAYER_STAT ||--o{ SKILL_NODE : "débloque"
    QUEST ||--o| VOICE_TRANSCRIPTION : "peut valider via"
    SECOND_BRAIN_NOTE ||--o{ VOICE_TRANSCRIPTION : "générée par"

    PLAYER {
        uuid id PK
        string username
        int level
        bigint total_xp
        string rank_code "F, E, D, C, B, A, S, NATION, MONARCH"
        int current_hp
        int max_hp
        int current_mp
        int max_mp
        string current_title
        string theme_preference "DARK_MONARCH / LIGHT_AWAKENING"
        timestamp created_at
    }

    PLAYER_STAT {
        uuid id PK
        uuid player_id FK
        string base_code "ACAD, AI_ENG, CYBER, EXP, LNG, FIN, STR, DIS"
        int level
        int current_xp
        int next_level_xp
        int total_points_invested
    }

    SKILL_NODE {
        uuid id PK
        string base_code
        uuid parent_node_id FK
        string name
        string description
        int required_stat_level
        boolean is_unlocked
    }

    QUEST {
        uuid id PK
        uuid player_id FK
        string title
        text description
        string quest_type "DAILY, EMERGENCY, BOSS, JOB_CHANGE, PENALTY"
        string target_stat "ACAD, AI_ENG, CYBER, EXP, LNG, FIN, STR, DIS"
        int xp_reward
        timestamp available_at
        timestamp expires_at
        string status "PENDING, ACTIVE, COMPLETED, FAILED, EXPIRED"
        string proof_type "AUDIO_SUMMARY, GITHUB_URL, SCREENSHOT, TEXT_LOG, NONE"
        text proof_content
    }

    TIME_BLOCK {
        uuid id PK
        uuid player_id FK
        date block_date
        time start_time
        time end_time
        string activity_title
        string target_stat
        boolean is_completed
        boolean alarm_triggered
    }

    SECOND_BRAIN_NOTE {
        uuid id PK
        uuid player_id FK
        string title
        string slug UK
        text markdown_content
        string[] tags
        string related_stat
        timestamp created_at
        timestamp updated_at
    }

    VOICE_TRANSCRIPTION {
        uuid id PK
        uuid note_id FK
        int duration_seconds
        text raw_transcript
        text ai_summary
        int ai_quality_score
        timestamp transcribed_at
    }

    OPPORTUNITY {
        uuid id PK
        uuid player_id FK
        string source "DEERFLOW, GITHUB_PACK, CAMBRIDGE, DEVPOST"
        string category "SCHOLARSHIP, HACKATHON, CERTIFICATION, GRANT"
        string title
        text description
        string external_url
        timestamp deadline
        string status "NEW, TRACKED, APPLIED, WON, REJECTED"
    }
```

---

## 2. Définition Détaillée des Tables Principales

### 2.1 Table `players`
* `id` : UUID v4, Clé primaire.
* `rank_code` : Énumération stricte : `'F'`, `'E'`, `'D'`, `'C'`, `'B'`, `'A'`, `'S'`, `'NATION'`, `'MONARCH'`.
* `total_xp` : Entier 64-bit pour éviter tout dépassement d'entier sur le long terme.
* `current_hp` / `max_hp` : Points de récupération physique (calibrés par le sommeil).
* `current_mp` / `max_mp` : Points d'énergie mentale (consommés par le Deep Work).

### 2.2 Table `player_stats`
* Index composite unique `(player_id, base_code)` pour garantir l'unicité stricte des 8 bases par joueur.
* `base_code` : Vérifié par contrainte CHECK parmi `['ACAD', 'AI_ENG', 'CYBER', 'EXP', 'LNG', 'FIN', 'STR', 'DIS']`.

### 2.3 Table `quests`
* Clé d'idempotence journalière : une contrainte d'unicité empêche d'injecter deux fois la même quête quotidienne pour une date donnée.
* `status` : Machine à état stricte : `PENDING` $\rightarrow$ `ACTIVE` $\rightarrow$ (`COMPLETED` ou `FAILED` / `EXPIRED`).

### 2.4 Table `second_brain_notes`
* Support natif pour la recherche plein texte (*Full-Text Search*) via index GIN PostgreSQL sur `title` et `markdown_content`.

---

## 3. Formules de Calcul Mathématique de l'XP

* **Progression du Niveau Joueur :**
  $$\text{XP}_{\text{requis}}(L) = 100 \times \lfloor L^{1.75} \rfloor$$
  *Cette courbe assure une progression dynamique sur les 10 premiers niveaux, puis impose un travail soutenu pour gravir les rangs supérieurs.*

* **Progression d'une Base Statistique :**
  $$\text{XP}_{\text{stat}}(S) = 50 \times \lfloor S^{1.6} \rfloor$$
