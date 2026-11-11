/**
 * Moteur Sonore Procédural Web Audio API pour LevelUp ("The System").
 * Synthétise en temps réel les bruitages holographiques et fanfares sans aucun fichier externe (0,00 € / zéro dépendance).
 */
export class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Bruitage holographique court de notification système Solo Leveling.
   */
  public playSystemNotification(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // La5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // La6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignorer si audio non autorisé
    }
  }

  /**
   * Fanfare procédurale de montée de niveau en Do Majeur (Do - Mi - Sol - Do aigu).
   */
  public playLevelUpFanfare(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Fréquences C4, E4, G4, C5 (Do Majeur triomphal)
      const notes = [261.63, 329.63, 392.0, 523.25];

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.4);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Alerte sonore de la Zone de Pénalité (Sirène d'urgence descendante).
   */
  public playPenaltyAlarm(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.5);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Fallback
    }
  }
}

export const proceduralAudio = new ProceduralAudioEngine();
