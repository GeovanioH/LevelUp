/**
 * LevelUp Discord Voice UDP Streaming & RTP/Opus Audio Receiver
 * Ingests audio packets directly from Discord voice channels without frame drops
 * Reference: docs/02-TRD.md Section 2.2 & docs/09-ROADMAP.md Section 21.5
 */

export interface RtpOpusPacket {
  version: number;
  payloadType: number;
  sequenceNumber: number;
  timestamp: number;
  ssrc: number;
  opusPayload: Buffer;
}

export interface DiscordVoiceReceiverOptions {
  sampleRate?: number | undefined;
  channels?: number | undefined;
}

export interface StreamStats {
  receivedPackets: number;
  droppedPackets: number;
  totalBytesReceived: number;
}

export class DiscordVoiceReceiver {
  public readonly sampleRate: number;
  public readonly channels: number;

  private receivedPackets: number = 0;
  private droppedPackets: number = 0;
  private totalBytesReceived: number = 0;
  private lastSequenceNumber: number | null = null;
  private audioChunks: Buffer[] = [];

  constructor(options: DiscordVoiceReceiverOptions = {}) {
    this.sampleRate = options.sampleRate ?? 48000;
    this.channels = options.channels ?? 2;
  }

  /**
   * Parses standard 12-byte RTP header and extracts Opus payload
   */
  public static parseRtpPacket(buffer: Buffer): RtpOpusPacket {
    if (buffer.length < 12) {
      throw new Error(
        `Paquet RTP invalide : longueur ${buffer.length} < 12 octets.`,
      );
    }

    const version = (buffer[0] >> 6) & 0x03;
    const payloadType = buffer[1] & 0x7f;
    const sequenceNumber = buffer.readUInt16BE(2);
    const timestamp = buffer.readUInt32BE(4);
    const ssrc = buffer.readUInt32BE(8);

    const opusPayload = buffer.subarray(12);

    return {
      version,
      payloadType,
      sequenceNumber,
      timestamp,
      ssrc,
      opusPayload,
    };
  }

  /**
   * Ingests a raw UDP packet received from Discord Voice Gateway
   */
  public ingestUdpPacket(rawPacket: Buffer): void {
    const rtp = DiscordVoiceReceiver.parseRtpPacket(rawPacket);

    // Sequence continuity check
    if (this.lastSequenceNumber !== null) {
      const expected = (this.lastSequenceNumber + 1) & 0xffff;
      if (rtp.sequenceNumber !== expected) {
        const gap = (rtp.sequenceNumber - expected + 65536) & 0xffff;
        this.droppedPackets += gap;
      }
    }

    this.lastSequenceNumber = rtp.sequenceNumber;
    this.receivedPackets++;
    this.totalBytesReceived += rtp.opusPayload.length;
    this.audioChunks.push(rtp.opusPayload);
  }

  public getStreamStats(): StreamStats {
    return {
      receivedPackets: this.receivedPackets,
      droppedPackets: this.droppedPackets,
      totalBytesReceived: this.totalBytesReceived,
    };
  }

  /**
   * Concatenates all received audio chunks into a single Buffer
   */
  public exportAudioBuffer(): Buffer {
    return Buffer.concat(this.audioChunks);
  }

  public reset(): void {
    this.receivedPackets = 0;
    this.droppedPackets = 0;
    this.totalBytesReceived = 0;
    this.lastSequenceNumber = null;
    this.audioChunks = [];
  }
}
