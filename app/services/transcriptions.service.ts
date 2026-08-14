import { API_QUERY_PARAM } from "~/utils/path";
import {
  EMPTY_TRANSCRIPTION_PAGE,
  mapApiTranscriptionToListItem,
} from "~/utils/transcriptions";
import {
  createRealtimeTranscriptionRequestSchema,
  createTranscriptionResponseSchema,
  downloadTranscriptionResponseSchema,
  listTranscriptionsResponseSchema,
  type CreatedTranscription,
  type TranscriptionDetail,
  getTranscriptionResponseSchema,
} from "~/schemas/transcription.schema";

import type {
  ApiClient,
  ListTranscriptionsParams,
  RealtimeTranscriptionPersistenceInput,
} from "~/common/types";
import type { TranscriptionPage } from "~/types/transcription";

/** Fetches and maps one page of transcription history. */
export async function listTranscriptions(
  api: ApiClient,
  params: ListTranscriptionsParams,
): Promise<TranscriptionPage> {
  const response = await api.request<unknown>("/transcriptions", {
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

/** Persists the final text produced by an already completed realtime session. */
export async function createRealtimeTranscription(
  api: ApiClient,
  input: RealtimeTranscriptionPersistenceInput,
): Promise<CreatedTranscription> {
  const payload = createRealtimeTranscriptionRequestSchema.parse({
    ...input,
    type: "realtime",
  });
  const response = await api.request<unknown>("/transcriptions", {
    body: payload,
    method: "POST",
    responseType: "json",
  });

  return createTranscriptionResponseSchema.parse(response).transcription;
}

/** Retrieves the short-lived browser download URL for a completed transcription. */
export async function getTranscriptionDownloadUrl(
  api: ApiClient,
  id: string,
): Promise<string> {
  const response = await api.request<unknown>(`/transcriptions/${id}/download`, {
    responseType: "json",
  });

  return downloadTranscriptionResponseSchema.parse(response).downloadUrl;
}

/** Fetches one owned transcription without exposing storage metadata. */
export async function getTranscription(
  api: ApiClient,
  id: string,
): Promise<TranscriptionDetail> {
  const response = await api.request<unknown>(`/transcriptions/${id}`, {
    responseType: "json",
  });

  return getTranscriptionResponseSchema.parse(response).transcription;
}
