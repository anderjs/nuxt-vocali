import { MAX_AUDIO_UPLOAD_SIZE_BYTES } from "~/utils/constants";

export const AUDIO_FILE_ACCEPT = [
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".flac",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
].join(",");

export const SUPPORTED_AUDIO_MIME_TYPES = [
  "application/ogg",
  "audio/aac",
  "audio/flac",
  "audio/m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/vnd.wave",
  "audio/wav",
  "audio/wave",
  "audio/x-aac",
  "audio/x-flac",
  "audio/x-m4a",
  "audio/x-wav",
] as const;

const AUDIO_CONTENT_TYPES_BY_EXTENSION: Record<string, readonly string[]> = {
  ".aac": ["audio/aac", "audio/x-aac"],
  ".flac": ["audio/flac", "audio/x-flac"],
  ".m4a": ["audio/mp4", "audio/m4a", "audio/x-m4a"],
  ".mp3": ["audio/mpeg", "audio/mp3"],
  ".ogg": ["audio/ogg", "application/ogg"],
  ".wav": ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
};

export function getFirstInputFile(event: Event): File | null {
  const input = event.target;

  if (!(input instanceof HTMLInputElement)) {
    return null;
  }

  return input.files?.item(0) ?? null;
}

export function clearInputFile(event: Event): void {
  const input = event.target;

  if (input instanceof HTMLInputElement) {
    input.value = "";
  }
}

export function hasSupportedAudioExtension(fileName: string): boolean {
  return getAudioFileContentTypes(fileName) !== undefined;
}

export function getAudioFileValidationError(file: File): string | null {
  if (file.size === 0) {
    return "El archivo está vacío.";
  }

  if (file.size > MAX_AUDIO_UPLOAD_SIZE_BYTES) {
    return "El archivo no puede superar los 20 MB.";
  }

  const supportedContentTypes = getAudioFileContentTypes(file.name);
  const contentType = file.type.toLowerCase();

  if (
    !supportedContentTypes ||
    (contentType && !supportedContentTypes.includes(contentType))
  ) {
    return "Selecciona un archivo MP3, WAV, M4A, AAC, OGG o FLAC.";
  }

  return null;
}

export function getAudioFileContentType(file: File): string {
  const supportedContentTypes = getAudioFileContentTypes(file.name);

  if (!supportedContentTypes) {
    throw new Error("Unsupported audio file");
  }

  return file.type.toLowerCase() || supportedContentTypes[0]!;
}

export function formatFileSize(sizeInBytes: number): string {
  const sizeInMegabytes = sizeInBytes / (1024 * 1024);

  return `${sizeInMegabytes.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} MB`;
}

function getAudioFileContentTypes(
  fileName: string,
): readonly string[] | undefined {
  const extensionStart = fileName.lastIndexOf(".");
  const extension =
    extensionStart >= 0 ? fileName.slice(extensionStart).toLowerCase() : "";

  return AUDIO_CONTENT_TYPES_BY_EXTENSION[extension];
}
