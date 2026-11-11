# Contrats d'API & Interfaces — LevelUp

> **Nom du Projet :** LevelUp ("The System")  
> **Version :** 1.0.0  
> **Format :** JSON REST API avec validation Zod / Pydantic

---

## 1. Endpoints Joueur & HUD

### 1.1 `GET /api/v1/player/status`
Récupère l'état complet du profil (Niveau, Rang, Jauges HP/MP et les 8 bases de stats).

* **Réponse `200 OK` :**
```json
{
  "id": "a5d8b74f-9e32-4d2b-98f5-19e48f029a1b",
  "username": "Huriel",
  "level": 12,
  "total_xp": 15420,
  "rank": {
    "code": "D",
    "title": "Chasseur Éveillé",
    "next_rank": "C",
    "xp_to_next_rank": 4580
  },
  "vital_gauges": {
    "hp": { "current": 85, "max": 100, "status": "REPOSÉ" },
    "mp": { "current": 60, "max": 100, "status": "CONCENTRÉ" }
  },
  "stats": [
    { "code": "ACAD", "name": "Excellence Académique", "level": 14, "xp": 1200, "next_level_xp": 1500 },
    { "code": "AI_ENG", "name": "Ingénierie IA & Hackathons", "level": 15, "xp": 1850, "next_level_xp": 2100 },
    { "code": "CYBER", "name": "Cybersécurité", "level": 11, "xp": 800, "next_level_xp": 1200 },
    { "code": "EXP", "name": "Éloquence & Réseautage", "level": 9, "xp": 450, "next_level_xp": 900 },
    { "code": "LNG", "name": "Langues & Anglais", "level": 13, "xp": 1100, "next_level_xp": 1400 },
    { "code": "FIN", "name": "Finances & Opportunités", "level": 8, "xp": 300, "next_level_xp": 750 },
    { "code": "STR", "name": "Puissance Physique", "level": 12, "xp": 950, "next_level_xp": 1350 },
    { "code": "DIS", "name": "Discipline & Volonté", "level": 16, "xp": 2200, "next_level_xp": 2500 }
  ]
}
```

---

## 2. Endpoints Quêtes & Événements

### 2.1 `GET /api/v1/quests/today`
Récupère les quêtes actives pour la journée courante.

### 2.2 `POST /api/v1/quests/{id}/complete`
Valide une quête avec fourniture optionnelle de preuve.

* **Payload Requête :**
```json
{
  "proof_type": "AUDIO_SUMMARY",
  "proof_data": "https://storage.levelup.local/transcripts/rec-20261111-01.json",
  "notes": "Synthèse de 3 chapitres du livre sur les Transformers"
}
```

* **Réponse `200 OK` :**
```json
{
  "quest_id": "8c4a11f2-77e8-450b-8d2b-10f8a92e1022",
  "status": "COMPLETED",
  "rewards": {
    "player_xp_gained": 150,
    "stat_boosted": "AI_ENG",
    "stat_xp_gained": 120,
    "did_level_up": false
  },
  "system_message": "QUEST COMPLETE. The Architect has verified your submission."
}
```

---

## 3. Endpoints Transcription Vocale & Second Brain

### 3.1 `POST /api/v1/audio/transcribe`
Envoi d'un enregistrement audio pour transcription et analyse IA.

* **Payload :** `multipart/form-data` avec le fichier binaire `.wav` ou `.webm` (`audio_file`).
* **Réponse `201 Created` :**
```json
{
  "transcription_id": "b3e94a11-0982-4f32-8df1-7e8c09a82311",
  "raw_transcript": "Aujourd'hui j'ai analysé l'architecture du modèle Mistral 7B...",
  "ai_summary": "Points clés : 1. Mécanisme Sliding Window Attention. 2. Économie de calcul...",
  "target_stat": "AI_ENG",
  "markdown_note_slug": "mistral-7b-analyse-2026-11-11",
  "quality_score": 18
}
```

---

## 4. Endpoints Planificateur (Time-Blocking)

### 4.1 `GET /api/v1/schedule/today`
Récupère la journée programmée bloc par bloc.

* **Réponse `200 OK` :**
```json
{
  "date": "2026-11-11",
  "blocks": [
    {
      "id": "blk-01",
      "start_time": "06:30",
      "end_time": "07:30",
      "title": "Séance Musculation (Dos & Bras)",
      "target_stat": "STR",
      "is_completed": true
    },
    {
      "id": "blk-02",
      "start_time": "08:30",
      "end_time": "11:30",
      "title": "Deep Work IA (Architecture Réseau de Neurones)",
      "target_stat": "AI_ENG",
      "is_completed": false
    }
  ]
}
```
