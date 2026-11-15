# Application Flow & Expérience Utilisateur — LevelUp

> **Document ID :** FLO-LVLUP-003  
> **Version :** 3.1.0 (Édition Pareto Simplifiée)  
> **Statut :** Approuvé pour Implémentation  

---

## 1. Cycle de Vie Quotidien de l'Utilisateur (La Boucle Principale)

Le système LevelUp structure chaque journée autour d'un flux déterministe en 5 étapes clés :

```mermaid
flowchart TD
    A["06:00 - Éveil & Initialisation<br/>Calcul des jauges HP/MP & génération des 4 quêtes du jour"] --> B["08:30 - Deep Work & Progression Technique<br/>Code, projets, révisions théoriques avec fiches SM-2"]
    B --> C["12:30 - Restitution Orale / Audio<br/>Enregistrement du monologue vocal & analyse socratique"]
    C --> D["17:00 - Entraînement Physique<br/>Session de calisthénie validée par caméra MediaPipe"]
    D --> E{"22:00 - Clôture & Bilan Quotidien"}
    E -->|Quêtes Validées| F["Calcul du Score Harmonique & Attribution XP<br/>Sommeil serein & régénération HP"]
    E -->|Échec / Inactivité| G["Déclenchement du Mode Restriction<br/>Blocage réseau NextDNS & Quête de Purge requise"]
```

---

## 2. Arborescence des Écrans & Navigation

| Route | Écran | Description Fonctionnelle |
| :--- | :--- | :--- |
| `/` | **Écran d'Accueil / Splash** | Vidéo d'introduction holographique (8s) puis transition automatique vers le HUD. |
| `/dashboard` | **Web HUD Central** | Visualisation du radar des 8 bases, jauges de vitalité ($HP$/$MP$), quêtes prioritaires. |
| `/quests` | **Tableau des Quêtes** | Liste des quêtes quotidiennes, défis d'urgence et soumission de preuves (liens, textes). |
| `/workout` | **Caméra d'Entraînement** | Flux vidéo avec détection cinématique MediaPipe Pose, chronomètres et compteur de répétitions. |
| `/audio` | **Enregistreur Vocal** | Interface d'enregistrement pour les synthèses orales avec retour en direct de la note /20. |
| `/skills` | **Arbre des Compétences** | Graphe interactif (DAG) des 120 compétences réparties sur les 8 bases avec statut débloqué. |
| `/penalty` | **Mode Restriction** | Écran d'alerte rouge affiché lors d'une sanction, indiquant la quête de purge nécessaire. |

---

## 3. Machine à États du Mode Restriction (Sanction)

```mermaid
stateDiagram-v2
    [*] --> Actif: Utilisation Normale
    Actif --> Restriction: Heure limite (22h00) dépassée & Quêtes incomplètes
    Restriction --> VerificationPurge: Accomplissement de l'épreuve physique de rachat
    VerificationPurge --> Actif: Validation validée par caméra / Strava -> Déblocage NextDNS
    VerificationPurge --> Restriction: Preuve invalide ou insuffisante
```

### Mécanisme de Déblocage (Quête de Purge)
* Dès l'activation de la restriction, l'accès internet est verrouillé sur les sites récréatifs via NextDNS.
* L'utilisateur doit valider une épreuve physique exigeante (ex: 200 pompes ou 10 km de marche/course) pour que le webhook de déverrouillage NextDNS soit envoyé.
