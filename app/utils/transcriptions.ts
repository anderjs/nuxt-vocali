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
  failed: "error",
  pending: "processing",
  completed: "completed",
  processing: "processing",
};

export function mapApiTranscriptionToListItem(
  transcription: ApiTranscription,
): TranscriptionListItem {
  return {
    type: "file",
    id: transcription.id,
    name: transcription.fileName,
    createdAt: transcription.createdAt,
    status: TRANSCRIPTION_STATUS_MAP[transcription.status],
  };
}
