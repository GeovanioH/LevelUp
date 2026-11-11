/**
 * LevelUp Deerflow AI Scraper & Opportunity Normalizer
 * Monitors high-impact scholarships, grants & hackathons (Campus France, Devpost, MLH, Google Alerts)
 * Reference: docs/09-ROADMAP.md Section 21.6 & docs/08-IMPLEMENTATION_PLAN.md Tâche 5.3
 */

import { z } from "zod";

export const OpportunitySourceEnum = z.enum([
  "DEVPOST",
  "MLH",
  "CAMPUS_FRANCE",
  "GOOGLE_ALERTS",
]);

export type OpportunitySource = z.infer<typeof OpportunitySourceEnum>;

/**
 * Checks if scholarship/grant/prize amount is >= 5,000 EUR/USD/GBP
 */
export function isAmountHighValue(amount: string): boolean {
  const digits = amount.replace(/[^0-9]/g, "");
  const parsed = parseInt(digits, 10);
  if (isNaN(parsed)) {
    // If full scholarship ("Plein financement"), treat as high value
    return (
      amount.toLowerCase().includes("plein") ||
      amount.toLowerCase().includes("financement")
    );
  }
  return parsed >= 5000;
}

export const OpportunitySchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(3),
    source: OpportunitySourceEnum,
    amount: z.string().min(1),
    deadline: z.string().min(4),
    eligibilityCriteria: z.array(z.string()).default([]),
    url: z.string().url(),
    isHighValue: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    isHighValue: data.isHighValue ?? isAmountHighValue(data.amount),
  }));

export type Opportunity = z.infer<typeof OpportunitySchema>;

export class DeerflowScraper {
  /**
   * Normalizes and validates raw scraped items conforming strictly to Zod schema
   */
  public normalizeOpportunities(rawItems: unknown[]): Opportunity[] {
    const validOpportunities: Opportunity[] = [];

    for (const item of rawItems) {
      const parseResult = OpportunitySchema.safeParse(item);
      if (parseResult.success) {
        validOpportunities.push(parseResult.data);
      }
    }

    return validOpportunities;
  }

  /**
   * Ingests RSS or API feed data (mock/production adapter)
   */
  public async scrapeAllSources(): Promise<Opportunity[]> {
    // In production, launches Playwright headless worker
    return [];
  }
}
