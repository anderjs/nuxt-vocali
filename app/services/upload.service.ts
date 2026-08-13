import type { ApiClient } from "~/common/types";
import {
  createUploadUrlRequestSchema,
  createUploadUrlResponseSchema,
  type CreateUploadUrlResponse,
} from "~/schemas/upload.schema";

export async function createUploadUrl(
  api: ApiClient,
  file: File,
): Promise<CreateUploadUrlResponse> {
  const payload = createUploadUrlRequestSchema.parse({
    contentType: file.type,
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
): Promise<void> {
  const response = await fetch(uploadUrl, {
    body: file,
    headers: {
      "Content-Type": file.type,
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("S3 upload failed");
  }
}
