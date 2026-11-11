import { describe, it, expect, beforeEach } from "vitest";
import {
  TimeBlockingEngine,
  TimeBlockType,
  InvalidTimeRangeException,
  ConflictingScheduleException,
  type TimeBlock,
} from "../../../packages/scheduler/src/timeBlocking";

describe("Time-Blocking & Circadian Scheduling Engine", () => {
  let engine: TimeBlockingEngine;

  beforeEach(() => {
    engine = new TimeBlockingEngine("2026-11-12");
  });

  it("rejects a time block where endTime <= startTime", () => {
    expect(() =>
      engine.addBlock({
        id: "block-invalid",
        title: "Bloc Temporel Absurde",
        type: TimeBlockType.DEEP_WORK,
        startTime: "14:00",
        endTime: "13:00",
      }),
    ).toThrow(InvalidTimeRangeException);

    expect(() =>
      engine.addBlock({
        id: "block-zero-duration",
        title: "Bloc Nul",
        type: TimeBlockType.DEEP_WORK,
        startTime: "14:00",
        endTime: "14:00",
      }),
    ).toThrow(InvalidTimeRangeException);
  });

  it("sanctuarizes physiological sleep (23:00 to 07:00) by default", () => {
    const blocks = engine.getBlocks();
    const sleepBlocks = blocks.filter(
      (b) => b.type === TimeBlockType.SANCTUARY_SLEEP,
    );

    expect(sleepBlocks.length).toBeGreaterThan(0);
    expect(sleepBlocks.some((b) => b.startTime === "23:00")).toBe(true);
    expect(sleepBlocks.some((b) => b.endTime === "07:00")).toBe(true);
  });

  it("detects immediate schedule overlap when inserting conflicting blocks", () => {
    // Add university lecture from 09:00 to 12:00
    engine.addBlock({
      id: "fac-ai",
      title: "Master IA - Apprentissage Profond",
      type: TimeBlockType.UNIVERSITY,
      startTime: "09:00",
      endTime: "12:00",
    });

    // Try to insert a conflicting block from 10:30 to 13:00
    expect(() =>
      engine.addBlock({
        id: "conflicting-session",
        title: "Session Concurrente",
        type: TimeBlockType.DEEP_WORK,
        startTime: "10:30",
        endTime: "13:00",
      }),
    ).toThrow(ConflictingScheduleException);
  });

  it("strictly forbids overriding sanctuarized blocks (Sleep / Calisthenics)", () => {
    // Attempt to schedule Deep Work during nocturnal sleep (01:00 to 03:00)
    expect(() =>
      engine.addBlock({
        id: "nocturnal-deep-work",
        title: "Nuit Blanche Destructrice",
        type: TimeBlockType.DEEP_WORK,
        startTime: "01:00",
        endTime: "03:00",
      }),
    ).toThrow(ConflictingScheduleException);
  });

  it("dynamically schedules Deep Work blocks in available free slots without overlap", () => {
    // Register Academic blocks: 08:30 to 12:00 and 14:00 to 17:00
    engine.addBlock({
      id: "fac-matin",
      title: "Mathématiques & Optimisation",
      type: TimeBlockType.UNIVERSITY,
      startTime: "08:30",
      endTime: "12:00",
    });

    engine.addBlock({
      id: "fac-aprem",
      title: "Sécurité Systèmes & Réseaux",
      type: TimeBlockType.UNIVERSITY,
      startTime: "14:00",
      endTime: "17:00",
    });

    // Register Calisthenics workout: 18:00 to 19:30
    engine.addBlock({
      id: "sport-workout",
      title: "Routine Dos & Épaules Calisthénie",
      type: TimeBlockType.SANCTUARY_SPORT,
      startTime: "18:00",
      endTime: "19:30",
    });

    // Request dynamic scheduling of a 90-minute Deep Work session
    const scheduled = engine.scheduleDeepWorkSession(
      "Session Architecture & Code LevelUp",
      90, // minutes
    );

    expect(scheduled).toBeDefined();
    expect(scheduled.type).toBe(TimeBlockType.DEEP_WORK);

    // Verify it is placed in a legitimate free slot (e.g., 12:00-13:30 or 19:30-21:00)
    expect(engine.detectOverlap(scheduled)).toBe(false);

    // Verify sanctuarized blocks are untouched
    const sleepBlock = engine.getBlocks().find((b) => b.startTime === "23:00");
    expect(sleepBlock?.type).toBe(TimeBlockType.SANCTUARY_SLEEP);
  });
});
