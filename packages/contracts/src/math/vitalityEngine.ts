export interface VitalityState {
  hp: number; // 60 - 100 (Résilience Biologique Souveraine)
  mp: number; // 50 - 100 (Focus & Acuité Cognitive)
  statusTitle: string; // Ex: 'VITALITÉ INDOMPTABLE', 'FOCUS ABSOLU'
  hoursAwake: number;
}

export class NeurobiologicalVitalityEngine {
  private static readonly TAU_W_HOURS = 18.2; // Constante de temps homéostatique d'éveil (Borbély)
  private static readonly S0_RESIDUAL = 0.08; // Pression résiduelle matinale

  /**
   * Calcule les points de vie (HP) selon le modèle à deux processus de Borbély :
   * Processus S (homéostasie) et Processus C (rythme circadien).
   * Plancher souverain garanti à 60%, garantissant HP >= 80% après 16h d'éveil actif.
   */
  public static calculateHp(
    hoursAwake: number,
    currentHourOfDay: number,
  ): number {
    const clampedHoursAwake = Math.max(0, hoursAwake);
    const normalizedHour = ((currentHourOfDay % 24) + 24) % 24;

    // 1. Processus S de Borbély (accumulation de pression homéostatique)
    const processS =
      1.0 -
      (1.0 - this.S0_RESIDUAL) *
        Math.exp(-clampedHoursAwake / this.TAU_W_HOURS);

    // 2. Processus C Circadien (Pic d'alerte vers 14h)
    const processC =
      1.0 + 0.05 * Math.cos((2.0 * Math.PI * (normalizedHour - 14.0)) / 24.0);

    // 3. Calcul de la vitalité biologique souveraine (plancher garanti à 60%)
    const rawHp = 100.0 * (1.0 - 0.25 * processS) * processC;
    return Math.max(60, Math.min(100, Math.floor(rawHp)));
  }

  /**
   * Décroissance logarithmique douce de l'énergie mentale selon Boksem & Tops :
   * Delta MP = 8.5 * ln(1 + t_work / 45)
   */
  public static calculateMpConsumption(workBlockMinutes: number): number {
    const clampedMinutes = Math.max(0, workBlockMinutes);
    return 8.5 * Math.log(1.0 + clampedMinutes / 45.0);
  }

  /**
   * Pulse dopaminergique lors de la complétion d'une quête :
   * +10 MP (DAILY), +15 MP (ALGO), +25 MP (BOSS).
   */
  public static applyDopamineReward(
    currentMp: number,
    questType: "DAILY" | "BOSS" | "ALGO" | string = "DAILY",
  ): number {
    let boost = 10;
    if (questType === "BOSS") boost = 25;
    else if (questType === "ALGO") boost = 15;

    return Math.min(100, Math.max(0, currentMp + boost));
  }

  /**
   * Statut psychologique valorisant et souverain.
   * Interdiction absolue de vocabulaire de fatigue, léthargie ou faiblesse.
   */
  public static getPsychologicalStatusText(hp: number, mp: number): string {
    if (hp >= 90 && mp >= 90) {
      return "VITALITÉ MAXIMALE & FOCUS SOUVERAIN";
    }
    if (hp >= 80) {
      return "RÉSILIENCE INÉBRANLABLE & CLARTÉ OPÉRATIONNELLE";
    }
    return "DÉTERMINATION D'ACIER & VIGILANCE ACTIVE";
  }
}
