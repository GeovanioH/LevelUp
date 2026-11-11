import { describe, it, expect } from "vitest";
import {
  calculateSM2,
  SM2Item,
  InvalidGradeException,
  type SM2ReviewResult,
} from "../../../packages/brain/src/sm2";

describe("SM-2 Spaced Repetition Engine (Wozniak)", () => {
  it("initializes default item with repetition=0, interval=1, easeFactor=2.5", () => {
    const item = new SM2Item("note-quantum-computing");
    expect(item.repetition).toBe(0);
    expect(item.interval).toBe(1);
    expect(item.easeFactor).toBeCloseTo(2.5, 2);
  });

  it("rejects grades outside the [0, 5] integer range", () => {
    const item = new SM2Item("note-test");
    expect(() => calculateSM2(item, -1)).toThrow(InvalidGradeException);
    expect(() => calculateSM2(item, 6)).toThrow(InvalidGradeException);
  });

  it("calculates exact Wozniak intervals for consecutive perfect recall (grade 5)", () => {
    let item: SM2Item = new SM2Item("test-item", 0, 1, 2.5);

    // 1st review (q = 5):
    // EF' = 2.5 + (0.1 - (0)*(...)) = 2.6
    // n = 1, interval = 1
    let result = calculateSM2(item, 5);
    expect(result.repetition).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.6, 2);

    // 2nd review (q = 5):
    // EF' = 2.6 + 0.1 = 2.7
    // n = 2, interval = 6
    item = new SM2Item(
      "test-item",
      result.repetition,
      result.interval,
      result.easeFactor,
    );
    result = calculateSM2(item, 5);
    expect(result.repetition).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.easeFactor).toBeCloseTo(2.7, 2);

    // 3rd review (q = 5):
    // EF' = 2.7 + 0.1 = 2.8
    // n = 3, interval = round(6 * 2.8) = round(16.8) = 17
    item = new SM2Item(
      "test-item",
      result.repetition,
      result.interval,
      result.easeFactor,
    );
    result = calculateSM2(item, 5);
    expect(result.repetition).toBe(3);
    expect(result.interval).toBe(17);
    expect(result.easeFactor).toBeCloseTo(2.8, 2);

    // 4th review (q = 5):
    // EF' = 2.8 + 0.1 = 2.9
    // n = 4, interval = round(17 * 2.9) = round(49.3) = 49
    item = new SM2Item(
      "test-item",
      result.repetition,
      result.interval,
      result.easeFactor,
    );
    result = calculateSM2(item, 5);
    expect(result.repetition).toBe(4);
    expect(result.interval).toBe(49);
    expect(result.easeFactor).toBeCloseTo(2.9, 2);
  });

  it("preserves ease factor when grade is 4 (neutral recall)", () => {
    const item = new SM2Item("test-item", 1, 1, 2.5);
    // For q=4: (5-4)=1 -> 0.1 - 1*(0.08 + 0.02) = 0.1 - 0.10 = 0 -> EF unchanged!
    const result = calculateSM2(item, 4);
    expect(result.easeFactor).toBeCloseTo(2.5, 2);
    expect(result.interval).toBe(6);
    expect(result.repetition).toBe(2);
  });

  it("resets repetition count to 0 and interval to 1 on failure (grade < 3)", () => {
    // Advanced item with high repetition
    const item = new SM2Item("test-item", 4, 49, 2.6);

    // Blackout / failure (q = 1)
    const result = calculateSM2(item, 1);
    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
    // EF decreases
    expect(result.easeFactor).toBeLessThan(2.6);
  });

  it("strictly bounds easeFactor to a minimum floor of 1.3", () => {
    // Repeated catastrophic failures (q = 0)
    let item = new SM2Item("difficult-card", 0, 1, 1.4);
    for (let i = 0; i < 5; i++) {
      const res = calculateSM2(item, 0);
      item = new SM2Item(
        "difficult-card",
        res.repetition,
        res.interval,
        res.easeFactor,
      );
    }

    expect(item.easeFactor).toBe(1.3);
  });

  it("computes next review date accurately based on interval days", () => {
    const item = new SM2Item("card", 1, 6, 2.5);
    const baseDate = new Date("2026-11-11T12:00:00Z");
    const result = calculateSM2(item, 5, baseDate);

    // Next review date should be baseDate + 6 days
    const expectedDate = new Date("2026-11-17T12:00:00Z");
    expect(result.nextReviewDate.toISOString()).toBe(
      expectedDate.toISOString(),
    );
  });
});
