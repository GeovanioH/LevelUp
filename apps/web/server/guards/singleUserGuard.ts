export class SingleUserForbiddenException extends Error {
  public readonly statusCode = 403;

  constructor(
    message = "FORBIDDEN_OPERATION: Accès strictement réservé au Chasseur Maître. Identité non autorisée.",
  ) {
    super(message);
    this.name = "SingleUserForbiddenException";
  }
}

export class SingleUserGuard {
  /**
   * Vérifie si l'ID utilisateur transmis correspond strictement au maître Huriel.
   */
  public static validateUserId(userId: string): boolean {
    const masterId = process.env.MASTER_USER_ID;
    if (!masterId) return false;
    return userId === masterId;
  }

  /**
   * Valide l'identité ou lève immédiatement une exception HTTP 403 (Zero Trust).
   */
  public static assertMasterUser(userId: string): boolean {
    if (!this.validateUserId(userId)) {
      throw new SingleUserForbiddenException();
    }
    return true;
  }
}
