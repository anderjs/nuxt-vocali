import { z } from "zod";
import { MAX_AUDIO_UPLOAD_SIZE_BYTES } from "~/utils/constants";

export const createUploadUrlRequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().int().positive().max(MAX_AUDIO_UPLOAD_SIZE_BYTES),
});

export const createUploadUrlResponseSchema = z.object({
  uploadUrl: z.url(),
  objectKey: z.string().min(1),
});

export type CreateUploadUrlRequest = z.infer<
  typeof createUploadUrlRequestSchema
>;
export type CreateUploadUrlResponse = z.infer<
  typeof createUploadUrlResponseSchema
>;
