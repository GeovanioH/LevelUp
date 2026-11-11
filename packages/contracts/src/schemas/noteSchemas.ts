import { z } from "zod";

export const BaseStatCodeEnum = z.enum([
  "ACAD",
  "AI_ENG",
  "CYBER",
  "EXP",
  "LNG",
  "FIN",
  "STR",
  "DIS",
]);

export const NoteFrontmatterSchema = z.object({
  title: z.string().min(1, "Le titre de la note est obligatoire."),
  base: BaseStatCodeEnum,
  tags: z.array(z.string()).default([]),
  created_at: z.string().optional(),
  author: z.string().optional(),
});

export const SecondBrainNoteSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  base: BaseStatCodeEnum,
  tags: z.array(z.string()),
  frontmatter: NoteFrontmatterSchema,
  body: z.string(),
  sanitizedHtml: z.string().optional(),
  wikilinks: z.array(z.string()).default([]),
  easeFactor: z.number().min(1.3).default(2.5),
  interval: z.number().int().min(1).default(1),
  repetition: z.number().int().min(0).default(0),
  nextReviewDate: z.date().optional(),
});

export type NoteFrontmatter = z.infer<typeof NoteFrontmatterSchema>;
export type SecondBrainNote = z.infer<typeof SecondBrainNoteSchema>;
