import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import {
  NextDnsClient,
  TOXIC_DISTRACTION_DOMAINS,
  InvalidNextDnsKeyException,
} from "../../../packages/security/src/nextdnsClient";
import {
  applyHostsBlock,
  HOSTS_BLOCK_HEADER,
  HOSTS_BLOCK_FOOTER,
} from "../../../packages/security/src/localFirewall";

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

  it("sends unblocking delete requests to NextDNS API and returns confirmation", async () => {
    const result = await client.unblockDomains("profile-huriel-01");

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/profiles/profile-huriel-01/denylist/"),
      expect.objectContaining({
        method: "DELETE",
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

describe("Local Firewall & Hosts Sentinel Block", () => {
  let tmpHostsPath: string;

  beforeEach(() => {
    tmpHostsPath = path.join(os.tmpdir(), `test_hosts_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`);
    fs.writeFileSync(tmpHostsPath, "127.0.0.1 localhost\n::1 localhost\n", "utf-8");
  });

  it("applies toxic domain redirection blocks in hosts file cleanly", () => {
    const res = applyHostsBlock(tmpHostsPath, true, ["tiktok.com", "instagram.com"]);
    expect(res.applied).toBe(true);

    const content = fs.readFileSync(tmpHostsPath, "utf-8");
    expect(content).toContain(HOSTS_BLOCK_HEADER);
    expect(content).toContain(HOSTS_BLOCK_FOOTER);
    expect(content).toContain("127.0.0.1 tiktok.com");
    expect(content).toContain("127.0.0.1 instagram.com");

    if (fs.existsSync(tmpHostsPath)) fs.unlinkSync(tmpHostsPath);
  });

  it("removes toxic domain redirection blocks when restriction is lifted", () => {
    applyHostsBlock(tmpHostsPath, true, ["tiktok.com"]);
    const res = applyHostsBlock(tmpHostsPath, false);
    expect(res.applied).toBe(true);

    const content = fs.readFileSync(tmpHostsPath, "utf-8");
    expect(content).not.toContain(HOSTS_BLOCK_HEADER);
    expect(content).not.toContain("127.0.0.1 tiktok.com");
    expect(content).toContain("127.0.0.1 localhost");

    if (fs.existsSync(tmpHostsPath)) fs.unlinkSync(tmpHostsPath);
  });
});
