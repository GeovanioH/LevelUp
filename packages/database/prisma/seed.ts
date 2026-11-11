import { PrismaClient, BaseStatCode, RankCode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "⚡ [LEVELUP SEED] Amorçage de la base de données de The System...",
  );

  // 1. Initialisation du Joueur Maître (Huriel)
  const masterPlayer = await prisma.player.upsert({
    where: { username: "Huriel" },
    update: {},
    create: {
      username: "Huriel",
      passwordHash:
        "$argon2id$v=19$m=65536,t=3,p=4$dummy_seed_salt$hash_placeholder",
      currentLevel: 1,
      totalXp: 0n,
      rankCode: RankCode.E,
      currentHp: 100,
      maxHp: 100,
      currentMp: 100,
      maxMp: 100,
      shadowCrystals: 50,
      currentTitle: "L'Éveillé Novice",
      themePreference: "DARK_MONARCH",
    },
  });

  console.log(
    `👤 Joueur Maître initialisé : ${masterPlayer.username} (${masterPlayer.id})`,
  );

  // 2. Définition des 8 Statistiques de Base
  const baseCodes: BaseStatCode[] = [
    BaseStatCode.ACAD,
    BaseStatCode.AI_ENG,
    BaseStatCode.CYBER,
    BaseStatCode.EXP,
    BaseStatCode.LNG,
    BaseStatCode.FIN,
    BaseStatCode.STR,
    BaseStatCode.DIS,
  ];

  const statRecords: Record<string, string> = {};

  for (const code of baseCodes) {
    const stat = await prisma.playerStat.upsert({
      where: {
        playerId_baseCode: {
          playerId: masterPlayer.id,
          baseCode: code,
        },
      },
      update: {},
      create: {
        playerId: masterPlayer.id,
        baseCode: code,
        level: 1,
        currentXp: 0,
        nextLevelXp: 100,
        totalPointsInvested: 0,
      },
    });
    statRecords[code] = stat.id;
  }

  console.log("📊 Les 8 Bases Fondamentales ont été instanciées avec succès.");

  // 3. Catalogue des 120 Nœuds de Compétences Détaillés
  const skillNodesData = [
    // --- ACAD : EXCELLENCE ACADÉMIQUE (15 Nœuds) ---
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-01",
      name: "Méthodologie Cornell & Markdown",
      level: 1,
      desc: "Prise de notes structurée en cours en Markdown avec résumé immédiat.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-02",
      name: "Algèbre Linéaire pour l'IA",
      level: 3,
      desc: "Espaces vectoriels, matrices, décomposition SVD et valeurs propres (MIT 18.06).",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-03",
      name: "Probabilités & Bayes",
      level: 5,
      desc: "Conditionnement bayésien, lois de distribution et inférence statistique (Harvard Stat 110).",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-04",
      name: "Optimisation Mathématique",
      level: 8,
      desc: "Descente de gradient, convexité et multiplicateurs de Lagrange (Stanford EE364a).",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-05",
      name: "Théorie des Graphes Avancée",
      level: 10,
      desc: "Arbres de recouvrement, Dijkstra, A* et flux maximal (MIT 6.006).",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-06",
      name: "Architecture des Ordinateurs",
      level: 12,
      desc: "Mémoire virtuelle, pagination, interruptions et programmation POSIX C.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-07",
      name: "Bases de Données & BCNF",
      level: 15,
      desc: "Formes normales relationnelles, transactions ACID et optimisation SQL.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-08",
      name: "Cycle de Révision Répétition Espacée",
      level: 18,
      desc: "Système Anki rigoureux à J+1, J+7 et J+30 sur l'ensemble des cours.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-09",
      name: "Préparation Anticipée des Partiels",
      level: 22,
      desc: "Traitement exhaustif des annales d'examens 3 semaines avant les partiels.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-10",
      name: "Mathématiques Discrètes & Logique",
      level: 25,
      desc: "Combinatoire, théorie des nombres et démonstrations formelles (MIT 6.042J).",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-11",
      name: "Leadership de Projet Scolaire",
      level: 30,
      desc: "Pilotage technique et revues de code des projets de groupe d'ingénierie.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-12",
      name: "Rapport d'Alternance d'Excellence",
      level: 35,
      desc: "Rédaction scientifique de niveau publication sur les missions en entreprise.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-13",
      name: "Défense Orale de Soutenance",
      level: 40,
      desc: "Soutenance de projet devant jury blanc avec support visuel et prestance.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-14",
      name: "Top 3 de la Promotion Universitaire",
      level: 50,
      desc: "Validation officielle d'un semestre dans le trio de tête de promotion.",
    },
    {
      baseCode: BaseStatCode.ACAD,
      nodeCode: "ACAD-15",
      name: "Major de Promotion Officiel",
      level: 70,
      desc: "Obtention de la première place absolue de promotion sur l'année.",
    },

    // --- AI_ENG : INGÉNIERIE IA & HACKATHONS (15 Nœuds) ---
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-01",
      name: "Architecture des Transformers from Scratch",
      level: 1,
      desc: "Implémentation manuelle PyTorch de l'Attention Multi-Têtes et Positional Encoding.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-02",
      name: "Fine-Tuning Efficace (LoRA / QLoRA)",
      level: 4,
      desc: "Adaptation de Mistral 7B / Llama 3 avec PEFT et quantization 4-bit.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-03",
      name: "Pipelines RAG & Re-ranking",
      level: 8,
      desc: "Recherche hybride dense/sparse, cross-encoders et vector DBs.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-04",
      name: "Architectures Multi-Agents MCP",
      level: 12,
      desc: "Agents autonomes communicants outillés via Model Context Protocol.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-05",
      name: "Prototypage Rapide MVP (48h)",
      level: 16,
      desc: "Capacité à coder et déployer une webapp complète en 48 heures.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-06",
      name: "Vector Databases HNSW",
      level: 20,
      desc: "Benchmark et indexation de 100 000 vecteurs sur Qdrant/Pinecone.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-07",
      name: "Optimisation de l'Inférence (vLLM)",
      level: 25,
      desc: "PagedAttention, AWQ et serveurs d'inférence ultra-rapides.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-08",
      name: "Vision par Ordinateur & Multimodalité",
      level: 30,
      desc: "Analyse d'images et documents complexes via Gemini Flash Vision.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-09",
      name: "Guardrails & Sécurité LLM",
      level: 35,
      desc: "Protection anti-jailbreak et filtrage des entrées/sorties NeMo.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-10",
      name: "Participation Hackathon Mondial",
      level: 40,
      desc: "Compétition Devpost de 48h avec soumission publique complète.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-11",
      name: "Finaliste de Hackathon International",
      level: 50,
      desc: "Sélection officielle parmi les projets finalistes primés par le jury.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-12",
      name: "Victoire de Hackathon (1ère Place)",
      level: 65,
      desc: "Remporter la première place absolue d'une catégorie de hackathon.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-13",
      name: "Contribution Open-Source Majeure",
      level: 75,
      desc: "PR fusionnée sur Hugging Face, vLLM ou LangChain.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-14",
      name: "Publication d'Article Technique de Référence",
      level: 85,
      desc: "Guide approfondi de plus de 2 000 mots lu par la communauté.",
    },
    {
      baseCode: BaseStatCode.AI_ENG,
      nodeCode: "AI-15",
      name: "Déploiement d'un SaaS Commercial",
      level: 95,
      desc: "Service logiciel autonome générant ses premiers revenus réels.",
    },

    // --- CYBER : CYBERSÉCURITÉ DÉFENSIVE & OFFENSIVE (15 Nœuds) ---
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-01",
      name: "Analyse de Trames Wireshark",
      level: 1,
      desc: "Analyse des protocoles TCP, DNS, HTTP/S et flux pcap.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-02",
      name: "Exploitation Injection SQL Manuelle",
      level: 4,
      desc: "Exploitation des failles SQLi in-band, blind et time-based.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-03",
      name: "Cross-Site Scripting (XSS) Avancé",
      level: 8,
      desc: "Contournement des filtres WAF et exploitation DOM XSS.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-04",
      name: "Vulnérabilités d'Autorisation IDOR",
      level: 12,
      desc: "Détection d'accès horizontaux et verticaux non sécurisés.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-05",
      name: "Élévation de Privilèges Linux",
      level: 16,
      desc: "Exploitation SUID, sudoers et cron jobs sous Linux.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-06",
      name: "Élévation de Privilèges Windows",
      level: 20,
      desc: "Abus SeImpersonatePrivilege et hijacking de DLLs.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-07",
      name: "Attaques Active Directory",
      level: 25,
      desc: "Kerberoasting, Pass-the-Hash et énumération BloodHound.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-08",
      name: "Durcissement Système Linux (Lynis)",
      level: 30,
      desc: "Score CIS Benchmark >= 80 sur serveur d'infrastructure.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-09",
      name: "Reverse Engineering Binaire (Ghidra)",
      level: 35,
      desc: "Décompilation x64 et analyse statique/dynamique de crackmes.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-10",
      name: "TryHackMe : Top 10% Mondial",
      level: 40,
      desc: "Classement officiel parmi les 10% meilleurs hackers THM.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-11",
      name: "TryHackMe : Top 1% Mondial",
      level: 55,
      desc: "Atteinte du sommet mondial sur la plateforme TryHackMe.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-12",
      name: "Participation à un CTF Public",
      level: 65,
      desc: "Résolution de challenges officiels lors d'un événement CTF.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-13",
      name: "Audit de Code Source Sécurisé (SAST)",
      level: 75,
      desc: "Règles Semgrep personnalisées pour détecter des failles zéro-day.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-14",
      name: "Attaques Avancées sur Jetons JWT",
      level: 85,
      desc: "Craquage de clé secrète faible et forgerie de signatures.",
    },
    {
      baseCode: BaseStatCode.CYBER,
      nodeCode: "CYB-15",
      name: "Chasse aux Vulnérabilités (Bug Bounty)",
      level: 95,
      desc: "Rapport de vulnérabilité éthique validé sur HackerOne/YesWeHack.",
    },

    // --- EXP : ÉLOQUENCE, RÉSEAU & AUDACE (15 Nœuds) ---
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-01",
      name: "Pose de la Voix & Élocution",
      level: 1,
      desc: "Respiration ventrale, débit posé et zéro tic de langage.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-02",
      name: "Méthode d'Argumentation PREP",
      level: 4,
      desc: "Structure Point-Reason-Example-Point en prise de parole.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-03",
      name: "L'Elevator Pitch de 60s",
      level: 8,
      desc: "Présentation percutante et captivante de son profil en 1 min.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-04",
      name: "Profil LinkedIn d'Ingénieur",
      level: 12,
      desc: "Optimisation SEO, projets mis en avant et réseau qualifié.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-05",
      name: "Campagne de Cold Outreach",
      level: 16,
      desc: "Échanges qualitatifs initiés avec 5 experts ou chercheurs.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-06",
      name: "Échange avec un Mentor Senior",
      level: 20,
      desc: "Entretien visio de 30 min pour recueillir des retours d'expérience.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-07",
      name: "Présence Active à un Meetup Tech",
      level: 25,
      desc: "Participation physique et réseautage sur un événement tech.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-08",
      name: "Prise de Parole en Amphithéâtre",
      level: 30,
      desc: "Poser une question pertinente au micro devant une assemblée.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-09",
      name: "Animation d'un Atelier Technique",
      level: 40,
      desc: "Animer une session pratique hands-on pour d'autres étudiants.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-10",
      name: "Confiance Sociale Inébranlable",
      level: 50,
      desc: "Sortie délibérée de zone de confort social sans hésitation.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-11",
      name: "Négociation Professionnelle Assertive",
      level: 60,
      desc: "Négocier fermement les conditions d'une mission d'ingénieur.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-12",
      name: "Création de Contenu LinkedIn Régulière",
      level: 70,
      desc: "Publications techniques hebdomadaires cumulant > 2 000 vues.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-13",
      name: "Leadership d'Équipe de Hackathon",
      level: 80,
      desc: "Fédérer et diriger une équipe pluridisciplinaire en compétition.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-14",
      name: "Langage Corporel d'Autorité",
      level: 90,
      desc: "Posture droite, regard franc et gestuelle maîtrisée en public.",
    },
    {
      baseCode: BaseStatCode.EXP,
      nodeCode: "EXP-15",
      name: "Animation d'un Mastermind d'Élite",
      level: 100,
      desc: "Diriger un groupe de travail d'étudiants ultra-disciplinés.",
    },

    // --- LNG : LANGUES & ANGLAIS INTERNATIONAL (15 Nœuds) ---
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-01",
      name: "Immersion Numérique Totale",
      level: 1,
      desc: "Basculer 100% de ses appareils et interfaces en anglais.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-02",
      name: "Consommation 100% VO Sans Sous-titres",
      level: 4,
      desc: "14 jours consécutifs d'écoute technique exclusivement en VO.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-03",
      name: "Vocabulaire Académique d'Élite",
      level: 8,
      desc: "150 termes académiques et expressions idiomatiques maîtrisés.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-04",
      name: "Test EF SET 50 min Certifié",
      level: 12,
      desc: "Obtention du score officiel certifiant le niveau B2 minimum.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-05",
      name: "Cambridge English Assessment",
      level: 16,
      desc: "Évaluation officielle de précision lexicale et grammaticale.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-06",
      name: "READMEs & Commits 100% Anglais",
      level: 20,
      desc: "Rédaction technique exclusive en anglais sur tous les dépôts.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-07",
      name: "Journal de Bord Quotidien en Anglais",
      level: 25,
      desc: "Journalisation écrite en anglais pendant 21 jours consécutifs.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-08",
      name: "Écoute de Podcasts Denses (2h)",
      level: 30,
      desc: "Prise de notes synthétiques sur des épisodes techniques US/UK.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-09",
      name: "Lecture d'Ouvrage Technique VO",
      level: 40,
      desc: "Lecture intégrale et fiche d'un livre informatique en anglais.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-10",
      name: "Monologues Vocaux Spontanés (5 min)",
      level: 50,
      desc: "Expression orale spontanée sans hésitation enregistrée.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-11",
      name: "Échanges Vocaux avec Natifs",
      level: 60,
      desc: "Sessions vocales actives sur des serveurs Discord anglophones.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-12",
      name: "Grammaire de Niveau C1 Maîtrisée",
      level: 70,
      desc: "Inversions, conditionnels mixtes et structures complexes.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-13",
      name: "Pitch Technique Vidéo en Anglais",
      level: 80,
      desc: "Présentation de projet de 3 minutes filmée en anglais fluide.",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-14",
      name: "Certification Cambridge C1 Validée",
      level: 90,
      desc: "Certificat officiel C1 Advanced (EF SET >= 61/100).",
    },
    {
      baseCode: BaseStatCode.LNG,
      nodeCode: "LNG-15",
      name: "Bilinguisme Parfait (Niveau C2)",
      level: 100,
      desc: "Score certifié C2 Maîtrise attestant du bilinguisme total.",
    },

    // --- FIN : FINANCES, BOURSES & STRATÉGIE (15 Nœuds) ---
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-01",
      name: "Tenue Budgétaire Zéro-Euro",
      level: 1,
      desc: "Enregistrement de 100% des flux financiers dans le Système.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-02",
      name: "Activation GitHub Student Pack",
      level: 4,
      desc: "Déblocage des milliers d'euros d'outils et serveurs offerts.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-03",
      name: "Crédits Cloud Étudiants (Azure/AWS)",
      level: 8,
      desc: "Déploiement d'infrastructures de test sur crédits gratuits.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-04",
      name: "Nom de Domaine Professionnel Offert",
      level: 12,
      desc: "Enregistrement de son nom de domaine personnel via Namecheap.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-05",
      name: "Licences JetBrains & DataCamp Pro",
      level: 16,
      desc: "Activation des environnements d'ingénierie professionnels.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-06",
      name: "Fonds d'Urgence Sécurisé",
      level: 20,
      desc: "Constitution de 2 mois de dépenses en réserve inviolable.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-07",
      name: "Veille Automatique Bourses Deerflow",
      level: 25,
      desc: "Capture et filtrage des bourses de mobilité et d'excellence.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-08",
      name: "Dossier Type de Candidature Bourse",
      level: 30,
      desc: "Lettres de recommandation et CV académique normé prêts.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-09",
      name: "Dépôt Formel de Candidature Bourse",
      level: 40,
      desc: "Soumission d'un dossier complet avant l'échéance officielle.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-10",
      name: "Obtention d'une Bourse d'Excellence",
      level: 50,
      desc: "Notification officielle d'attribution d'un financement d'études.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-11",
      name: "Optimisation Fiscale & Aides Étudiantes",
      level: 60,
      desc: "Droits administratifs et budget optimisés sans gaspillage.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-12",
      name: "Facturation Première Prestation Tech",
      level: 70,
      desc: "Rémunération professionnelle pour une mission de dev/cyber.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-13",
      name: "Investissement Matériel Productif",
      level: 80,
      desc: "Amélioration de son setup de travail avec retour sur investissement.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-14",
      name: "Diversification des Revenus (3 Flux)",
      level: 90,
      desc: "Salaire alternance + Bourse d'excellence + Primes de concours.",
    },
    {
      baseCode: BaseStatCode.FIN,
      nodeCode: "FIN-15",
      name: "Autonomie Financière Totale",
      level: 100,
      desc: "Indépendance financière absolue avec taux d'épargne >= 25%.",
    },

    // --- STR : PUISSANCE PHYSIQUE & CONDITION ATHLÉTIQUE (15 Nœuds) ---
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-01",
      name: "30 Pompes Militaires Strictes",
      level: 1,
      desc: "Exécution parfaite au poids du corps sans cambrure.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-02",
      name: "10 Tractions Strictes en Pronation",
      level: 4,
      desc: "Tirage complet menton au-dessus de la barre en dead-hang.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-03",
      name: "15 Dips sur Barres Parallèles",
      level: 8,
      desc: "Descente à 90 degrés et verrouillage complet des triceps.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-04",
      name: "Gainage Planche de 3 Minutes",
      level: 12,
      desc: "Stabilité abdominale et alignement parfait du tronc.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-05",
      name: "Dos en V & Tirage Lourd",
      level: 16,
      desc: "Progression de force constante sur les tirages horizontaux.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-06",
      name: "Isolation Biceps & Triceps",
      level: 20,
      desc: "Renforcement spécifique des bras pour éliminer les déséquilibres.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-07",
      name: "50 Squats d'Affilée au Poids du Corps",
      level: 25,
      desc: "Endurance musculaire du bas du corps sans rupture de rythme.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-08",
      name: "Tractions Lestées (+15 kg)",
      level: 35,
      desc: "5 répétitions strictes avec charge de 15 kg à la ceinture.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-09",
      name: "Course de 5 km en Moins de 25 min",
      level: 45,
      desc: "Allure soutenue en extérieur validée par traceur GPS.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-10",
      name: "Mobilité Posturale Quotidienne",
      level: 55,
      desc: "21 jours de routine d'étirements pour contrer la position assise.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-11",
      name: "Défi 100 Pompes de Solo Leveling",
      level: 65,
      desc: "Compléter 100 pompes au cours d'une seule séance.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-12",
      name: "Discipline Physique (4 Séances/Semaine)",
      level: 75,
      desc: "2 mois sans manquer une seule séance d'entraînement.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-13",
      name: "Tractions Lestées Lourdes (+25 kg)",
      level: 85,
      desc: "3 répétitions strictes avec charge additionnelle de 25 kg.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-14",
      name: "Course de 10 km en Moins de 55 min",
      level: 92,
      desc: "Endurance de fond validée sur 10 kilomètres continus.",
    },
    {
      baseCode: BaseStatCode.STR,
      nodeCode: "STR-15",
      name: "Condition Athlétique Complète",
      level: 100,
      desc: "15 tractions + 50 pompes + 5km en 23 min + mobilité parfaite.",
    },

    // --- DIS : DISCIPLINE, VOLONTÉ & RÉSILEINCE (15 Nœuds) ---
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-01",
      name: "Matinée Sanctuarisée Sans Écran",
      level: 1,
      desc: "60 minutes après le réveil sans aucun réseau ni message.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-02",
      name: "Session Deep Work de 90 Minutes",
      level: 4,
      desc: "Concentration pure sans distraction ni changement d'onglet.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-03",
      name: "Détox Digitale Réseaux (7 Jours)",
      level: 8,
      desc: "Zéro seconde passée sur TikTok ou Instagram pendant 1 semaine.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-04",
      name: "Double Session Deep Work (3h)",
      level: 12,
      desc: "Accomplir deux blocs de 90 min de travail intense le même jour.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-05",
      name: "Semaine Parfaite de Quêtes (7 Jours)",
      level: 16,
      desc: "Clôture de 100% des quêtes quotidiennes avant minuit pendant 7j.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-06",
      name: "Douche Froide Matinale",
      level: 20,
      desc: "Douche glaciale de 2 minutes pour vaincre la résistance mentale.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-07",
      name: "Couvre-Feu Digital (22h00)",
      level: 25,
      desc: "Extinction totale des écrans 45 minutes avant le sommeil.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-08",
      name: "Refus de la Gratification Immédiate",
      level: 30,
      desc: "Surmonter une tentation sociale pour achever un livrable clé.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-09",
      name: "Session Commando Monk Mode (6h)",
      level: 40,
      desc: "Journée commando avec 6 heures de Deep Work nettes.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-10",
      name: "Discipline d'Acier (30 Jours Parfaits)",
      level: 50,
      desc: "30 jours consécutifs sans une seule entrée en zone de pénalité.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-11",
      name: "Résilience Post-Échec Immédiate",
      level: 60,
      desc: "Analyser et corriger une erreur dans les 2 heures sans plainte.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-12",
      name: "Jeûne Dopaminergique Dominical",
      level: 70,
      desc: "24 heures le dimanche sans réseaux, vidéos ni divertissement.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-13",
      name: "Marathon de Deep Work (8 Heures)",
      level: 80,
      desc: "Journée d'ingénierie exceptionnelle totalisant 8h de focus.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-14",
      name: "Souveraineté Trimestrielle (90 Jours)",
      level: 90,
      desc: "Un trimestre entier sans aucun abandon ni compromis de routine.",
    },
    {
      baseCode: BaseStatCode.DIS,
      nodeCode: "DIS-15",
      name: "Volonté Inaltérable du Monarque",
      level: 100,
      desc: "Exécution froide et déterminée en toutes circonstances.",
    },
  ];

  for (const node of skillNodesData) {
    await prisma.skillNode.upsert({
      where: { nodeCode: node.nodeCode },
      update: {
        statId: statRecords[node.baseCode],
        baseCode: node.baseCode,
        name: node.name,
        description: node.desc,
        requiredStatLevel: node.level,
      },
      create: {
        statId: statRecords[node.baseCode],
        baseCode: node.baseCode,
        nodeCode: node.nodeCode,
        name: node.name,
        description: node.desc,
        requiredStatLevel: node.level,
        isUnlocked: node.level === 1, // Déblocage automatique des compétences de niveau 1
      },
    });
  }

  console.log(
    `🌲 ${skillNodesData.length} Nœuds de Compétences amorcés avec succès !`,
  );
  console.log("✨ [LEVELUP SEED] Initialisation de The System achevée.");
}

main()
  .catch((e) => {
    console.error("⛔ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
