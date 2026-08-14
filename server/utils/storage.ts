import { randomUUID } from "node:crypto";

const UNSAFE_FILE_NAME_CHARACTER_PATTERN = /[^a-zA-Z0-9._-]/g;

export const MAX_AUDIO_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const SUPPORTED_AUDIO_CONTENT_TYPES = [
  "audio/ogg",
  "audio/aac",
  "audio/m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/wave",
  "audio/x-aac",
  "audio/x-m4a",
  "audio/x-wav",
  "audio/x-flac",
  "audio/vnd.wave",
  "application/ogg",
] as const;

const AUDIO_CONTENT_TYPES_BY_EXTENSION: Record<string, readonly string[]> = {
  ".mp3": ["audio/mpeg", "audio/mp3"],
  ".aac": ["audio/aac", "audio/x-aac"],
  ".ogg": ["audio/ogg", "application/ogg"],
  ".flac": ["audio/flac", "audio/x-flac"],
  ".m4a": ["audio/mp4", "audio/m4a", "audio/x-m4a"],
  ".wav": ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
};

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(UNSAFE_FILE_NAME_CHARACTER_PATTERN, "_");
}

export function createUploadObjectKey(
  userId: string,
  fileName: string,
): string {
  return `uploads/${userId}/${randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function isUploadObjectKeyOwnedByUser(
  objectKey: string,
  userId: string,
): boolean {
  return objectKey.startsWith(`uploads/${userId}/`);
}

export function hasSupportedAudioExtension(fileName: string): boolean {
  return getAudioContentTypes(fileName) !== undefined;
}

export function isSupportedAudioFile(
  fileName: string,
  contentType: string,
): boolean {
  return (
    getAudioContentTypes(fileName)?.includes(contentType.toLowerCase()) ?? false
  );
}

function getAudioContentTypes(fileName: string): readonly string[] | undefined {
  const extensionStart = fileName.lastIndexOf(".");

  const extension =
    extensionStart >= 0 ? fileName.slice(extensionStart).toLowerCase() : "";

  return AUDIO_CONTENT_TYPES_BY_EXTENSION[extension];
}
