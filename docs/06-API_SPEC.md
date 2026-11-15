# Spécification de l'API REST & WebSockets — LevelUp

> **Document ID :** API-LVLUP-006  
> **Version :** 3.1.0 (Édition Pareto Simplifiée)  
> **Statut :** Approuvé pour Implémentation  

---

## 1. Conventions Générales & Authentification

* **Base URL** : `/api/v1`
* **Format des Données** : JSON strict (`Content-Type: application/json; charset=utf-8`)
* **Authentification** : Jeton Bearer JWT passé dans l'en-tête `Authorization: Bearer <access_token>`
* **Format Standard d'Erreur** :
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Description explicite de l'erreur",
    "timestamp": "2026-11-15T09:00:00.000Z"
  }
  ```

---

## 2. Référentiel des Endpoints REST

### 2.1 Authentification (`/auth`)
* `POST /auth/login`
  * *Body* : `{ "email": "user@levelup.io", "password": "secure_password" }`
  * *Réponse 200* : `{ "accessToken": "...", "expiresIn": 900 }` (Refresh token posé en cookie HttpOnly).
* `POST /auth/refresh`
  * *Réponse 200* : `{ "accessToken": "...", "expiresIn": 900 }`.

### 2.2 Profil & Statistiques du Joueur (`/player`)
* `GET /player/profile`
  * *Réponse 200* :
    ```json
    {
      "id": "uuid-player-1",
      "username": "PlayerOne",
      "rankCode": "B",
      "globalLevel": 52,
      "globalScore": 542.8,
      "crystalsBalance": 350
    }
    ```
* `GET /player/stats`
  * *Réponse 200* : Renvoie les scores et niveaux pour chacune des 8 bases de vie (`ACAD`, `AI_ENG`, `CYBER`, etc.).

### 2.3 Quêtes & Soumissions (`/quests`)
* `GET /quests/daily`
  * *Réponse 200* : Tableau des 4 quêtes obligatoires du jour avec leur statut (`PENDING`, `COMPLETED`).
* `POST /quests/:id/submit`
  * *Body* : `{ "proofUrl": "https://github.com/...", "proofData": { "notes": "Fiche de synthèse" } }`
  * *Réponse 201* : `{ "submissionId": "...", "status": "IN_PROGRESS" }`.
* `POST /quests/:id/complete`
  * *Description* : Attribution atomique des points d'XP (protégée par verrou distribué Redlock).
  * *Réponse 200* : `{ "success": true, "xpAwarded": 150, "newScore": 560.2 }`
  * *Réponse 409* : Quête déjà validée (Anti-Double Dépense).

### 2.4 Moteur Vocale & Évaluation Socratique (`/audio`)
* `POST /audio/evaluate`
  * *Body* : `multipart/form-data` contenant le fichier audio (`.wav`, `.opus`, `.webm`).
  * *Réponse 200* :
    ```json
    {
      "transcript": "Texte transcrit via Faster-Whisper...",
      "score": 17.5,
      "breakdown": {
        "conceptualPrecision": 4.5,
        "fluency": 4.0,
        "synthesisRigor": 4.5,
        "practicalApplication": 4.5
      },
      "feedback": "Analyse socratique constructive..."
    }
    ```

### 2.5 Caméra & Détection de Mouvements (`/workout`)
* `POST /workout/verify-reps`
  * *Body* : `{ "exerciseType": "PUSH_UPS", "repsCount": 30, "poseConfidence": 0.94 }`
  * *Réponse 200* : `{ "verified": true, "xpAwarded": 100 }`.

### 2.6 Mode Restriction & Sanctions (`/penalties`)
* `GET /penalties/status`
  * *Réponse 200* : `{ "isRestricted": false, "activeLocks": [] }`.
* `POST /penalties/purge`
  * *Body* : `{ "proofType": "CALISTHENICS_CAMERA", "repsValidated": 200 }`
  * *Réponse 200* : `{ "purged": true, "nextDnsUnlocked": true }`.

### 2.7 Veille d'Opportunités (`/opportunities`)
* `GET /opportunities`
  * *Réponse 200* : Liste des opportunités (hackathons, financements, bourses) détectées par le scraper.
* `POST /opportunities/webhook`
  * *En-têtes* : `X-Deerflow-Signature: <hmac_sha256>`
  * *Réponse 200* : `{ "received": true, "indexedCount": 4 }`.

---

## 3. Événements Temps Réel WebSockets

* **Connexion** : `wss://host/ws/realtime?token=<access_token>`
* **Canaux & Événements Émis par le Serveur** :
  * `STATS_UPDATED` : Mise à jour en temps réel des jauges ($HP$, $MP$) et des scores des 8 bases.
  * `QUEST_COMPLETED` : Notification sonore et visuelle de validation de quête.
  * `PENALTY_TRIGGERED` : Bascule instantanée du Web HUD vers l'interface de restriction rouge sang.
  * `PENALTY_PURGED` : Rétablissement des accès et fin du mode restriction.
