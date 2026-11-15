# Directives du Projet LevelUp — Workspace Antigravity

Ce projet implémente une plateforme modulaire de suivi de performance, de discipline et de développement de compétences (auto-quantification et gamification de vie). Conçu comme un moteur universel, il permet à tout utilisateur de structurer et mesurer sa progression. Les objectifs individuels et programmes personnalisés sont configurés dans config/personal_profile.md.

---

## 1. Principes d'Architecture & Coûts
- **Orchestration Locale & Quotas Gratuits** : Le système fonctionne sans dépendance à des API externes payantes.
- **Moteur d'Orchestration** : La génération des quêtes, les bilans réguliers et l'évaluation orale sont pris en charge localement via l'agent Antigravity (automatisations, skills et scripts dédiés).
- **Communication Locale** : L'application web (PWA Next.js / Fastify / PostgreSQL / SQLite) communique avec le système localement via des endpoints REST / WebSocket et les configurations partagées.

---

## 2. Invariants Mécaniques du Système

### Échelle des Rangs (100 Niveaux)
1. **Rang E : Débutant** (Niveaux 1 à 10)
2. **Rang D : Confirmé** (Niveaux 11 à 25)
3. **Rang C : Avancé** (Niveaux 26 à 45)
4. **Rang B : Expert** (Niveaux 46 à 65)
5. **Rang A : Élite** (Niveaux 66 à 85)
6. **Rang S : Sommet** (Niveaux 86 à 95)
7. **Rang Maître : Référence** (Niveaux 96 à 100)

Le passage de rang nécessite la validation conjointe du niveau global et des critères réels de qualification (ex. projets, certifications, victoires de hackathons).

### Calcul du Niveau Global par Moyenne Harmonique Pondérée
Le niveau global est déterminé par le Score Harmonique $S_H$ des 8 bases de vie :
$$S_H = \frac{8}{\sum_{i=1}^8 \frac{1}{\max(S_i, 1)}}$$
Toute faiblesse majeure sur une base fait baisser le score global $S_H$, incitant à un travail équilibré sur l'ensemble des domaines.

### Modélisation des Jauges de Vitalité (HP) et de Focus (MP)
- **HP (Vitalité)** : Décroissance amortie basée sur le modèle homéostatique de sommeil (Borbély).
- **MP (Focus Mental)** : Décroissance avec le travail cognitif soutenu, régénération par les pauses et la complétion des tâches.

### Programmes d'Exercices Physiques (Base STR)
- **Dos & Épaules (17 étapes)** : Jumping Jacks (00:30) $\to$ Hyperextension (x14) $\to$ Pike Push Ups (x14) $\to$ Reverse Push-Ups (x12) $\to$ Inchworms (x16) $\to$ Side-Lying Stretch G (00:30) $\to$ Side-Lying Stretch D (00:30) $\to$ Hyperextension (x12) $\to$ Pike Push Ups (x12) $\to$ Reverse Push-Ups (x10) $\to$ Inchworms (x14) $\to$ Cat Cow Pose (00:35) $\to$ Supine Push Up (x14) $\to$ Floor Y Raises (x14) $\to$ Supine Push Up (x13) $\to$ Reverse Snow Angels (x12) $\to$ Child's Pose (00:30).
- **Bras & Triceps** : 6 variantes en séries poussées jusqu'à échec postural.
- **Abdos & Core** : V-Ups, Mountain Climbers, relevés de jambes et gainage.
- **Validation** : Détection cinématique en direct via MediaPipe Pose (WebAssembly).

### Grille d'Évaluation Orale (20 Points)
Les synthèses techniques et monologues d'anglais sont évalués sur 20 points selon 4 axes :
1. Précision Conceptuelle & Vocabulaire (/5)
2. Fluidité & Aisance d'Élocution (/5)
3. Rigueur de la Synthèse & Logique (/5)
4. Application Pratique & Défense (/5)
