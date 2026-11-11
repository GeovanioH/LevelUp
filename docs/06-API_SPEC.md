# Contrats d'API & Spécifications des Interfaces REST/WebSocket — LevelUp

> **Document ID :** API-LVLUP-006  
> **Nom du Produit :** LevelUp ("The System")  
> **Version du Document :** 2.0.0 (Spécification de Contrats Exhaustive)  
> **Statut :** Validé pour Implémentation  
> **Format :** JSON REST API & WebSocket Protocol (Validation Zod Stricte)  
> **Base URL :** `https://api.levelup.local/api/v1` (Développement local : `http://localhost:3000/api/v1`)

---

## 1. Conventions Globales & Structure des Réponses

### 1.1 Format de Réponse Succès Standard (`2xx`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-11T07:30:00.000Z",
    "request_id": "req_8f12a9b4-3c21-4d92-a1b8-e04f210a48b3"
  }
}
```

### 1.2 Format de Réponse Erreur Standard (`4xx`, `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUEST_SUBMISSION",
    "message": "La preuve soumise est incomplète ou le lien est inaccessible.",
    "details": [
      {
        "field": "proof_data",
        "issue": "L'URL fournie renvoie un code HTTP 404 Not Found."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-11-11T07:30:01.000Z",
    "request_id": "req_8f12a9b4-3c21-4d92-a1b8-e04f210a48b3"
  }
}
```

---

## 2. Endpoints d'Authentification & Session

### 2.1 `POST /auth/login`
Connexion de l'utilisateur avec émission du cookie sécurisé.
* **Payload Requête :**
```json
{
  "username": "Huriel",
  "password": "MasterPassword2026!#"
}
```
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "player_id": "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
    "username": "Huriel",
    "role": "MONARCH_OWNER"
  }
}
```
* **En-têtes Retournés :**
  `Set-Cookie: session=eyJhbGciOi...; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`

---

## 3. Endpoints Profil Joueur & Statistiques

### 3.1 `GET /player/status`
Retourne la photographie complète de l'état du joueur pour l'affichage du HUD Web et des commandes Discord.
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "id": "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
    "username": "Huriel",
    "current_level": 14,
    "total_xp": "18450",
    "rank": {
      "code": "D",
      "title": "Chasseur Confirmé",
      "next_rank_code": "C",
      "xp_required_for_next_rank": "22500",
      "progress_percentage": 82.0
    },
    "vital_gauges": {
      "hp": { "current": 85, "max": 100, "status": "REPOSÉ" },
      "mp": { "current": 60, "max": 100, "status": "CONCENTRÉ" }
    },
    "stats": [
      { "code": "ACAD", "name": "Excellence Académique", "level": 15, "current_xp": 1450, "next_level_xp": 1800 },
      { "code": "AI_ENG", "name": "Ingénierie IA & Hackathons", "level": 16, "current_xp": 1920, "next_level_xp": 2200 },
      { "code": "CYBER", "name": "Cybersécurité", "level": 12, "current_xp": 950, "next_level_xp": 1400 },
      { "code": "EXP", "name": "Éloquence & Réseautage", "level": 9, "current_xp": 420, "next_level_xp": 900 },
      { "code": "LNG", "name": "Langues & Anglais C1", "level": 14, "current_xp": 1250, "next_level_xp": 1600 },
      { "code": "FIN", "name": "Finances & Opportunités", "level": 8, "current_xp": 350, "next_level_xp": 800 },
      { "code": "STR", "name": "Puissance Physique", "level": 13, "current_xp": 1050, "next_level_xp": 1500 },
      { "code": "DIS", "name": "Discipline & Volonté", "level": 17, "current_xp": 2400, "next_level_xp": 2700 }
    ],
    "active_time_block": {
      "id": "blk-9812",
      "title": "TryHackMe : Buffer Overflow Exploitation Avancée",
      "start_time": "14:00",
      "end_time": "16:30",
      "time_remaining_seconds": 4462,
      "target_stat": "CYBER"
    }
  }
}
```

---

## 4. Endpoints Quêtes & Événements

### 4.1 `GET /quests/today`
Récupère les quêtes actives pour la date courante.
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "date": "2026-11-11",
    "completion_rate": 0.75,
    "quests": [
      {
        "id": "qst-01",
        "quest_code": "DAILY-20261111-STR",
        "title": "Séance Force Dos & Abdos (45 min)",
        "quest_type": "DAILY",
        "target_stat": "STR",
        "xp_reward": 100,
        "status": "COMPLETED",
        "expires_at": "2026-11-11T23:59:59.000Z"
      },
      {
        "id": "qst-02",
        "quest_code": "DAILY-20261111-CYBER",
        "title": "Exploitation Faille Mémoire TryHackMe",
        "quest_type": "DAILY",
        "target_stat": "CYBER",
        "xp_reward": 150,
        "status": "ACTIVE",
        "expires_at": "2026-11-11T23:59:59.000Z"
      }
    ]
  }
}
```

### 4.2 `POST /quests/{id}/complete`
Valide une quête avec fourniture de preuve vérifiable.
* **Payload Requête :**
```json
{
  "proof_type": "GITHUB_URL",
  "proof_data": "https://github.com/GeovanioH/ai-agent-core/commit/8f102a4b",
  "notes": "Implémentation du middleware d'idempotence des agents terminés."
}
```
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "quest_id": "qst-02",
    "status": "COMPLETED",
    "rewards": {
      "player_xp_gained": 150,
      "stat_boosted": "AI_ENG",
      "stat_xp_gained": 150,
      "did_level_up": true,
      "new_level": 15,
      "unlocked_features": ["Accès Quêtes Commando Monk Mode"]
    },
    "system_message": "QUEST COMPLETE. L'Architecte a certifié votre accomplissement."
  }
}
```

---

## 5. Endpoints Transcription Audio & Cerveau Numérique

### 5.1 `POST /audio/transcribe`
Réception d'un mémo vocal, transcription, synthèse et création de la note Markdown.
* **Content-Type :** `multipart/form-data`
* **Champs du Formulaire :**
  * `audio_file` : Binaire audio (`audio/webm` ou `audio/wav`).
  * `target_stat` : Code de la base concernée (ex: `AI_ENG`, `ACAD`).
  * `create_note` : Booléen (`true`).
* **Réponse `201 Created` :**
```json
{
  "success": true,
  "data": {
    "transcription_id": "trc_4b8f01a9",
    "duration_seconds": 124,
    "raw_transcript": "Aujourd'hui révision approfondie des architectures Mixture of Experts et du routage Top-2...",
    "ai_summary": "### Points Clés :\n- Mécanisme de sparsité conditionnelle.\n- Économie de calcul FLOPs à l'inférence.\n- Routage Top-2 avec fonction de perte de balancement.",
    "architect_evaluation": {
      "score_out_of_20": 18,
      "feedback": "Excellente synthèse technique, concepts bien assimilés.",
      "xp_awarded": 120
    },
    "generated_note": {
      "slug": "mixture-of-experts-synthese-20261111",
      "title": "Mixture of Experts & Routage Top-2",
      "file_path": "/notes/ai-research/mixture-of-experts-synthese-20261111.md"
    }
  }
}
```

---

## 6. Endpoints Radar d'Opportunités Deerflow

### 6.1 `GET /opportunities`
Récupère les opportunités de bourses et compétitions actives.
* **Paramètres de Requête :** `?category=SCHOLARSHIP&status=NEW`
* **Réponse `200 OK` :**
```json
{
  "success": true,
  "data": {
    "total_count": 4,
    "opportunities": [
      {
        "id": "opp-01",
        "title": "Bourse d'Excellence Master IA & Technologies Émergentes",
        "source": "DEERFLOW",
        "category": "SCHOLARSHIP",
        "estimated_value_eur": 8500,
        "deadline": "2026-12-15T23:59:59.000Z",
        "external_url": "https://scholarships.example.org/ai-excellence-2026",
        "status": "NEW"
      }
    ]
  }
}
```

---

## 7. Spécification WebSocket (Événements Temps Réel)

Le serveur expose un endpoint WebSocket sur `wss://api.levelup.local/ws` pour synchroniser le HUD et Discord à la seconde près.

### Événements Émis par le Serveur :
1. `ALARM_TRIGGERED` : Émis à la seconde exacte de fin d'un bloc horaire :
   ```json
   { "event": "ALARM_TRIGGERED", "payload": { "block_id": "blk-9812", "title": "Fin de séance TryHackMe", "next_block": "Pause & Marche" } }
   ```
2. `EMERGENCY_QUEST_SPAWNED` : Déclenche l'alerte holographique sur le HUD et Discord :
   ```json
   { "event": "EMERGENCY_QUEST_SPAWNED", "payload": { "quest_id": "eq-04", "title": "Analyse Faille Zero-Day", "time_limit_minutes": 60 } }
   ```
3. `LEVEL_UP` : Déclenche la fanfare visuelle et sonore Solo Leveling :
   ```json
   { "event": "LEVEL_UP", "payload": { "new_level": 15, "unlocked_title": "Élite des Ombres" } }
   ```
