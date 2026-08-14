import { useAuthStore } from "~/stores/auth";
import {
  listTranscriptions,
  getTranscriptionDownloadUrl,
} from "~/services/transcriptions.service";
import {
  TRANSCRIPTIONS_PAGE_SIZE,
  TRANSCRIPTIONS_POLL_INTERVAL_MS,
} from "~/utils/constants";
import {
  EMPTY_TRANSCRIPTION_PAGE,
  containsProcessingTranscription,
} from "~/utils/transcriptions";
import { startBrowserDownload } from "~/utils/download";
import type { ApiClient, UseTranscriptionsReturn } from "~/common/types";
import type { TranscriptionPage } from "~/types/transcription";

/**
 * Loads one cursor-based page of the authenticated user's transcription history.
 *
 * It preserves the previous page during background refreshes and schedules a
 * non-overlapping poll only while file transcriptions are processing and no
 * realtime session is active.
 */
export function useTranscriptions(): UseTranscriptionsReturn {
  const api: ApiClient = useApi();
  const authStore = useAuthStore();
  const cursor = ref<string | undefined>();
  const lastUpdatedAt = ref<Date | null>(null);
  const { isRealtimeSessionActive } = useRealtimeTranscriptionState();

  const {
    data: transcriptions,
    error,
    refresh: refreshData,
    status,
  } = useAsyncData(
    "transcriptions",
    async (): Promise<TranscriptionPage> => {
      await authStore.initialize();

      const page = await listTranscriptions(api, {
        cursor: cursor.value,
        limit: TRANSCRIPTIONS_PAGE_SIZE,
      });

      lastUpdatedAt.value = new Date();

      return page;
    },
    {
      default: () => EMPTY_TRANSCRIPTION_PAGE,
      server: false,
    },
  );

  /** Whether the first successful history request has finished. */
  const hasLoadedOnce = computed<boolean>(() => lastUpdatedAt.value !== null);

  /** Whether the page should show its initial loading state. */
  const initialLoading = computed<boolean>(
    () =>
      !hasLoadedOnce.value &&
      (status.value === "idle" || status.value === "pending"),
  );

  /** Whether a refresh is in progress after at least one successful load. */
  const isRefreshing = computed<boolean>(
    () => hasLoadedOnce.value && status.value === "pending",
  );

  /** Whether the current page contains a file transcription still processing. */
  const hasProcessingTranscriptions = computed<boolean>(() =>
    containsProcessingTranscription(transcriptions.value.items),
  );

  /** Whether polling is currently allowed for the current page. */
  const shouldPoll = computed<boolean>(
    () => hasProcessingTranscriptions.value && !isRealtimeSessionActive.value,
  );

  let pollingTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Cancels the next scheduled polling request, if one exists. */
  function stopPolling(): void {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      pollingTimeout = undefined;
    }
  }

  /** Schedules one delayed refresh only when the current page requires polling. */
  function schedulePolling(): void {
    stopPolling();

    if (!shouldPoll.value) {
      return;
    }

    pollingTimeout = setTimeout(() => {
      void pollTranscriptions();
    }, TRANSCRIPTIONS_POLL_INTERVAL_MS);
  }

  /** Refreshes history without overlapping an already pending Nuxt request. */
  async function pollTranscriptions(): Promise<void> {
    pollingTimeout = undefined;

    if (!shouldPoll.value) {
      return;
    }

    if (status.value !== "pending") {
      await refreshData();
    }

    schedulePolling();
  }

  /** Reloads the first page of the transcription history. */
  async function refresh(): Promise<void> {
    cursor.value = undefined;
    await refreshData();
  }

  /** Loads the next cursor-based page returned by the API. */
  async function next(nextCursor: string): Promise<void> {
    cursor.value = nextCursor;
    await refreshData();
  }

  /** Resolves the short-lived transcript URL and starts a browser download. */
  async function download(id: string): Promise<void> {
    const downloadUrl = await getTranscriptionDownloadUrl(api, id);

    startBrowserDownload(downloadUrl);
  }

  watch(
    shouldPoll,
    (isPollingEnabled: boolean): void => {
      if (isPollingEnabled) {
        schedulePolling();

        return;
      }

      stopPolling();
    },
    { immediate: true },
  );

  onBeforeUnmount(stopPolling);

  return {
    error,
    download,
    hasLoadedOnce,
    initialLoading,
    isRefreshing,
    lastUpdatedAt,
    next,
    refresh,
    status,
    transcriptions,
  };
}
