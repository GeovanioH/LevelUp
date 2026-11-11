import { describe, it, expect } from "vitest";
import {
  EnvelopeEncryptionManager,
  encryptData,
  decryptData,
} from "../../../src/encryption";

describe("Cryptographie AES-256-GCM & Dérivation HKDF-SHA256", () => {
  const validMasterKeyHex =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  it("devrait rejeter une clé maîtresse qui ne fait pas exactement 256 bits (64 car. hex)", () => {
    expect(() => {
      new EnvelopeEncryptionManager("short_key");
    }).toThrowError(/256 bits/);
  });

  it("devrait chiffrer et déchiffrer avec succès une chaîne confidentielle", () => {
    const manager = new EnvelopeEncryptionManager(validMasterKeyHex);
    const plaintext = "NEXTDNS_SECRET_KEY_PROD_2026_SOVEREIGN";

    const encrypted = manager.encrypt(plaintext);
    expect(encrypted).toMatch(/^v1:[0-9a-f]{24}:[0-9a-f]+:[0-9a-f]{32}$/);

    const decrypted = manager.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("devrait produire des chiffrements différents pour le même texte (IV aléatoire unique)", () => {
    const manager = new EnvelopeEncryptionManager(validMasterKeyHex);
    const plaintext = "SAME_PLAINTEXT";

    const enc1 = manager.encrypt(plaintext);
    const enc2 = manager.encrypt(plaintext);

    expect(enc1).not.toBe(enc2);
  });

  it("devrait lever une exception immédiate si l'authTag ou le ciphertext est altéré (Tampering)", () => {
    const manager = new EnvelopeEncryptionManager(validMasterKeyHex);
    const plaintext = "DATA_INTEGRITY_CHECK";
    const encrypted = manager.encrypt(plaintext);

    const parts = encrypted.split(":");
    // Altération du dernier caractère de l'authTag
    const tag = parts[3];
    const tamperedTag = tag.slice(0, -1) + (tag.slice(-1) === "a" ? "b" : "a");
    const tamperedPayload = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedTag}`;

    expect(() => {
      manager.decrypt(tamperedPayload);
    }).toThrowError(/INTÉGRITÉ CRYPTOGRAPHIQUE/);
  });

  it("devrait rejeter un format de payload corrompu ou incomplet", () => {
    const manager = new EnvelopeEncryptionManager(validMasterKeyHex);

    expect(() => {
      manager.decrypt("invalid:format");
    }).toThrowError(/Format de payload chiffré invalide/);
  });

  it("fonctions utilitaires encryptData et decryptData utilisant process.env.APP_MASTER_ENCRYPTION_KEY", () => {
    process.env.APP_MASTER_ENCRYPTION_KEY = validMasterKeyHex;
    const secret = "ENV_SECRET_TOKEN";
    const enc = encryptData(secret);
    const dec = decryptData(enc);
    expect(dec).toBe(secret);
  });
});
