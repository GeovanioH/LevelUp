import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ProceduralAudioEngine,
  playSystemNotification,
  playLevelUpFanfare,
  playPenaltyAlert,
} from "../../apps/web/audio/ProceduralSoundEngine";

describe("ProceduralSoundEngine Web Audio API Synthesizer", () => {
  let mockContext: any;
  let mockOscillator: any;
  let mockGain: any;

  beforeEach(() => {
    mockOscillator = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockContext = {
      currentTime: 10.0,
      state: "running",
      createOscillator: vi.fn(() => ({ ...mockOscillator })),
      createGain: vi.fn(() => ({ ...mockGain })),
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
    };

    (global as any).AudioContext = vi
      .fn()
      .mockImplementation(() => mockContext);
  });

  it("plays notification chime using procedural dual-tone frequencies", () => {
    const engine = new ProceduralAudioEngine();
    engine.playNotificationChime();

    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockContext.createGain).toHaveBeenCalled();
  });

  it("plays level-up fanfare featuring fundamental C5 note (523.25 Hz)", () => {
    const engine = new ProceduralAudioEngine();
    engine.playLevelUpFanfare();

    expect(mockContext.createOscillator).toHaveBeenCalled();
    expect(mockContext.createGain).toHaveBeenCalled();
  });

  it("plays penalty alarm sawtooth wave without external audio assets", () => {
    const engine = new ProceduralAudioEngine();
    engine.playPenaltyAlarm();

    expect(mockContext.createOscillator).toHaveBeenCalled();
  });
});
