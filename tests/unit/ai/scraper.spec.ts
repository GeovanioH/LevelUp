import { describe, it, expect } from "vitest";
import {
  DeerflowScraper,
  OpportunitySchema,
  type Opportunity,
} from "../../../services/deerflow/scraper";

describe("Deerflow AI Opportunity & Scholarship Scraper", () => {
  const sampleRawItems = [
    {
      id: "opp-01",
      title: "Bourse d'Excellence Eiffel Master IA",
      source: "CAMPUS_FRANCE",
      amount: "14 400 €",
      deadline: "2027-01-10",
      eligibilityCriteria: [
        "Master 2",
        "Excellence académique",
        "Moins de 25 ans",
      ],
      url: "https://www.campusfrance.org/fr/eiffel",
    },
    {
      id: "opp-02",
      title: "Hackathon International AI for Science MIT",
      source: "DEVPOST",
      amount: "50 000 $",
      deadline: "2026-12-15",
      eligibilityCriteria: ["Étudiants en IA", "Projet open-source"],
      url: "https://mit-ai-science.devpost.com",
    },
    {
      id: "opp-03",
      title: "Bourse de Recherche DeepMind Fellowship",
      source: "GOOGLE_ALERTS",
      amount: "25 000 £",
      deadline: "2027-03-01",
      eligibilityCriteria: ["Thèse ou Master recherche IA"],
      url: "https://deepmind.google/fellowships",
    },
    {
      id: "opp-04",
      title: "Hackathon Cyber Défense ANSSI",
      source: "MLH",
      amount: "10 000 €",
      deadline: "2026-11-30",
      eligibilityCriteria: ["Nationalité européenne", "Reverse engineering"],
      url: "https://cyber-anssi.devpost.com",
    },
    {
      id: "opp-05",
      title: "Prix de la Fondation Bleustein-Blanchet",
      source: "CAMPUS_FRANCE",
      amount: "10 000 €",
      deadline: "2027-04-15",
      eligibilityCriteria: ["Projet vocationnel d'excellence", "18-28 ans"],
      url: "https://fondation-vocation.org",
    },
    {
      id: "opp-06",
      title: "Bourse Jean d'Alembert Paris-Saclay",
      source: "CAMPUS_FRANCE",
      amount: "18 000 €",
      deadline: "2027-02-28",
      eligibilityCriteria: ["Mobilité internationale d'élite"],
      url: "https://universite-paris-saclay.fr/bourses",
    },
    {
      id: "opp-07",
      title: "Global Hackathon Gemini Multi-Modal Sprint",
      source: "DEVPOST",
      amount: "100 000 $",
      deadline: "2026-12-20",
      eligibilityCriteria: ["API Google GenAI", "Prototype fonctionnel"],
      url: "https://gemini-sprint.devpost.com",
    },
    {
      id: "opp-08",
      title: "Bourse de la Chaire d'Intelligence Artificielle",
      source: "GOOGLE_ALERTS",
      amount: "6 000 €",
      deadline: "2027-05-30",
      eligibilityCriteria: ["Étudiants M2 informatique"],
      url: "https://chaire-ia.org/bourses",
    },
    {
      id: "opp-09",
      title: "Hackathon Cryptographie Post-Quantique",
      source: "MLH",
      amount: "8 000 €",
      deadline: "2027-01-25",
      eligibilityCriteria: ["NIST PQC standards", "Rust / C++"],
      url: "https://pqc-hackathon.devpost.com",
    },
    {
      id: "opp-10",
      title: "Bourse d'Initiative Étudiante Régionale",
      source: "CAMPUS_FRANCE",
      amount: "5 000 €",
      deadline: "2027-03-31",
      eligibilityCriteria: ["Projet technologique à fort impact"],
      url: "https://aides-etudiants.region.fr",
    },
  ];

  it("validates a single opportunity conforming to strict Zod schema", () => {
    const parsed = OpportunitySchema.parse(sampleRawItems[0]);
    expect(parsed.title).toBe("Bourse d'Excellence Eiffel Master IA");
    expect(parsed.source).toBe("CAMPUS_FRANCE");
    expect(parsed.isHighValue).toBe(true); // >= 5000 €
  });

  it("normalizes exactly 10 sample opportunities with 100% schema compliance", () => {
    const scraper = new DeerflowScraper();
    const opportunities = scraper.normalizeOpportunities(sampleRawItems);

    expect(opportunities).toHaveLength(10);
    for (const opp of opportunities) {
      expect(opp.id).toBeDefined();
      expect(opp.title).toBeDefined();
      expect(opp.amount).toBeDefined();
      expect(opp.deadline).toBeDefined();
      expect(opp.url.startsWith("https://")).toBe(true);
      expect(opp.isHighValue).toBe(true);
    }
  });

  it("filters out invalid or incomplete items rejecting invalid URLs or missing fields", () => {
    const corruptItems = [
      { id: "corrupt-1", title: "Incomplet" }, // Missing amount, url, deadline
      {
        id: "corrupt-2",
        title: "URL Invalide",
        url: "not-a-url",
        amount: "1000 €",
        deadline: "2026-12-01",
        source: "DEVPOST",
        eligibilityCriteria: [],
      },
    ];

    const scraper = new DeerflowScraper();
    const result = scraper.normalizeOpportunities(corruptItems);
    expect(result).toHaveLength(0);
  });
});
