import type { ApiClient } from "~/composables/useApi";
import { listTranscriptionsResponseSchema } from "~/schemas/transcription.schema";
import type { TranscriptionPage } from "~/types/transcription";
import { API_PATH } from "~/utils/path";
import { mapApiTranscriptionToListItem } from "~/utils/transcriptions";

export async function listTranscriptions(
  api: ApiClient,
): Promise<TranscriptionPage> {
  const response = await api.request(API_PATH.TRANSCRIPTIONS);
  const parsedResponse = listTranscriptionsResponseSchema.parse(response);

  return {
    items: parsedResponse.data.map(mapApiTranscriptionToListItem),
    nextCursor: parsedResponse.nextCursor ?? null,
  };
}
