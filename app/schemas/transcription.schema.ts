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
  createdAt: z.string().min(1),
});

export const createdTranscriptionSchema = apiTranscriptionSchema.extend({
  s3Key: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().int().positive(),
  type: z.literal("file"),
});

export const createTranscriptionRequestSchema =
  createUploadUrlRequestSchema.extend({
    s3Key: z.string().min(1),
    type: z.literal("file"),
  });

export const createTranscriptionResponseSchema = z.object({
  transcription: createdTranscriptionSchema,
});

export const listTranscriptionsResponseSchema = z.object({
  data: z.array(apiTranscriptionSchema),
  nextCursor: z.string().nullable().optional(),
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
export type ListTranscriptionsResponse = z.infer<
  typeof listTranscriptionsResponseSchema
>;
