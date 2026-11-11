import Dexie, { type Table } from "dexie";

export interface LocalPlayer {
  id: string;
  username: string;
  level: number;
  totalXp: number;
  rankCode: string;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  shadowCrystals: number;
  lastSyncAt: Date;
}

export interface LocalStat {
  id: string;
  playerId: string;
  baseCode: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
}

export interface LocalQuest {
  id: string;
  title: string;
  baseCode: string;
  xpReward: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED" | "EXPIRED";
  isOfflineCreated: boolean;
  createdAt: Date;
  completedAt?: Date;
  proofData?: string;
}

export interface LocalSkillNode {
  id: string;
  nodeCode: string;
  baseCode: string;
  name: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export class LevelUpDexieDatabase extends Dexie {
  public players!: Table<LocalPlayer, string>;
  public stats!: Table<LocalStat, string>;
  public quests!: Table<LocalQuest, string>;
  public skills!: Table<LocalSkillNode, string>;

  constructor(databaseName = "LevelUpLocalFirstDB") {
    super(databaseName);

    this.version(1).stores({
      players: "id, username, rankCode, level",
      stats: "id, playerId, baseCode",
      quests: "id, status, baseCode, createdAt, isOfflineCreated",
      skills: "id, nodeCode, baseCode, isUnlocked",
    });
  }
}

export const levelupDb = new LevelUpDexieDatabase();
