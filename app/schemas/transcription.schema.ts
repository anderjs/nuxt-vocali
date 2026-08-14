import { z } from "zod";
import { createUploadUrlRequestSchema } from "~/schemas/upload.schema";

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
  createdAt: z.string().datetime(),
  type: z.enum(["file", "realtime"]),
});

export const createdTranscriptionSchema = apiTranscriptionSchema.extend({
  s3Key: z.string().min(1).optional(),
  contentType: z.string().min(1).optional(),
  fileSize: z.number().int().positive().optional(),
  transcriptionS3Key: z.string().min(1).optional(),
});

export const createTranscriptionRequestSchema =
  createUploadUrlRequestSchema.extend({
    s3Key: z.string().min(1),
    type: z.literal("file"),
  });

export const createRealtimeTranscriptionRequestSchema = z
  .object({
    type: z.literal("realtime"),
    text: z.string().trim().min(1),
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime(),
  })
  .strict();

export const createTranscriptionResponseSchema = z.object({
  transcription: createdTranscriptionSchema,
});

export const listTranscriptionsResponseSchema = z.object({
  data: z.array(apiTranscriptionSchema),
  nextCursor: z.string().nullable().optional(),
});

export const downloadTranscriptionResponseSchema = z.object({
  downloadUrl: z.url(),
});

export type ApiTranscriptionStatus = z.infer<
  typeof apiTranscriptionStatusSchema
>;
export type ApiTranscription = z.infer<typeof apiTranscriptionSchema>;
export type CreatedTranscription = z.infer<typeof createdTranscriptionSchema>;
export type CreateTranscriptionRequest = z.infer<
  typeof createTranscriptionRequestSchema
>;
export type CreateTranscriptionResponse = z.infer<
  typeof createTranscriptionResponseSchema
>;
export type CreateRealtimeTranscriptionRequest = z.infer<
  typeof createRealtimeTranscriptionRequestSchema
>;
export type ListTranscriptionsResponse = z.infer<
  typeof listTranscriptionsResponseSchema
>;
export type DownloadTranscriptionResponse = z.infer<
  typeof downloadTranscriptionResponseSchema
>;

export const transcriptionDetailSchema = apiTranscriptionSchema.extend({
  durationSeconds: z.number().nonnegative().optional(),
  text: z.string().optional(),
});

export const getTranscriptionResponseSchema = z.object({
  transcription: transcriptionDetailSchema,
});

export type TranscriptionDetail = z.infer<typeof transcriptionDetailSchema>;
export type GetTranscriptionResponse = z.infer<
  typeof getTranscriptionResponseSchema
>;
