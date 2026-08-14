import type { ApiClient, UploadProgressHandler } from "~/common/types";
import {
  createUploadUrlRequestSchema,
  createUploadUrlResponseSchema,
  type CreateUploadUrlResponse,
} from "~/schemas/upload.schema";
import {
  createTranscriptionRequestSchema,
  createTranscriptionResponseSchema,
  type CreatedTranscription,
} from "~/schemas/transcription.schema";
import { getAudioFileContentType } from "~/utils/files";

export async function createUploadUrl(
  api: ApiClient,
  file: File,
): Promise<CreateUploadUrlResponse> {
  const payload = createUploadUrlRequestSchema.parse({
    contentType: getAudioFileContentType(file),
    fileName: file.name,
    fileSize: file.size,
  });

  const response = await api.request<unknown>("/upload-url", {
    body: payload,
    method: "POST",
    responseType: "json",
  });

  return createUploadUrlResponseSchema.parse(response);
}

export async function uploadFileToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: UploadProgressHandler,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", getAudioFileContentType(file));

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error("S3 upload failed"));
    });

    request.addEventListener("error", () => {
      reject(new Error("S3 upload failed"));
    });

    request.addEventListener("abort", () => {
      reject(new Error("S3 upload aborted"));
    });

    request.send(file);
  });
}

export async function createFileTranscription(
  api: ApiClient,
  file: File,
  s3Key: string,
): Promise<CreatedTranscription> {
  const payload = createTranscriptionRequestSchema.parse({
    contentType: getAudioFileContentType(file),
    fileName: file.name,
    fileSize: file.size,
    s3Key,
    type: "file",
  });

  const response = await api.request<unknown>("/transcriptions", {
    body: payload,
    method: "POST",
    responseType: "json",
  });

  return createTranscriptionResponseSchema.parse(response).transcription;
}
