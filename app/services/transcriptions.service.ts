import { API_PATH, API_QUERY_PARAM } from "~/utils/path";
import {
  EMPTY_TRANSCRIPTION_PAGE,
  mapApiTranscriptionToListItem,
} from "~/utils/transcriptions";
import { listTranscriptionsResponseSchema } from "~/schemas/transcription.schema";

import type { ApiClient, ListTranscriptionsParams } from "~/common/types";
import type { TranscriptionPage } from "~/types/transcription";

/**
 * @description
 * Fetch transcription and parsed directly.
 */
export async function listTranscriptions(
  api: ApiClient,
  params: ListTranscriptionsParams,
): Promise<TranscriptionPage> {
  const response = await api.request<unknown>(API_PATH.TRANSCRIPTIONS, {
    query: {
      [API_QUERY_PARAM.LIMIT]: params.limit,
      [API_QUERY_PARAM.CURSOR]: params.cursor,
    },
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
