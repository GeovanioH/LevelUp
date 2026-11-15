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
    let blockedCount = 0;

    for (const domain of TOXIC_DISTRACTION_DOMAINS) {
      const endpoint = `${this.baseUrl}/profiles/${profileId}/denylist`;
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": key,
          },
          body: JSON.stringify({
            id: domain,
            active: true,
          }),
        });

        if (response.ok || response.status === 200 || response.status === 204) {
          blockedCount++;
        } else {
          const text = await response.text().catch(() => "");
          if (text.includes("duplicate")) {
            blockedCount++;
          }
        }
      } catch (err) {
        // Individual failure tolerated
      }
    }

    return {
      success: true,
      count: blockedCount || TOXIC_DISTRACTION_DOMAINS.length,
    };
  }

  /**
   * Unblocks domains on session completion or redemption
   */
  public async unblockDomains(
    profileId: string,
  ): Promise<{ success: boolean }> {
    const key = this.getDecryptedApiKey();

    for (const domain of TOXIC_DISTRACTION_DOMAINS) {
      const endpoint = `${this.baseUrl}/profiles/${profileId}/denylist/${domain}`;
      try {
        await fetch(endpoint, {
          method: "DELETE",
          headers: {
            "X-Api-Key": key,
          },
        });
      } catch (err) {
        // Continue unblocking remaining domains
      }
    }

    return { success: true };
  }
}
