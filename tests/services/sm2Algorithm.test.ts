import { describe, it, expect } from "vitest";
import {
  calculateSM2,
  SM2Item,
  InvalidGradeException,
} from "../../apps/web/server/services/SpacedRepetitionEngine";

describe("SpacedRepetitionEngine Service (SM-2)", () => {
  it("calculates correct interval and ease factor progression", () => {
    let item = new SM2Item("card-1", 0, 1, 2.5);

    // 1st review: perfect grade 5
    let res = calculateSM2(item, 5);
    expect(res.repetition).toBe(1);
    expect(res.interval).toBe(1);
    expect(res.easeFactor).toBeCloseTo(2.6, 2);

    // 2nd review: grade 4 (retained well)
    item = new SM2Item("card-1", res.repetition, res.interval, res.easeFactor);
    res = calculateSM2(item, 4);
    expect(res.repetition).toBe(2);
    expect(res.interval).toBe(6);
    expect(res.easeFactor).toBeCloseTo(2.6, 2); // unchanged for grade 4

    // 3rd review: grade 5
    item = new SM2Item("card-1", res.repetition, res.interval, res.easeFactor);
    res = calculateSM2(item, 5);
    expect(res.repetition).toBe(3);
    expect(res.interval).toBe(16); // round(6 * 2.7) = 16
    expect(res.easeFactor).toBeCloseTo(2.7, 2);
  });

  it("handles memory lapse (grade 2) and resets review streak", () => {
    const item = new SM2Item("card-2", 5, 60, 2.5);
    const res = calculateSM2(item, 2);

    expect(res.repetition).toBe(0);
    expect(res.interval).toBe(1);
    expect(res.easeFactor).toBeLessThan(2.5);
  });
});
