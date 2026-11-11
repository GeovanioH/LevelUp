import { describe, it, expect } from "vitest";
import {
  SingleUserGuard,
  SingleUserForbiddenException,
} from "../../apps/web/server/guards/singleUserGuard";

describe("SingleUserGuard - Zero Trust Web & API Access Control", () => {
  const MASTER_ID = "huriel-master-uuid-2026";

  it("devrait autoriser le joueur maître authentifié", () => {
    process.env.MASTER_USER_ID = MASTER_ID;
    const isAllowed = SingleUserGuard.validateUserId(MASTER_ID);
    expect(isAllowed).toBe(true);
  });

  it("devrait rejeter formellement tout identifiant non-maître avec une exception 403", () => {
    process.env.MASTER_USER_ID = MASTER_ID;
    const maliciousId = "malicious-intruder-id-9999";

    expect(() => {
      SingleUserGuard.assertMasterUser(maliciousId);
    }).toThrowError(SingleUserForbiddenException);

    try {
      SingleUserGuard.assertMasterUser(maliciousId);
    } catch (err: any) {
      expect(err.statusCode).toBe(403);
      expect(err.message).toMatch(/FORBIDDEN_OPERATION/);
    }
  });

  it("devrait rejeter si aucune clé MASTER_USER_ID n'est configurée en environnement", () => {
    delete process.env.MASTER_USER_ID;
    expect(() => {
      SingleUserGuard.assertMasterUser(MASTER_ID);
    }).toThrowError(/FORBIDDEN_OPERATION/);
  });
});
