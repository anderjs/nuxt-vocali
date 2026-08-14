import type { ApiClient } from "~/common/types";
import {
  realtimeCredentialSchema,
  type RealtimeCredential,
} from "~/schemas/realtime.schema";

export async function getRealtimeCredential(
  api: ApiClient,
): Promise<RealtimeCredential> {
  const response = await api.request<unknown>("/realtime/token", {
    method: "POST",
    responseType: "json",
  });

  return realtimeCredentialSchema.parse(response);
}
