import { z } from "zod";
import { officialStatuses, opportunityTypes, regions, rewardTypes, suggestions } from "./enums";

const scoreSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const difficultySchema = scoreSchema;

export const ActivityOpportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  vendor: z.string().min(1),
  type: z.enum(opportunityTypes),
  score: scoreSchema,
  difficulty: difficultySchema.nullable(),
  difficultyNote: z.string().nullable(),
  rewardSummary: z.string().nullable(),
  rewardDetail: z.string().nullable(),
  rewardTypes: z.array(z.enum(rewardTypes)),
  format: z.string().nullable(),
  participation: z.string().nullable(),
  winningCriteria: z.string().nullable(),
  timelineNotes: z.string().nullable(),
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
  region: z.enum(regions),
  officialStatus: z.enum(officialStatuses),
  registrationUrl: z.string().url(),
  sourceChannel: z.string().nullable(),
  estimatedEffort: z.string().nullable(),
  suggestion: z.enum(suggestions).nullable(),
  discoveredAt: z.string().nullable(),
  slug: z.string().nullable(),
});

export type ActivityOpportunity = z.infer<typeof ActivityOpportunitySchema>;

export const SnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string(),
  recordCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  opportunities: z.array(ActivityOpportunitySchema),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;
