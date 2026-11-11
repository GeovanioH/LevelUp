import { describe, it, expect } from "vitest";
import {
  handleAudioTranscription,
  validateAudioUpload,
  InvalidAudioFormatException,
} from "../../apps/web/server/routes/audioRoutes";

describe("Fastify Audio Ingestion Route Handler", () => {
  it("validates supported mime types (audio/webm, audio/wav, audio/ogg)", () => {
    expect(() => validateAudioUpload("audio/webm", 1024)).not.toThrow();
    expect(() => validateAudioUpload("audio/wav", 2048)).not.toThrow();
    expect(() => validateAudioUpload("audio/opus", 4096)).not.toThrow();
  });

  it("rejects unsupported mime types with typed exception", () => {
    expect(() => validateAudioUpload("application/pdf", 1024)).toThrow(
      InvalidAudioFormatException,
    );
    expect(() => validateAudioUpload("image/png", 1024)).toThrow(
      InvalidAudioFormatException,
    );
  });

  it("processes audio transcription request returning valid payload", async () => {
    const dummyBuffer = Buffer.alloc(64000); // Simulated audio payload
    const result = await handleAudioTranscription({
      filename: "defense_speech.webm",
      mimeType: "audio/webm",
      buffer: dummyBuffer,
    });

    expect(result.detected_language).toBe("fr");
    expect(result.duration).toBeGreaterThan(0);
    expect(result.transcript).toContain("Épreuve orale souveraine");
  });
});
