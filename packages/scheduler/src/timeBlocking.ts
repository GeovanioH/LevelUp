/**
 * LevelUp Circadian Time-Blocking Engine
 * Conflict Detection, Linear Optimization & Deep Work Dynamic Scheduling
 * Reference: docs/09-ROADMAP.md Section 21.5 & docs/08-IMPLEMENTATION_PLAN.md Tâche 4.1
 */

export enum TimeBlockType {
  SANCTUARY_SLEEP = "SANCTUARY_SLEEP",
  SANCTUARY_SPORT = "SANCTUARY_SPORT",
  UNIVERSITY = "UNIVERSITY",
  DEEP_WORK = "DEEP_WORK",
  SHALLOW_WORK = "SHALLOW_WORK",
  FREE_TIME = "FREE_TIME",
}

export interface TimeBlock {
  id: string;
  title: string;
  type: TimeBlockType;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  description?: string | undefined;
  isCompleted?: boolean | undefined;
}

export class InvalidTimeRangeException extends Error {
  constructor(
    message: string = "L'heure de fin doit être strictement supérieure à l'heure de début.",
  ) {
    super(message);
    this.name = "InvalidTimeRangeException";
  }
}

export class ConflictingScheduleException extends Error {
  constructor(
    message: string = "Conflit de créneau détecté : chevauchement avec un bloc existant.",
  ) {
    super(message);
    this.name = "ConflictingScheduleException";
  }
}

/**
 * Converts "HH:mm" string to minutes from start of day [0, 1440]
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(":");
  if (parts.length !== 2) {
    throw new InvalidTimeRangeException(`Format horaire invalide : ${time}`);
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 24 ||
    minutes < 0 ||
    minutes >= 60
  ) {
    throw new InvalidTimeRangeException(
      `Valeur horaire hors limites : ${time}`,
    );
  }

  return hours * 60 + minutes;
}

/**
 * Converts minutes from start of day [0, 1440] back to "HH:mm"
 */
export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(1440, totalMinutes));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export class TimeBlockingEngine {
  public readonly date: string; // "YYYY-MM-DD"
  private blocks: TimeBlock[] = [];

  constructor(date: string) {
    this.date = date;
    this.initializeSanctuaryDefaults();
  }

  /**
   * Initializes sovereign physiological sanctuarized blocks:
   * Sleep: 23:00 to 07:00 (represented as 00:00-07:00 and 23:00-24:00)
   */
  private initializeSanctuaryDefaults(): void {
    // Nocturnal Sleep Part 1: 00:00 to 07:00
    this.blocks.push({
      id: `sleep-morning-${this.date}`,
      title: "Sommeil Réparateur Circadien (Partie Matin)",
      type: TimeBlockType.SANCTUARY_SLEEP,
      startTime: "00:00",
      endTime: "07:00",
      description: "Récupération NREM/REM fondamentale non négociable",
    });

    // Nocturnal Sleep Part 2: 23:00 to 24:00
    this.blocks.push({
      id: `sleep-evening-${this.date}`,
      title: "Sommeil Réparateur Circadien (Partie Soir)",
      type: TimeBlockType.SANCTUARY_SLEEP,
      startTime: "23:00",
      endTime: "24:00",
      description: "Couvre-feu circadien souverain",
    });
  }

  public getBlocks(): readonly TimeBlock[] {
    return [...this.blocks].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );
  }

  /**
   * Checks if two time intervals overlap (strictly)
   */
  public static doIntervalsOverlap(
    s1: number,
    e1: number,
    s2: number,
    e2: number,
  ): boolean {
    return Math.max(s1, s2) < Math.min(e1, e2);
  }

  /**
   * Detects whether candidateBlock overlaps with any existing block
   */
  public detectOverlap(candidateBlock: TimeBlock): boolean {
    const candStart = timeToMinutes(candidateBlock.startTime);
    const candEnd = timeToMinutes(candidateBlock.endTime);

    for (const block of this.blocks) {
      if (block.id === candidateBlock.id) continue;
      const bStart = timeToMinutes(block.startTime);
      const bEnd = timeToMinutes(block.endTime);

      if (
        TimeBlockingEngine.doIntervalsOverlap(candStart, candEnd, bStart, bEnd)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Adds a new time block with strict validation and conflict detection
   */
  public addBlock(block: TimeBlock): void {
    const startMin = timeToMinutes(block.startTime);
    const endMin = timeToMinutes(block.endTime);

    if (endMin <= startMin) {
      throw new InvalidTimeRangeException(
        `Créneau invalide : l'heure de fin (${block.endTime}) doit être supérieure à l'heure de début (${block.startTime}).`,
      );
    }

    if (this.detectOverlap(block)) {
      throw new ConflictingScheduleException(
        `Conflit d'agenda détecté pour "${block.title}" (${block.startTime} - ${block.endTime}).`,
      );
    }

    this.blocks.push(block);
  }

  /**
   * Dynamically schedules a Deep Work block in the earliest suitable gap
   * @param title Title of the Deep Work session
   * @param durationMinutes Duration in minutes (e.g. 90)
   * @param earliestStart Earliest allowed start time (defaults to "07:00")
   * @param latestEnd Latest allowed end time (defaults to "23:00")
   */
  public scheduleDeepWorkSession(
    title: string,
    durationMinutes: number,
    earliestStart: string = "07:00",
    latestEnd: string = "23:00",
  ): TimeBlock {
    const minStart = timeToMinutes(earliestStart);
    const maxEnd = timeToMinutes(latestEnd);

    // Get sorted blocks between minStart and maxEnd
    const sorted = [...this.blocks]
      .filter(
        (b) =>
          timeToMinutes(b.endTime) > minStart &&
          timeToMinutes(b.startTime) < maxEnd,
      )
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    let cursor = minStart;

    for (const b of sorted) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      // Check gap before this block
      if (bStart - cursor >= durationMinutes) {
        const scheduledBlock: TimeBlock = {
          id: `deep-work-${Date.now()}`,
          title,
          type: TimeBlockType.DEEP_WORK,
          startTime: minutesToTime(cursor),
          endTime: minutesToTime(cursor + durationMinutes),
          description: "Session de concentration absolue sans distraction",
        };
        this.addBlock(scheduledBlock);
        return scheduledBlock;
      }

      cursor = Math.max(cursor, bEnd);
    }

    // Check gap after last block
    if (maxEnd - cursor >= durationMinutes) {
      const scheduledBlock: TimeBlock = {
        id: `deep-work-${Date.now()}`,
        title,
        type: TimeBlockType.DEEP_WORK,
        startTime: minutesToTime(cursor),
        endTime: minutesToTime(cursor + durationMinutes),
        description: "Session de concentration absolue sans distraction",
      };
      this.addBlock(scheduledBlock);
      return scheduledBlock;
    }

    throw new ConflictingScheduleException(
      `Impossible de planifier "${title}" : aucun créneau libre continu de ${durationMinutes} minutes disponible.`,
    );
  }
}
