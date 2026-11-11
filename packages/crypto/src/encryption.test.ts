import { describe, it, expect } from "vitest";
import { EnvelopeEncryptionManager } from "./encryption";
import { MasterPasswordSecurity } from "./passwordHasher";

describe("Envelope Encryption & Argon2id Password Hashing", () => {
  const masterKey =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  it("chiffre et déchiffre les secrets fidèlement", () => {
    const manager = new EnvelopeEncryptionManager(masterKey);
    const plaintext = "SovereignMasterKeyToken2026";
    const encrypted = manager.encrypt(plaintext);
    expect(encrypted.startsWith("v1:")).toBe(true);

    const decrypted = manager.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("rejette tout tag MAC altéré", () => {
    const manager = new EnvelopeEncryptionManager(masterKey);
    const encrypted = manager.encrypt("TopSecretData");
    const parts = encrypted.split(":");
    const tamperedTag = parts[3].slice(0, -2) + "00";
    const tampered = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedTag}`;

    expect(() => manager.decrypt(tampered)).toThrowError(
      /INTÉGRITÉ CRYPTOGRAPHIQUE/,
    );
  });

  it("hache et vérifie les mots de passe avec Argon2id", async () => {
    const password = "DragonMonarch2026!";
    const hash = await MasterPasswordSecurity.hashPassword(password);
    expect(hash.startsWith("$argon2id$")).toBe(true);

    const isValid = await MasterPasswordSecurity.verifyPassword(hash, password);
    expect(isValid).toBe(true);

    const isInvalid = await MasterPasswordSecurity.verifyPassword(
      hash,
      "WrongPassword!",
    );
    expect(isInvalid).toBe(false);
  });
});
