# Product Requirements Document (PRD) — LevelUp

> **Document ID :** PRD-LVLUP-001  
> **Version :** 3.1.0 (Édition Pareto Simplifiée)  
> **Statut :** Approuvé pour Implémentation  

---

## 1. Contexte & Problématique Fonctionnelle

L'acquisition et le maintien de compétences techniques complexes, de condition physique et de discipline personnelle souffrent d'un manque de rétroaction immédiate et d'outils de mesure objectifs. Les applications classiques de productivité ne fournissent ni boucle de récompense proportionnée à l'effort réel, ni vérification automatisée de l'exécution par des oracles logiciels.

**LevelUp** résout ce problème en introduisant un moteur d'auto-quantification et de gamification universel. Le système est conçu comme un framework modulaire que chaque utilisateur peut adapter à ses propres domaines d'apprentissage, projets techniques et objectifs de condition physique.

> [!NOTE]
> Les objectifs individuels et programmes spécifiques de l'utilisateur actif sont isolés dans [`config/personal_profile.md`](../config/personal_profile.md).

---

## 2. Les 8 Bases de Vie & Modèle Mathématique

Le système structure la progression autour de **8 Bases de Vie fondamentales** :
1. **`ACAD`** (Apprentissage & Théorie) : Modèles théoriques, mathématiques appliquées, révision espacée (SM-2).
2. **`AI_ENG`** (Ingénierie Logicielle & IA) : Architectures logicielles, MVPs, modèles d'IA et code en production.
3. **`CYBER`** (Sécurité des Systèmes) : Sécurité offensive et défensive, labs, audits de vulnérabilités et CTFs.
4. **`EXP`** (Éloquence & Réseau) : Restitutions orales, synthèses techniques, leadership et prise de parole.
5. **`LNG`** (Langues & Communication) : Pratique active des langues cibles, vocabulaire et compréhension technique.
6. **`FIN`** (Gestion Financière & Opportunités) : Veille automatique (Deerflow), bourses, primes et budget.
7. **`STR`** (Force & Santé Posturale) : Calisthénie au poids du corps validée par détection de pose cinématique.
8. **`DIS`** (Discipline Opérationnelle) : Respect des blocs de travail (Time-Blocking) et zéro sanction de distraction.

### Modélisation Mathématique
* **Score de Base ($S_b \in [0, 1000]$)** : Alimenté par les compétences validées, les quêtes réussies et les preuves auditées.
* **Niveau de Base ($L_b \in [1, 100]$)** :
  $$L_b = \min \left( 100, \left\lfloor \sqrt{\frac{S_b}{1000}} \times 100 \right\rfloor \right)$$
* **Score Global Harmonique ($S_{\text{global}}$)** :
  Calculé par moyenne harmonique pondérée pour interdire tout délaissement d'un domaine vital ($\sum w_b = 1.0$) :
  $$S_{\text{global}} = \frac{1}{\sum_{b=1}^{8} \frac{w_b}{S_b + 0.01}}$$
* **Jauges Physiologiques** :
  * **HP (Vitalité)** : Évolution homéostatique liée au sommeil (Borbély).
  * **MP (Concentration)** : Consommation par le Deep Work et régénération par les pauses (Boksem).

---

## 3. Système des Rangs & Invariants Réels

La progression en rang dépend conjointement du niveau global et de preuves tangibles dans le monde réel :

| Rang | Niveaux | Statut | Critères Réels Obligatoires (DoD) |
| :--- | :--- | :--- | :--- |
| **E** | **1 à 10** | *Novice* | Environnement configuré, 7 jours de quêtes parfaits, Second Brain initialisé. |
| **D** | **11 à 25** | *Apprenti* | $S_{\text{ACAD}} \ge 250$, premiers scripts autonomes, assiduité physique régulière. |
| **C** | **26 à 45** | *Confirmé* | Projet fullstack opérationnel déployé, assiduité sur 30 jours, révisions SM-2. |
| **B** | **46 à 65** | *Expert* | Victoire/podium en défi technique majeur (hackathon/CTF), certification officielle, calisthénie complète. |
| **A** | **66 à 85** | *Référent* | Multiples réalisations majeures, solution en production avec utilisateurs réels, éloquence fluide. |
| **S** | **86 à 95** | *Sommité* | Accomplissements d'envergure internationale, autonomie opérationnelle totale. |
| **Maître** | **96 à 100** | *Maître Suprême* | Plafond du système : harmonie parfaite et niveau maximal sur l'ensemble des 8 bases. |

---

## 4. Spécifications des Fonctionnalités Clés

### 4.1 Web HUD & Tableau de Bord
* Interface futuriste sombre avec visualisations radar des 8 bases, jauges de vitalité ($HP$, $MP$) et affichage des quêtes actives.
* Mode hors-ligne avec synchronisation automatique via IndexedDB (Dexie.js).

### 4.2 Moteur de Quêtes & Anti-Double Dépense
* Quêtes journalières réparties sur les bases clés (sport, révision théorique, audio).
* Validation atomique protégée par verrous distribués Redlock pour interdire les doubles validations.

### 4.3 Pipeline d'Évaluation Vocale
* Enregistrement audio local, transcription rapide par Faster-Whisper (INT8 local).
* Évaluation socratique sur 20 points par l'agent IA (précision conceptuelle, fluidité, rigueur, argumentation).

### 4.4 Détection Cinématique par Caméra
* Suivi des mouvements au poids du corps via MediaPipe Pose (WebAssembly).
* Comptage strict des répétitions sans possibilité de simulation ou falsification.

### 4.5 Mode Restriction & Pénalités (NextDNS & WFP)
* Déclenchement automatique en cas d'inactivité avant 22h00.
* Blocage réseau au niveau DNS (API NextDNS) et local (filtrage WFP / hosts).
* Levée de la restriction conditionnée à l'accomplissement d'une épreuve physique de compensation (Quête de Purge).
