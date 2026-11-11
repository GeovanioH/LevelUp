import { createHash } from "node:crypto";

/**
 * LevelUp Cryptographic Audit Log & Merkle Tree
 * Tracks XP gains, rank-ups, and sovereign quests in an immutable, tamper-proof chain.
 * Reference: docs/09-ROADMAP.md Section 21.7 (Phase 6, Test 6.2)
 */

export type AuditEventType =
  "XP_GAIN" | "RANK_UP" | "PENALTY_ENFORCED" | "QUEST_COMPLETED";

export interface AuditEvent {
  id: string;
  timestamp: number;
  eventType: AuditEventType;
  playerId: string;
  payload: Record<string, unknown>;
  previousHash: string;
  hash?: string;
}

export interface MerkleProofStep {
  position: "left" | "right";
  hash: string;
}

export type MerkleProof = MerkleProofStep[];

export interface ChainIntegrityResult {
  isValid: boolean;
  corruptedIndex?: number;
  reason?: string;
}

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Canonical JSON stringification (sorted keys) for deterministic leaf hashing
 */
function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalJson).join(",") + "]";
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return (
    "{" +
    keys
      .map(
        (k) =>
          JSON.stringify(k) +
          ":" +
          canonicalJson((obj as Record<string, unknown>)[k]),
      )
      .join(",") +
    "}"
  );
}

export class MerkleAuditLog {
  private events: AuditEvent[] = [];

  /**
   * Computes the leaf SHA-256 hash of an audit event
   */
  public computeLeafHash(event: AuditEvent): string {
    const raw = canonicalJson({
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      playerId: event.playerId,
      payload: event.payload,
      previousHash: event.previousHash,
    });
    return sha256(raw);
  }

  /**
   * Appends an event to the chain with backlink to previous event hash
   */
  public addEvent(
    eventType: AuditEventType,
    playerId: string,
    payload: Record<string, unknown>,
  ): AuditEvent {
    const previousHash =
      this.events.length === 0
        ? "0".repeat(64)
        : this.computeLeafHash(this.events[this.events.length - 1]!);

    const event: AuditEvent = {
      id: `evt-${Date.now()}-${this.events.length + 1}`,
      timestamp: Date.now(),
      eventType,
      playerId,
      payload: { ...payload },
      previousHash,
    };

    event.hash = this.computeLeafHash(event);

    this.events.push(event);
    return event;
  }

  /**
   * Retrieves all recorded audit events
   */
  public getEvents(): AuditEvent[] {
    return this.events;
  }

  /**
   * Calculates the root hash of the Merkle Tree representing all events
   */
  public getRoot(): string {
    if (this.events.length === 0) {
      return "0".repeat(64);
    }

    let currentLevel = this.events.map((e) => this.computeLeafHash(e));

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i]!;
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1]! : left; // Duplicate last if odd
        nextLevel.push(sha256(left + right));
      }

      currentLevel = nextLevel;
    }

    return currentLevel[0]!;
  }

  /**
   * Generates a Merkle inclusion proof for the leaf at eventIndex
   */
  public generateProof(eventIndex: number): MerkleProof {
    if (eventIndex < 0 || eventIndex >= this.events.length) {
      throw new Error(
        `Index ${eventIndex} hors limites pour l'arbre de Merkle (taille: ${this.events.length})`,
      );
    }

    let leaves = this.events.map((e) => this.computeLeafHash(e));
    const proof: MerkleProof = [];
    let targetIdx = eventIndex;

    while (leaves.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < leaves.length; i += 2) {
        const left = leaves[i]!;
        const right = i + 1 < leaves.length ? leaves[i + 1]! : left;
        const parentHash = sha256(left + right);
        nextLevel.push(parentHash);

        if (i === targetIdx || i + 1 === targetIdx) {
          if (targetIdx === i) {
            // Target is left, sibling is right
            proof.push({ position: "right", hash: right });
          } else {
            // Target is right, sibling is left
            proof.push({ position: "left", hash: left });
          }
        }
      }

      targetIdx = Math.floor(targetIdx / 2);
      leaves = nextLevel;
    }

    return proof;
  }

  /**
   * Cryptographically verifies a Merkle proof against an expected root
   */
  public static verifyProof(
    leafHash: string,
    proof: MerkleProof,
    expectedRoot: string,
  ): boolean {
    let currentHash = leafHash;

    for (const step of proof) {
      if (step.position === "left") {
        currentHash = sha256(step.hash + currentHash);
      } else {
        currentHash = sha256(currentHash + step.hash);
      }
    }

    return currentHash === expectedRoot;
  }

  /**
   * Verifies the full chain integrity from genesis to the latest leaf
   */
  public verifyChainIntegrity(): ChainIntegrityResult {
    for (let i = 0; i < this.events.length; i++) {
      const current = this.events[i]!;

      // 1. Check self-hash integrity if signed
      if (current.hash && current.hash !== this.computeLeafHash(current)) {
        return {
          isValid: false,
          corruptedIndex: i,
          reason: `Altération détectée sur l'événement ${i}: la charge utile a été altérée après scellement`,
        };
      }

      // 2. Check previousHash link
      const expectedPrevHash =
        i === 0 ? "0".repeat(64) : this.computeLeafHash(this.events[i - 1]!);

      if (current.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          corruptedIndex: i,
          reason: `Rupture de chaînage cryptographique à l'index ${i}: previousHash ne correspond pas au hachage de l'événement précédent`,
        };
      }
    }

    return { isValid: true };
  }
}
