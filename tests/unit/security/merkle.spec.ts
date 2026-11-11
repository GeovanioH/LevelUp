import { describe, it, expect, beforeEach } from "vitest";
import {
  MerkleAuditLog,
  type AuditEvent,
  type MerkleProof,
} from "../../../packages/crypto/src/merkleAudit";

describe("Merkle Audit Log - Cryptographic Tamper-Proof Chain (Test 6.2)", () => {
  let auditLog: MerkleAuditLog;

  beforeEach(() => {
    auditLog = new MerkleAuditLog();
  });

  it("builds a cryptographically linked event chain and computes a deterministic Merkle root", () => {
    const e1 = auditLog.addEvent("XP_GAIN", "huriel-monarch", {
      amount: 100,
      source: "DAILY_QUEST",
    });
    const e2 = auditLog.addEvent("XP_GAIN", "huriel-monarch", {
      amount: 350,
      source: "DEEP_WORK",
    });
    const e3 = auditLog.addEvent("RANK_UP", "huriel-monarch", {
      oldRank: "E",
      newRank: "D",
    });
    const e4 = auditLog.addEvent("QUEST_COMPLETED", "huriel-monarch", {
      questId: "q-calisthenics-01",
    });

    expect(auditLog.getEvents()).toHaveLength(4);
    expect(e1.previousHash).toBe("0".repeat(64)); // Genesis block
    expect(e2.previousHash).toBe(auditLog.computeLeafHash(e1));
    expect(e3.previousHash).toBe(auditLog.computeLeafHash(e2));
    expect(e4.previousHash).toBe(auditLog.computeLeafHash(e3));

    const root = auditLog.getRoot();
    expect(root).toBeDefined();
    expect(root).toMatch(/^[a-f0-9]{64}$/);

    const integrity = auditLog.verifyChainIntegrity();
    expect(integrity.isValid).toBe(true);
  });

  it("generates and verifies valid Merkle proofs for every leaf", () => {
    // Add 5 events (testing odd number of leaves handling)
    for (let i = 1; i <= 5; i++) {
      auditLog.addEvent("XP_GAIN", "huriel-monarch", { index: i, xp: i * 50 });
    }

    const events = auditLog.getEvents();
    const root = auditLog.getRoot();

    for (let i = 0; i < events.length; i++) {
      const leafHash = auditLog.computeLeafHash(events[i]!);
      const proof = auditLog.generateProof(i);
      const isProofValid = MerkleAuditLog.verifyProof(leafHash, proof, root);
      expect(isProofValid).toBe(true);
    }
  });

  it("strictly detects payload tampering on a past event and invalidates Merkle root and proof", () => {
    auditLog.addEvent("XP_GAIN", "huriel-monarch", {
      amount: 100,
      valid: true,
    });
    auditLog.addEvent("XP_GAIN", "huriel-monarch", {
      amount: 500,
      valid: true,
    });
    auditLog.addEvent("RANK_UP", "huriel-monarch", { rank: "C" });

    const originalRoot = auditLog.getRoot();
    const proofBeforeTamper = auditLog.generateProof(1);
    const events = auditLog.getEvents();

    // Maliciously tamper with event 1 payload (attempting to grant +100000 XP)
    events[1]!.payload = { amount: 100000, valid: true };

    // 1. Chain integrity must immediately fail
    const integrityCheck = auditLog.verifyChainIntegrity();
    expect(integrityCheck.isValid).toBe(false);
    expect(integrityCheck.corruptedIndex).toBe(1);

    // 2. The recomputed root must differ from original root
    const tamperedRoot = auditLog.getRoot();
    expect(tamperedRoot).not.toBe(originalRoot);

    // 3. Merkle proof generated before tamper against tampered leaf must be rejected
    const tamperedLeafHash = auditLog.computeLeafHash(events[1]!);
    const isValidProof = MerkleAuditLog.verifyProof(
      tamperedLeafHash,
      proofBeforeTamper,
      originalRoot,
    );
    expect(isValidProof).toBe(false);
  });

  it("handles single-node tree and empty tree gracefully", () => {
    expect(auditLog.getRoot()).toBe("0".repeat(64));

    auditLog.addEvent("XP_GAIN", "huriel-monarch", { amount: 50 });
    const singleRoot = auditLog.getRoot();
    expect(singleRoot).toMatch(/^[a-f0-9]{64}$/);

    const proof = auditLog.generateProof(0);
    const leaf = auditLog.computeLeafHash(auditLog.getEvents()[0]!);
    expect(MerkleAuditLog.verifyProof(leaf, proof, singleRoot)).toBe(true);
  });
});
