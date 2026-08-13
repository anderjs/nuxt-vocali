import { randomUUID } from "node:crypto";

const UNSAFE_FILE_NAME_CHARACTER_PATTERN = /[^a-zA-Z0-9._-]/g;

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(UNSAFE_FILE_NAME_CHARACTER_PATTERN, "_");
}

export function createUploadObjectKey(userId: string, fileName: string): string {
  return `uploads/${userId}/${randomUUID()}-${sanitizeFileName(fileName)}`;
}
