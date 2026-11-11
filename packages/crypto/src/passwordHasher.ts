import * as argon2 from "argon2";

export class MasterPasswordSecurity {
  // Paramètres durcis recommandés pour machine moderne (NIST & ANSSI)
  private static readonly ARGON2_CONFIG = {
    type: argon2.argon2id as 2,
    memoryCost: 65536, // 64 Mo de RAM allouée (immunité ASIC/GPU)
    timeCost: 3, // 3 itérations complètes
    parallelism: 4, // 4 threads concurrents
    hashLength: 32, // Hachage de 256 bits
  } as const;

  public static async hashPassword(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, this.ARGON2_CONFIG);
  }

  public static async verifyPassword(
    hashedPassword: string,
    candidatePassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, candidatePassword);
    } catch {
      return false;
    }
  }
}
