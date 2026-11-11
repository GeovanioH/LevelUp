import { describe, it, expect } from "vitest";
import {
  calculateNextLevelXp,
  HarmonicRankEngine,
  NeurobiologicalVitalityEngine,
  SocraticOralGrader,
  type BaseScores,
  type RealWorldAchievements,
} from "../../packages/contracts/src";
import {
  MediaPipeRepCounter,
  type RepCounterResult,
} from "../../apps/web/src/features/cv/useExerciseCounter";
import { type PoseLandmark } from "../../apps/web/src/features/cv/poseMath";
import { MerkleAuditLog } from "../../packages/crypto/src";
import {
  TimeBlockingEngine,
  TimeBlockType,
} from "../../packages/scheduler/src/timeBlocking";
import { NextDnsClient } from "../../packages/security/src/nextdnsClient";
import { randomBytes } from "node:crypto";

function createFrameWithElbowAngle(degrees: number): PoseLandmark[] {
  const landmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
    x: 0,
    y: 0,
    z: 0,
    visibility: 0.95,
  }));
  landmarks[11] = { x: 0, y: 1, z: 0, visibility: 0.95 };
  landmarks[13] = { x: 0, y: 0, z: 0, visibility: 0.95 };
  const rad = (degrees * Math.PI) / 180;
  landmarks[15] = {
    x: Math.sin(rad),
    y: Math.cos(rad),
    z: 0,
    visibility: 0.95,
  };
  return landmarks;
}

describe("LevelUp Full Day Solo Leveling E2E Scenario (Task 6.2 & Smoke Test)", () => {
  it("executes the full uncompromised day lifecycle from 06:00 to 22:00 with level-up", async () => {
    const auditLog = new MerkleAuditLog();
    const playerId = "huriel-monarch";

    // -------------------------------------------------------------------------
    // Étape 1 : Initialisation du Joueur Huriel (Rang E, Niveau 1)
    // -------------------------------------------------------------------------
    let currentLevel = 1;
    let currentXp = 0;
    const requiredXpLevel1 = calculateNextLevelXp(currentLevel);
    expect(requiredXpLevel1).toBe(100);

    const initialBases: BaseScores = {
      acad: 10,
      ai_eng: 10,
      cyber: 10,
      exp: 10,
      lng: 10,
      fin: 10,
      str: 10,
      dis: 10,
    };
    const realAchievements: RealWorldAchievements = {
      hackathonsWon: 0,
      cambridgeCertificationLevel: "NONE",
      classRankPercentile: 0.5,
      calisthenicsRoutinesMastered: false,
      productionSaasUsers: 0,
      netWorthOrSponsorshipEur: 0,
    };

    const initialScore =
      HarmonicRankEngine.calculateHarmonicScoreSimple(initialBases);
    const initialGlobalLvl =
      HarmonicRankEngine.calculateGlobalLevel(initialScore);
    const initialRank = HarmonicRankEngine.determineRank(
      initialGlobalLvl,
      realAchievements,
    );
    expect(initialRank).toBe("E");

    auditLog.addEvent("XP_GAIN", playerId, {
      amount: 0,
      reason: "PLAYER_GENESIS",
    });

    // -------------------------------------------------------------------------
    // Étape 2 : Attribution du Pack de Quêtes Matinales & Time-Blocking à 06h00
    // -------------------------------------------------------------------------
    const engine = new TimeBlockingEngine("2026-11-12");
    engine.addBlock({
      id: "quest-morning-calisthenics",
      title: "Quête Matinale : 14 Pike Push-Ups Stricts",
      type: TimeBlockType.SANCTUARY_SPORT,
      startTime: "07:00",
      endTime: "07:45",
    });

    const deepWorkBlock = engine.scheduleDeepWorkSession(
      "Bloc Deep Work IA : Architecture & Défense Orale",
      120,
      "07:45",
      "22:00",
    );

    expect(deepWorkBlock.startTime).toBe("07:45");
    expect(deepWorkBlock.endTime).toBe("09:45");
    expect(engine.getBlocks().length).toBeGreaterThanOrEqual(4); // 2 sleep + 1 sport + 1 deep work

    // -------------------------------------------------------------------------
    // Étape 3 : Déclenchement Caméra MediaPipe : 14 Pike Push-Ups Stricts
    // -------------------------------------------------------------------------
    const counter = new MediaPipeRepCounter(75, 160);
    // Simulate 14 perfect repetitions
    for (let rep = 1; rep <= 14; rep++) {
      counter.processFrame(createFrameWithElbowAngle(170));
      counter.processFrame(createFrameWithElbowAngle(70));
      counter.processFrame(createFrameWithElbowAngle(165));
    }
    expect(counter.getReps()).toBe(14);

    // Attribution XP Calisthenics (+100 XP)
    currentXp += 100;
    initialBases.str += 15;
    initialBases.dis += 15;
    auditLog.addEvent("QUEST_COMPLETED", playerId, {
      questId: "quest-morning-calisthenics",
      reps: 14,
      xpAwarded: 100,
    });

    // -------------------------------------------------------------------------
    // Étape 4 : Lancement Deep Work & Activation Sentinelle NextDNS
    // -------------------------------------------------------------------------
    const masterKey = randomBytes(32).toString("hex");
    const nextdns = new NextDnsClient({
      profileId: "test_profile_dw",
      apiKeyPlain: "test_secret_nextdns_key_token",
      masterKeyHex: masterKey,
      baseUrl: "https://mock.nextdns.io",
    });
    expect(nextdns.getEncryptedApiKey()).toMatch(/^v1:/);

    // -------------------------------------------------------------------------
    // Étape 5 : Ingestion Audio & Soutenance Orale Socratique (18/20)
    // -------------------------------------------------------------------------
    const socraticSpeech = `
Dans les réseaux de neurones profonds, la descente de gradient stochastique ajuste les tenseurs de poids
en minimisant la fonction de loss. L'introduction des blocs résiduels dans l'architecture Transformer
permet d'atténuer l'évanouissement du gradient et stabilise la normalisation de la variance à travers les couches.
`;
    const grader = new SocraticOralGrader();
    const oralResult = grader.evaluateSpeech(
      socraticSpeech,
      "Réseaux de Neurones & Optimisation",
    );
    expect(oralResult.promptInjectionDetected).toBe(false);
    expect(oralResult.totalScore).toBeGreaterThanOrEqual(16);

    // Attribution XP Soutenance (+250 XP)
    currentXp += 250;
    initialBases.ai_eng += 25;
    initialBases.lng += 20;
    auditLog.addEvent("QUEST_COMPLETED", playerId, {
      questId: "quest-deep-work-ia",
      score: oralResult.totalScore,
      xpAwarded: 250,
    });

    // -------------------------------------------------------------------------
    // Étape 6 : Calcul du Score Harmonique & Vitalité Borbély
    // -------------------------------------------------------------------------
    const updatedScore =
      HarmonicRankEngine.calculateHarmonicScoreSimple(initialBases);
    expect(updatedScore).toBeGreaterThan(initialScore);

    const hp = NeurobiologicalVitalityEngine.calculateHp(16, 22); // 16h awake at 22:00
    expect(hp).toBeGreaterThanOrEqual(80);

    const mp = NeurobiologicalVitalityEngine.applyDopamineReward(85, "DAILY");
    expect(mp).toBe(95);

    // -------------------------------------------------------------------------
    // Étape 7 : Validation du Passage de Niveau & Clôture Merkle Inviolable
    // -------------------------------------------------------------------------
    // With 350 XP, level 1 requires 100 XP, level 2 requires 348 XP -> Hunter levels up to 3!
    while (currentXp >= calculateNextLevelXp(currentLevel)) {
      currentLevel++;
      auditLog.addEvent("RANK_UP", playerId, {
        newLevel: currentLevel,
        totalXp: currentXp,
      });
    }

    expect(currentLevel).toBeGreaterThan(1);
    expect(auditLog.verifyChainIntegrity().isValid).toBe(true);

    const finalRoot = auditLog.getRoot();
    expect(finalRoot).toMatch(/^[a-f0-9]{64}$/);
  });
});
