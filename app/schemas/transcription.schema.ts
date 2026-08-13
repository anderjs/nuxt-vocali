import { z } from "zod";

export const apiTranscriptionStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const apiTranscriptionSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  status: apiTranscriptionStatusSchema,
  createdAt: z.string().min(1),
});

export const listTranscriptionsResponseSchema = z.object({
  data: z.array(apiTranscriptionSchema),
  nextCursor: z.string().nullable().optional(),
});

export type ApiTranscriptionStatus = z.infer<
  typeof apiTranscriptionStatusSchema
>;
export type ApiTranscription = z.infer<typeof apiTranscriptionSchema>;
export type ListTranscriptionsResponse = z.infer<
  typeof listTranscriptionsResponseSchema
>;
