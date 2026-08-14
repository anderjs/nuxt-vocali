import type {
  ApiTranscription,
  ApiTranscriptionStatus,
} from "~/schemas/transcription.schema";
import type {
  TranscriptionListItem,
  TranscriptionPage,
  TranscriptionStatus,
} from "~/types/transcription";

export const EMPTY_TRANSCRIPTION_PAGE: TranscriptionPage = {
  items: [],
  nextCursor: null,
};

export const TRANSCRIPTION_STATUS_MAP: Record<
  ApiTranscriptionStatus,
  TranscriptionStatus
> = {
  failed: "failed",
  pending: "processing",
  completed: "completed",
  processing: "processing",
};

export const TRANSCRIPTION_TYPE_LABELS: Record<
  TranscriptionListItem["type"],
  string
> = {
  file: "Archivo",
  realtime: "En vivo",
};

export const TRANSCRIPTION_STATUS_CONFIG: Record<
  TranscriptionStatus,
  { label: string; color: "success" | "warning" | "error" }
> = {
  completed: { label: "Completada", color: "success" },
  processing: { label: "Procesando", color: "warning" },
  failed: { label: "Error", color: "error" },
};

export function mapApiTranscriptionToListItem(
  transcription: ApiTranscription,
): TranscriptionListItem {
  return {
    type: transcription.type,
    id: transcription.id,
    name: transcription.fileName,
    createdAt: transcription.createdAt,
    status: TRANSCRIPTION_STATUS_MAP[transcription.status],
  };
}

export function containsProcessingTranscription(
  transcriptions: TranscriptionListItem[],
): boolean {
  return transcriptions.some(({ status }) => status === "processing");
}
