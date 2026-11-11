import { describe, it, expect, beforeEach } from "vitest";
import {
  DiscordVoiceReceiver,
  RtpOpusPacket,
} from "../../../src/voice/discordVoiceReceiver";

describe("Discord Voice UDP Streaming & RTP/Opus Audio Ingestion", () => {
  let receiver: DiscordVoiceReceiver;

  beforeEach(() => {
    receiver = new DiscordVoiceReceiver({
      sampleRate: 48000,
      channels: 2,
    });
  });

  // Helper to build a valid 12-byte RTP packet with Opus payload
  function createSyntheticRtpPacket(
    sequenceNumber: number,
    timestamp: number,
    payloadSize: number = 80,
  ): Buffer {
    const packet = Buffer.alloc(12 + payloadSize);
    // Byte 0: Version 2 (0x80)
    packet[0] = 0x80;
    // Byte 1: Payload type 120 (Opus) (0x78)
    packet[1] = 0x78;
    // Bytes 2-3: Sequence number
    packet.writeUInt16BE(sequenceNumber, 2);
    // Bytes 4-7: Timestamp
    packet.writeUInt32BE(timestamp, 4);
    // Bytes 8-11: SSRC identifier
    packet.writeUInt32BE(0x12345678, 8);
    // Bytes 12+: Synthetic Opus audio data
    packet.fill(0xaa, 12);
    return packet;
  }

  it("parses incoming UDP RTP packet header accurately", () => {
    const rawPacket = createSyntheticRtpPacket(42, 96000, 100);
    const parsed: RtpOpusPacket =
      DiscordVoiceReceiver.parseRtpPacket(rawPacket);

    expect(parsed.version).toBe(2);
    expect(parsed.payloadType).toBe(120);
    expect(parsed.sequenceNumber).toBe(42);
    expect(parsed.timestamp).toBe(96000);
    expect(parsed.ssrc).toBe(0x12345678);
    expect(parsed.opusPayload.length).toBe(100);
  });

  it("receives sequential RTP packets without frame loss (0 drops)", () => {
    const totalFrames = 50;
    for (let i = 0; i < totalFrames; i++) {
      const packet = createSyntheticRtpPacket(i, i * 960, 60);
      receiver.ingestUdpPacket(packet);
    }

    const stats = receiver.getStreamStats();
    expect(stats.receivedPackets).toBe(totalFrames);
    expect(stats.droppedPackets).toBe(0);
    expect(stats.totalBytesReceived).toBe(totalFrames * 60);
  });

  it("detects sequence gaps if UDP packets arrive out of order or dropped", () => {
    // Send packets 0, 1, then skip 2, and send 3
    receiver.ingestUdpPacket(createSyntheticRtpPacket(0, 0));
    receiver.ingestUdpPacket(createSyntheticRtpPacket(1, 960));
    receiver.ingestUdpPacket(createSyntheticRtpPacket(3, 2880)); // Gap of 1 packet

    const stats = receiver.getStreamStats();
    expect(stats.droppedPackets).toBe(1);
    expect(stats.receivedPackets).toBe(3);
  });

  it("exports continuous audio buffer for Faster-Whisper pipeline", () => {
    for (let i = 0; i < 10; i++) {
      receiver.ingestUdpPacket(createSyntheticRtpPacket(i, i * 960, 80));
    }

    const audioStream = receiver.exportAudioBuffer();
    expect(audioStream.length).toBe(800); // 10 * 80 bytes
  });
});
