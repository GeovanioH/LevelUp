import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  hkdfSync,
} from "crypto";

export interface EncryptedPayload {
  version: "v1";
  iv: string; // 12 octets (96 bits) encodés en hexadécimal
  ciphertext: string; // Données chiffrées en hexadécimal
  authTag: string; // 16 octets (128 bits) du tag d'authentification GCM
}

export class EnvelopeEncryptionManager {
  private readonly derivedKey: Buffer;

  constructor(masterSecretHex: string) {
    if (!masterSecretHex || masterSecretHex.length !== 64) {
      throw new Error(
        "La clé maîtresse APP_MASTER_ENCRYPTION_KEY doit être exactement de 256 bits (64 caractères hexadécimaux).",
      );
    }
    const masterBuffer = Buffer.from(masterSecretHex, "hex");

    // Dérivation cryptographique HKDF-SHA256 (RFC 5869)
    this.derivedKey = Buffer.from(
      hkdfSync(
        "sha256",
        masterBuffer,
        Buffer.from("levelup_static_system_salt_2026", "utf-8"),
        Buffer.from("LevelUp_Database_Vault_v1", "utf-8"),
        32, // 256 bits pour AES-256
      ),
    );
  }

  /**
   * Chiffre une chaîne de caractères en clair avec AES-256-GCM et un nouvel IV aléatoire unique.
   */
  public encrypt(plaintext: string): string {
    // 1. Génération d'un IV CSPRNG non réutilisable de 96 bits (12 octets)
    const iv = randomBytes(12);

    // 2. Initialisation du chiffreur AES-256-GCM
    const cipher = createCipheriv("aes-256-gcm", this.derivedKey, iv);

    // 3. Chiffrement du texte en clair
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, "utf-8"),
      cipher.final(),
    ]);

    // 4. Extraction du tag d'authentification MAC 128 bits
    const authTag = cipher.getAuthTag();

    // 5. Format canonique de stockage immuable : v1:iv:ciphertext:tag
    return `v1:${iv.toString("hex")}:${ciphertext.toString("hex")}:${authTag.toString("hex")}`;
  }

  /**
   * Déchiffre un payload chiffré et valide formellement l'intégrité via le tag d'authentification.
   */
  public decrypt(serializedPayload: string): string {
    const parts = serializedPayload.split(":");
    if (parts.length !== 4 || parts[0] !== "v1") {
      throw new Error(
        "Format de payload chiffré invalide ou version cryptographique inconnue.",
      );
    }

    const iv = Buffer.from(parts[1], "hex");
    const ciphertext = Buffer.from(parts[2], "hex");
    const authTag = Buffer.from(parts[3], "hex");

    if (iv.length !== 12 || authTag.length !== 16) {
      throw new Error(
        "Dimensions d’enveloppe cryptographique altérées (IV != 96 bits ou Tag != 128 bits).",
      );
    }

    const decipher = createDecipheriv("aes-256-gcm", this.derivedKey, iv);
    decipher.setAuthTag(authTag);

    try {
      const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return plaintext.toString("utf-8");
    } catch {
      // Déclenche une alerte de sécurité si le tag d'authentification ne correspond pas (Tampering détecté)
      throw new Error(
        "ÉCHEC DE VALIDATION DE L’INTÉGRITÉ CRYPTOGRAPHIQUE : Données chiffrées compromises ou altérées.",
      );
    }
  }
}

let cachedManager: EnvelopeEncryptionManager | null = null;

function getEnvironmentManager(): EnvelopeEncryptionManager {
  const masterKey =
    process.env.APP_MASTER_ENCRYPTION_KEY ||
    process.env.APP_ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  if (!cachedManager) {
    cachedManager = new EnvelopeEncryptionManager(masterKey);
  }
  return cachedManager;
}

export function encryptData(plaintext: string): string {
  return getEnvironmentManager().encrypt(plaintext);
}

export function decryptData(serializedPayload: string): string {
  return getEnvironmentManager().decrypt(serializedPayload);
}
