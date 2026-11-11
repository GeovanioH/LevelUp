/**
 * LevelUp Kinematic Joint Angle Engine
 * MediaPipe Pose WebAssembly Trigonometric Formulations
 * Reference: docs/02-TRD.md Section 2.1.3 & docs/09-ROADMAP.md Section 21.4
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export const MEDIAPIPE_INDICES = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;

/**
 * Calculates joint angle theta between 3 anatomical points A, B, C (B is the hinge).
 * Uses 3D Euclidean vectors if z is provided, otherwise 2D planar projection.
 * Formula:
 *   u = A - B
 *   v = C - B
 *   theta = arccos( (u . v) / (||u|| * ||v||) ) * (180 / PI)
 */
export function calculateJointAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark,
  minConfidence: number = DEFAULT_CONFIDENCE_THRESHOLD,
): number {
  if (
    (a.visibility !== undefined && a.visibility < minConfidence) ||
    (b.visibility !== undefined && b.visibility < minConfidence) ||
    (c.visibility !== undefined && c.visibility < minConfidence)
  ) {
    return 0;
  }

  const uX = a.x - b.x;
  const uY = a.y - b.y;
  const uZ = (a.z ?? 0) - (b.z ?? 0);

  const vX = c.x - b.x;
  const vY = c.y - b.y;
  const vZ = (c.z ?? 0) - (c.z ?? 0);

  const dot = uX * vX + uY * vY + uZ * vZ;
  const normU = Math.sqrt(uX * uX + uY * uY + uZ * uZ);
  const normV = Math.sqrt(vX * vX + vY * vY + vZ * vZ);

  if (normU === 0 || normV === 0) {
    return 0;
  }

  // Clamp dot product to [-1, 1] to prevent NaN due to floating point inaccuracies
  const clampedCos = Math.max(-1.0, Math.min(1.0, dot / (normU * normV)));
  const angleRad = Math.acos(clampedCos);
  const angleDeg = (angleRad * 180.0) / Math.PI;

  return Math.abs(angleDeg);
}

/**
 * Calculates elbow angle (Left: 11, 13, 15 | Right: 12, 14, 16)
 */
export function calculateElbowAngle(
  landmarks: PoseLandmark[],
  side: "left" | "right" | "both" = "left",
  minConfidence: number = DEFAULT_CONFIDENCE_THRESHOLD,
): number {
  if (side === "left" || side === "both") {
    const shoulder = landmarks[MEDIAPIPE_INDICES.LEFT_SHOULDER];
    const elbow = landmarks[MEDIAPIPE_INDICES.LEFT_ELBOW];
    const wrist = landmarks[MEDIAPIPE_INDICES.LEFT_WRIST];

    if (shoulder && elbow && wrist) {
      const angle = calculateJointAngle(shoulder, elbow, wrist, minConfidence);
      if (side === "left") return angle;
      if (side === "both") {
        const rShoulder = landmarks[MEDIAPIPE_INDICES.RIGHT_SHOULDER];
        const rElbow = landmarks[MEDIAPIPE_INDICES.RIGHT_ELBOW];
        const rWrist = landmarks[MEDIAPIPE_INDICES.RIGHT_WRIST];
        if (rShoulder && rElbow && rWrist) {
          const rAngle = calculateJointAngle(
            rShoulder,
            rElbow,
            rWrist,
            minConfidence,
          );
          return (angle + rAngle) / 2.0;
        }
        return angle;
      }
    }
  }

  if (side === "right") {
    const shoulder = landmarks[MEDIAPIPE_INDICES.RIGHT_SHOULDER];
    const elbow = landmarks[MEDIAPIPE_INDICES.RIGHT_ELBOW];
    const wrist = landmarks[MEDIAPIPE_INDICES.RIGHT_WRIST];

    if (shoulder && elbow && wrist) {
      return calculateJointAngle(shoulder, elbow, wrist, minConfidence);
    }
  }

  return 0;
}

/**
 * Calculates knee angle (Left: 23, 25, 27 | Right: 24, 26, 28)
 */
export function calculateKneeAngle(
  landmarks: PoseLandmark[],
  side: "left" | "right" = "left",
  minConfidence: number = DEFAULT_CONFIDENCE_THRESHOLD,
): number {
  const hipIdx =
    side === "left" ? MEDIAPIPE_INDICES.LEFT_HIP : MEDIAPIPE_INDICES.RIGHT_HIP;
  const kneeIdx =
    side === "left"
      ? MEDIAPIPE_INDICES.LEFT_KNEE
      : MEDIAPIPE_INDICES.RIGHT_KNEE;
  const ankleIdx =
    side === "left"
      ? MEDIAPIPE_INDICES.LEFT_ANKLE
      : MEDIAPIPE_INDICES.RIGHT_ANKLE;

  const hip = landmarks[hipIdx];
  const knee = landmarks[kneeIdx];
  const ankle = landmarks[ankleIdx];

  if (hip && knee && ankle) {
    return calculateJointAngle(hip, knee, ankle, minConfidence);
  }

  return 0;
}
