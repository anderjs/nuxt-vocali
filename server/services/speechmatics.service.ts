import { config } from "../config";

const SPEECHMATICS_REALTIME_TEMPORARY_KEY_URL =
  "https://mp.speechmatics.com/v1/api_keys?type=rt";
const SPEECHMATICS_REALTIME_TEMPORARY_KEY_TTL_SECONDS = 60;
const SPEECHMATICS_BATCH_POLL_INTERVAL_MS = 5_000;
const SPEECHMATICS_BATCH_MAX_POLL_ATTEMPTS = 48;

interface SpeechmaticsTemporaryKeyResponse {
  key_value?: unknown;
}

interface SpeechmaticsBatchJob {
  id?: unknown;
  status?: unknown;
}

interface SpeechmaticsBatchJobResponse {
  id?: unknown;
  job?: SpeechmaticsBatchJob;
  jobs?: SpeechmaticsBatchJob[];
}

export interface RealtimeTemporaryCredential {
  token: string;
}

export interface TranscribeFileParams {
  sourceUrl: string;
  language: string;
}

export interface SpeechmaticsBatchClient {
  transcribeFile(params: TranscribeFileParams): Promise<string>;
}

function getSpeechmaticsApiKey(): string {
  const apiKey = config.speechmaticsApiKey;

  if (!apiKey) {
    throw new Error("Speechmatics API key is not configured");
  }

  return apiKey;
}

function getBatchJobUrl(path: string): string {
  return new URL(path, `${config.speechmaticsApiUrl}/`).toString();
}

function getBatchJob(response: SpeechmaticsBatchJobResponse): SpeechmaticsBatchJob | null {
  if (response.job) {
    return response.job;
  }

  if (response.jobs?.[0]) {
    return response.jobs[0];
  }

  return typeof response.id === "string" ? { id: response.id } : null;
}

async function getJsonResponse(response: Response): Promise<SpeechmaticsBatchJobResponse> {
  try {
    return (await response.json()) as SpeechmaticsBatchJobResponse;
  } catch {
    throw new Error("Speechmatics returned an invalid batch response");
  }
}

async function waitForBatchJob(jobId: string, apiKey: string): Promise<void> {
  for (let attempt = 0; attempt < SPEECHMATICS_BATCH_MAX_POLL_ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, SPEECHMATICS_BATCH_POLL_INTERVAL_MS));

    let response: Response;

    try {
      response = await fetch(getBatchJobUrl(`v2/jobs/${jobId}`), {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(config.speechmaticsApiTimeoutMs),
      });
    } catch {
      throw new Error("Unable to retrieve Speechmatics job status");
    }

    if (!response.ok) {
      throw new Error("Speechmatics job status request failed");
    }

    const job = getBatchJob(await getJsonResponse(response));
    const status = typeof job?.status === "string" ? job.status : null;

    if (status === "done") {
      return;
    }

    if (status === "rejected" || status === "failed") {
      throw new Error("Speechmatics rejected the transcription job");
    }
  }

  throw new Error("Speechmatics transcription timed out");
}

/** Calls the configured Speechmatics batch API using short-lived private S3 access. */
export class SpeechmaticsService implements SpeechmaticsBatchClient {
  async transcribeFile({ sourceUrl, language }: TranscribeFileParams): Promise<string> {
    const apiKey = getSpeechmaticsApiKey();
    const formData = new FormData();

    formData.set(
      "config",
      JSON.stringify({
        type: "transcription",
        transcription_config: { language },
        fetch_data: { url: sourceUrl },
      }),
    );

    let createResponse: Response;

    try {
      createResponse = await fetch(getBatchJobUrl("v2/jobs/"), {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
        signal: AbortSignal.timeout(config.speechmaticsApiTimeoutMs),
      });
    } catch {
      throw new Error("Unable to create Speechmatics transcription job");
    }

    if (!createResponse.ok) {
      throw new Error("Speechmatics transcription job request failed");
    }

    const createdJob = getBatchJob(await getJsonResponse(createResponse));

    if (typeof createdJob?.id !== "string" || !createdJob.id) {
      throw new Error("Speechmatics returned an invalid transcription job");
    }

    await waitForBatchJob(createdJob.id, apiKey);

    let transcriptResponse: Response;

    try {
      transcriptResponse = await fetch(
        getBatchJobUrl(`v2/jobs/${createdJob.id}/transcript?format=txt`),
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(config.speechmaticsApiTimeoutMs),
        },
      );
    } catch {
      throw new Error("Unable to retrieve Speechmatics transcript");
    }

    if (!transcriptResponse.ok) {
      throw new Error("Speechmatics transcript request failed");
    }

    return transcriptResponse.text();
  }
}

export async function createRealtimeTemporaryCredential(): Promise<RealtimeTemporaryCredential> {
  const permanentApiKey = getSpeechmaticsApiKey();

  let response: Response;

  try {
    response = await fetch(SPEECHMATICS_REALTIME_TEMPORARY_KEY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${permanentApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: SPEECHMATICS_REALTIME_TEMPORARY_KEY_TTL_SECONDS }),
      signal: AbortSignal.timeout(config.speechmaticsApiTimeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("Speechmatics temporary credential request timed out");
    }

    throw new Error("Unable to reach Speechmatics");
  }

  if (!response.ok) {
    throw new Error("Speechmatics temporary credential request failed");
  }

  let data: SpeechmaticsTemporaryKeyResponse;

  try {
    data = (await response.json()) as SpeechmaticsTemporaryKeyResponse;
  } catch {
    throw new Error("Speechmatics returned an invalid temporary credential");
  }

  if (typeof data.key_value !== "string" || !data.key_value) {
    throw new Error("Speechmatics returned an invalid temporary credential");
  }

  return { token: data.key_value };
}

export const speechmaticsService = new SpeechmaticsService();
