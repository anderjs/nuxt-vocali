import { z } from "zod";

export const transcriptionStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const transcriptionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  fileName: z.string().min(1),
  status: transcriptionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  language: z.string().min(2).optional(),
  durationSeconds: z.number().nonnegative().optional(),
  text: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const createUploadUrlRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

export const createUploadUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  objectKey: z.string().min(1),
});

export const createTranscriptionRequestSchema = z.object({
  objectKey: z.string().min(1),
  fileName: z.string().min(1),
  language: z.string().min(2).optional(),
});

export const createTranscriptionResponseSchema = z.object({
  transcription: transcriptionSchema,
});

export const listTranscriptionsQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(10).default(10),
});

export const listTranscriptionsResponseSchema = z.object({
  data: z.array(transcriptionSchema),
  nextCursor: z.string().nullable(),
});

export const transcriptionIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const getTranscriptionResponseSchema = z.object({
  transcription: transcriptionSchema,
});

export const downloadTranscriptionResponseSchema = z.object({
  downloadUrl: z.url(),
});

export const errorResponseSchema = z.object({
  message: z.string().min(1),
});

export type TranscriptionStatus = z.infer<typeof transcriptionStatusSchema>;
export type Transcription = z.infer<typeof transcriptionSchema>;

export type CreateUploadUrlRequestDto = z.infer<
  typeof createUploadUrlRequestSchema
>;
export type CreateUploadUrlResponseDto = z.infer<
  typeof createUploadUrlResponseSchema
>;

export type CreateTranscriptionRequestDto = z.infer<
  typeof createTranscriptionRequestSchema
>;
export type CreateTranscriptionResponseDto = z.infer<
  typeof createTranscriptionResponseSchema
>;

export type ListTranscriptionsQueryDto = z.infer<
  typeof listTranscriptionsQuerySchema
>;

export type ListTranscriptionsResponseDto = z.infer<
  typeof listTranscriptionsResponseSchema
>;

export type TranscriptionIdParamsDto = z.infer<
  typeof transcriptionIdParamsSchema
>;

export type GetTranscriptionResponseDto = z.infer<
  typeof getTranscriptionResponseSchema
>;

export type DownloadTranscriptionResponseDto = z.infer<
  typeof downloadTranscriptionResponseSchema
>;

export type ErrorResponseDto = z.infer<typeof errorResponseSchema>;
