import { z } from "zod";
import {
  MAX_AUDIO_UPLOAD_SIZE_BYTES,
  SUPPORTED_AUDIO_CONTENT_TYPES,
  hasSupportedAudioExtension,
  isSupportedAudioFile,
} from "../utils/storage";

export const transcriptionTypeSchema = z.enum(["file", "realtime"]);

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
  s3Key: z.string().min(1),
  contentType: z.enum(SUPPORTED_AUDIO_CONTENT_TYPES),
  fileSize: z.number().int().positive().max(MAX_AUDIO_UPLOAD_SIZE_BYTES),
  type: transcriptionTypeSchema,
  status: transcriptionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  language: z.string().min(2).optional(),
  durationSeconds: z.number().nonnegative().optional(),
  text: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const createUploadUrlRequestSchema = z
  .object({
    fileName: z.string().min(1).refine(hasSupportedAudioExtension),
    contentType: z.enum(SUPPORTED_AUDIO_CONTENT_TYPES),
    fileSize: z
      .number()
      .int()
      .positive()
      .max(MAX_AUDIO_UPLOAD_SIZE_BYTES),
  })
  .refine(
    ({ contentType, fileName }) =>
      isSupportedAudioFile(fileName, contentType),
  );

export const createUploadUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  objectKey: z.string().min(1),
});

export const createTranscriptionRequestSchema = z
  .object({
    s3Key: z.string().min(1),
    fileName: z.string().min(1).refine(hasSupportedAudioExtension),
    contentType: z.enum(SUPPORTED_AUDIO_CONTENT_TYPES),
    fileSize: z
      .number()
      .int()
      .positive()
      .max(MAX_AUDIO_UPLOAD_SIZE_BYTES),
    type: z.literal("file"),
    language: z.string().min(2).optional(),
  })
  .refine(
    ({ contentType, fileName }) =>
      isSupportedAudioFile(fileName, contentType),
  );

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
export type TranscriptionType = z.infer<typeof transcriptionTypeSchema>;
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
