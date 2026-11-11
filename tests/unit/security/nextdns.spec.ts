import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomBytes } from "crypto";
import {
  NextDnsClient,
  TOXIC_DISTRACTION_DOMAINS,
  InvalidNextDnsKeyException,
} from "../../../packages/security/src/nextdnsClient";

describe("NextDNS Sentinel API & Cryptographic Shield", () => {
  const masterKey = randomBytes(32).toString("hex");
  let client: NextDnsClient;
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, count: 6 }),
    });
    global.fetch = mockFetch;

    client = new NextDnsClient({
      apiKeyPlain: "nextdns_live_secret_key_12345",
      masterKeyHex: masterKey,
    });
  });

  it("contains the 6 canonical toxic distraction domains", () => {
    expect(TOXIC_DISTRACTION_DOMAINS).toContain("tiktok.com");
    expect(TOXIC_DISTRACTION_DOMAINS).toContain("instagram.com");
    expect(TOXIC_DISTRACTION_DOMAINS).toContain("youtube.com");
    expect(TOXIC_DISTRACTION_DOMAINS).toContain("x.com");
    expect(TOXIC_DISTRACTION_DOMAINS).toContain("twitter.com");
    expect(TOXIC_DISTRACTION_DOMAINS).toContain("reddit.com");
  });

  it("encrypts NextDNS API key at rest with AES-256-GCM envelope encryption", () => {
    const encryptedKey = client.getEncryptedApiKey();
    expect(encryptedKey).toBeDefined();
    expect(encryptedKey).toContain("v1:");
    // Plaintext key is not stored directly
    expect(encryptedKey).not.toContain("nextdns_live_secret_key_12345");
  });

  it("sends blocking denylist payload to NextDNS API and returns confirmation", async () => {
    const result = await client.blockDistractionDomains("profile-huriel-01");

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/profiles/profile-huriel-01/denylist"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Api-Key": "nextdns_live_secret_key_12345",
        }),
      }),
    );
  });

  it("strictly rejects tampered API key envelope with integrity exception", () => {
    const corruptedPayload = "v1:000000000000000000000000:badcipher:badauth";

    expect(() => {
      new NextDnsClient({
        encryptedApiKey: corruptedPayload,
        masterKeyHex: masterKey,
      });
    }).toThrow(InvalidNextDnsKeyException);
  });
});
