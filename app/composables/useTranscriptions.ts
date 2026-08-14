import { useAuthStore } from "~/stores/auth";
import {
  getTranscriptionDownloadUrl,
  listTranscriptions,
} from "~/services/transcriptions.service";
import {
  TRANSCRIPTIONS_PAGE_SIZE,
  TRANSCRIPTIONS_POLL_INTERVAL_MS,
} from "~/utils/constants";
import {
  containsProcessingTranscription,
  EMPTY_TRANSCRIPTION_PAGE,
} from "~/utils/transcriptions";
import { startBrowserDownload } from "~/utils/download";

export function useTranscriptions() {
  const api = useApi();
  const authStore = useAuthStore();
  const cursor = ref<string>();
  const lastUpdatedAt = ref<Date | null>(null);
  const { isRealtimeSessionActive } = useRealtimeTranscriptionState();

  const {
    data: transcriptions,
    error,
    refresh: refreshData,
    status,
  } = useAsyncData(
    "transcriptions",
    async () => {
      await authStore.initialize();

      if (!authStore.isAuthenticated) {
        return EMPTY_TRANSCRIPTION_PAGE;
      }

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

  const hasLoadedOnce = computed(() => lastUpdatedAt.value !== null);
  const initialLoading = computed(
    () =>
      !hasLoadedOnce.value &&
      (status.value === "idle" || status.value === "pending"),
  );
  const isRefreshing = computed(
    () => hasLoadedOnce.value && status.value === "pending",
  );
  const hasProcessingTranscriptions = computed(() =>
    containsProcessingTranscription(transcriptions.value.items),
  );
  const shouldPoll = computed(
    () =>
      hasProcessingTranscriptions.value && !isRealtimeSessionActive.value,
  );

  let pollingTimeout: ReturnType<typeof setTimeout> | undefined;

  function stopPolling(): void {
    if (pollingTimeout) {
      clearTimeout(pollingTimeout);
      pollingTimeout = undefined;
    }
  }

  function schedulePolling(): void {
    stopPolling();

    if (!shouldPoll.value) {
      return;
    }

    pollingTimeout = setTimeout(() => {
      void pollTranscriptions();
    }, TRANSCRIPTIONS_POLL_INTERVAL_MS);
  }

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

  async function refresh(): Promise<void> {
    cursor.value = undefined;
    await refreshData();
  }

  async function next(nextCursor: string): Promise<void> {
    cursor.value = nextCursor;
    await refreshData();
  }

  async function download(id: string): Promise<void> {
    const downloadUrl = await getTranscriptionDownloadUrl(api, id);

    startBrowserDownload(downloadUrl);
  }

  watch(
    shouldPoll,
    (isPollingEnabled) => {
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
