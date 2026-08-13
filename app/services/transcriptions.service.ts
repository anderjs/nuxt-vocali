import { API_PATH } from "~/utils/path";
import {
  EMPTY_TRANSCRIPTION_PAGE,
  mapApiTranscriptionToListItem,
} from "~/utils/transcriptions";
import { listTranscriptionsResponseSchema } from "~/schemas/transcription.schema";

import type { ApiClient } from "~/common/types";
import type { TranscriptionPage } from "~/types/transcription";

/**
 * @description
 * Fetch transcription and parsed directly.
 */
export async function listTranscriptions(
  api: ApiClient,
): Promise<TranscriptionPage> {
  const response = await api.request<unknown>(API_PATH.TRANSCRIPTIONS, {
    responseType: "json",
  });
  const parsedResponse = listTranscriptionsResponseSchema.parse(response);

  if (parsedResponse.data.length === 0) {
    return EMPTY_TRANSCRIPTION_PAGE;
  }

  return {
    items: parsedResponse.data.map(mapApiTranscriptionToListItem),
    nextCursor: parsedResponse.nextCursor ?? null,
  };
}
