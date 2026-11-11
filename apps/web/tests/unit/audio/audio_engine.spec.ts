// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProceduralAudioEngine } from "../../../src/audio/proceduralAudioEngine";

describe("ProceduralAudioEngine - Synthétiseur Web Audio API Solo Leveling", () => {
  let createdOscillators: any[] = [];
  let setFrequencyCalls: { freq: number; time: number }[] = [];

  beforeEach(() => {
    createdOscillators = [];
    setFrequencyCalls = [];

    // Mock complet de l'AudioContext pour l'environnement de test Node/JSDOM
    const mockAudioContext = vi.fn().mockImplementation(() => ({
      state: "running",
      currentTime: 0,
      resume: vi.fn(),
      destination: {},
      createOscillator: vi.fn().mockImplementation(() => {
        const osc = {
          type: "sine",
          frequency: {
            setValueAtTime: vi.fn((freq, time) => {
              setFrequencyCalls.push({ freq, time });
            }),
            exponentialRampToValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn().mockImplementation(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      })),
    }));

    (window as any).AudioContext = mockAudioContext;
  });

  it("TC-2.4a : Initialisation de l'AudioContext sans crash", () => {
    const engine = new ProceduralAudioEngine();
    expect(() => engine.playSystemNotification()).not.toThrow();
    expect((window as any).AudioContext).toHaveBeenCalled();
  });

  it("TC-2.4b : Déclenchement des oscillateurs sur fréquence fondamentale 523.25 Hz (Do5)", () => {
    const engine = new ProceduralAudioEngine();
    engine.playLevelUpFanfare();

    // Vérification de la création des 4 oscillateurs de l'arpège en Do Majeur
    expect(createdOscillators.length).toBe(4);

    // Vérification du déclenchement sur la fréquence Do5 (523.25 Hz)
    const do5Call = setFrequencyCalls.find(
      (call) => Math.abs(call.freq - 523.25) < 0.01,
    );
    expect(do5Call).toBeDefined();
    expect(do5Call?.freq).toBe(523.25);

    // Vérification que tous les oscillateurs ont été démarrés
    for (const osc of createdOscillators) {
      expect(osc.start).toHaveBeenCalled();
      expect(osc.stop).toHaveBeenCalled();
    }
  });

  it("TC-2.4c : Joue l'alarme de pénalité en onde sawtooth sans exception", () => {
    const engine = new ProceduralAudioEngine();
    expect(() => engine.playPenaltyAlarm()).not.toThrow();
  });
});
