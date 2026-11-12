import { describe, it, expect } from "vitest";
import {
  handleMcpCall,
  LEVELUP_MCP_TOOLS,
} from "../../../services/mcp/levelupMcpServer";

describe("LevelUp MCP Server", () => {
  it("exposes the 5 canonical LevelUp MCP tools", () => {
    expect(LEVELUP_MCP_TOOLS).toHaveLength(5);
    const names = LEVELUP_MCP_TOOLS.map((t) => t.name);
    expect(names).toContain("get_player_status");
    expect(names).toContain("get_daily_quests");
    expect(names).toContain("submit_quest_proof");
    expect(names).toContain("grade_oral_monologue");
    expect(names).toContain("get_timeblocking_schedule");
  });

  it("handles get_player_status tool execution", async () => {
    const res = await handleMcpCall("get_player_status", {});
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.username).toBe("Huriel");
    expect(data.harmonicScore).toBeDefined();
    expect(data.level).toBe(14);
  });

  it("handles submit_quest_proof tool execution", async () => {
    const res = await handleMcpCall("submit_quest_proof", {
      questId: "q-123",
      proofUrl: "https://github.com/GeovanioH/LevelUp/commit/abc",
    });
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.status).toBe("COMPLETED");
    expect(data.questId).toBe("q-123");
  });

  it("handles grade_oral_monologue tool execution", async () => {
    const res = await handleMcpCall("grade_oral_monologue", {
      transcript:
        "Démonstration rigoureuse de la descente de gradient avec matrice jacobienne et tenseur d'attention softmax pour minimiser la loss et la latence asynchrone dans les architectures de Transformers avec une normalisation par couche optimisée pour réduire la variance et accélérer la convergence globale du réseau de neurones en production.",
      subject: "AI_ENG",
    });
    expect(res.isError).toBeFalsy();
    const data = JSON.parse(res.content[0].text);
    expect(data.score).toBeGreaterThanOrEqual(14);
    expect(data.isPassing).toBe(true);
  });
});
