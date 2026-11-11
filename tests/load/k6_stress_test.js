import http from "k6/http";
import { check, sleep } from "k6";

/**
 * LevelUp Sovereign Load & Stress Test (K6)
 * Simulates high-concurrency requests against player HUD & quest endpoints.
 * Reference: docs/09-ROADMAP.md Section 21.8 & docs/07-TEST_PLAN.md Section 5
 */

export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp-up to 50 VUs
    { duration: "1m", target: 100 }, // Scale to 100 VUs
    { duration: "3m", target: 100 }, // Sustain 100 concurrent VUs
    { duration: "30s", target: 0 }, // Graceful ramp-down
  ],
  thresholds: {
    // 95% of requests under 35ms, 99% under 50ms
    http_req_duration: ["p(95)<35", "p(99)<50"],
    // HTTP error rate under 0.01%
    http_req_failed: ["rate<0.0001"],
  },
};

export default function () {
  const BASE_URL = __ENV.API_BASE_URL || "http://localhost:3000";
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer monarch_secret_token_2026",
    },
  };

  // 1. Query Player Status & Harmonic Rank
  const statusRes = http.get(`${BASE_URL}/api/v1/player/status`, params);
  check(statusRes, {
    "status is 200": (r) => r.status === 200,
    "latency under 35ms": (r) => r.timings.duration < 35,
  });

  // 2. Query Daily Quests
  const questsRes = http.get(`${BASE_URL}/api/v1/quests/daily`, params);
  check(questsRes, {
    "quests status is 200": (r) => r.status === 200,
    "latency under 35ms": (r) => r.timings.duration < 35,
  });

  sleep(0.1);
}
