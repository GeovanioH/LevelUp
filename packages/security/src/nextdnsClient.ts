/**
 * LevelUp NextDNS Cloud Sentinel API Client
 * Distraction Shield & AES-256-GCM Key Envelope Encryption
 * Reference: docs/05-SECURITY.md & docs/09-ROADMAP.md Section 21.6
 */

import { EnvelopeEncryptionManager } from "@levelup/crypto";

export const TOXIC_DISTRACTION_DOMAINS = [
  "tiktok.com",
  "instagram.com",
  "youtube.com",
  "twitter.com",
  "x.com",
  "reddit.com",
] as const;

export class InvalidNextDnsKeyException extends Error {
  constructor(
    message: string = "Clé NextDNS invalide ou intégrité cryptographique compromise.",
  ) {
    super(message);
    this.name = "InvalidNextDnsKeyException";
  }
}

export interface NextDnsClientOptions {
  apiKeyPlain?: string | undefined;
  encryptedApiKey?: string | undefined;
  masterKeyHex: string;
  baseUrl?: string | undefined;
}

export class NextDnsClient {
  private readonly encryptedApiKey: string;
  private readonly encryptionManager: EnvelopeEncryptionManager;
  private readonly baseUrl: string;

  constructor(options: NextDnsClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://api.nextdns.io";
    try {
      this.encryptionManager = new EnvelopeEncryptionManager(
        options.masterKeyHex,
      );
    } catch (err) {
      throw new InvalidNextDnsKeyException(
        `Clé maîtresse invalide : ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    if (options.apiKeyPlain) {
      // Encrypt at rest with AES-256-GCM envelope encryption
      this.encryptedApiKey = this.encryptionManager.encrypt(
        options.apiKeyPlain,
      );
    } else if (options.encryptedApiKey) {
      // Verify integrity by attempting decryption
      try {
        this.encryptionManager.decrypt(options.encryptedApiKey);
        this.encryptedApiKey = options.encryptedApiKey;
      } catch (err) {
        throw new InvalidNextDnsKeyException(
          `Échec du déchiffrement de l'enveloppe AES-256-GCM NextDNS : ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else {
      throw new InvalidNextDnsKeyException(
        "Une clé d'API (en clair ou chiffrée) est requise.",
      );
    }
  }

  public getEncryptedApiKey(): string {
    return this.encryptedApiKey;
  }

  private getDecryptedApiKey(): string {
    try {
      return this.encryptionManager.decrypt(this.encryptedApiKey);
    } catch (err) {
      throw new InvalidNextDnsKeyException(
        `Intégrité compromise lors du déchiffrement : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /**
   * Activates toxic domain blocking on the specified NextDNS profile
   */
  public async blockDistractionDomains(
    profileId: string,
  ): Promise<{ success: boolean; count: number }> {
    const key = this.getDecryptedApiKey();
    const endpoint = `${this.baseUrl}/profiles/${profileId}/denylist`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      body: JSON.stringify({
        domains: [...TOXIC_DISTRACTION_DOMAINS],
        active: true,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur API NextDNS (${response.status}) : échec du blocage.`,
      );
    }

    return { success: true, count: TOXIC_DISTRACTION_DOMAINS.length };
  }

  /**
   * Unblocks domains on session completion or redemption
   */
  public async unblockDomains(
    profileId: string,
  ): Promise<{ success: boolean }> {
    const key = this.getDecryptedApiKey();
    const endpoint = `${this.baseUrl}/profiles/${profileId}/denylist`;

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key,
      },
      body: JSON.stringify({
        domains: [...TOXIC_DISTRACTION_DOMAINS],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur API NextDNS (${response.status}) : échec du déblocage.`,
      );
    }

    return { success: true };
  }
}
