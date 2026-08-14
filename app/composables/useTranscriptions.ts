import { useAuthStore } from "~/stores/auth";
import { listTranscriptions } from "~/services/transcriptions.service";
import {
  TRANSCRIPTIONS_PAGE_SIZE,
  TRANSCRIPTIONS_POLL_INTERVAL_MS,
} from "~/utils/constants";
import {
  containsProcessingTranscription,
  EMPTY_TRANSCRIPTION_PAGE,
} from "~/utils/transcriptions";

export function useTranscriptions() {
  const api = useApi();
  const authStore = useAuthStore();
  const cursor = ref<string>();

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

      return listTranscriptions(api, {
        cursor: cursor.value,
        limit: TRANSCRIPTIONS_PAGE_SIZE,
      });
    },
    {
      default: () => EMPTY_TRANSCRIPTION_PAGE,
      server: false,
    },
  );

  const loading = computed(
    () => status.value === "idle" || status.value === "pending",
  );
  const hasProcessingTranscriptions = computed(() =>
    containsProcessingTranscription(transcriptions.value.items),
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

    if (!hasProcessingTranscriptions.value) {
      return;
    }

    pollingTimeout = setTimeout(() => {
      void pollTranscriptions();
    }, TRANSCRIPTIONS_POLL_INTERVAL_MS);
  }

  async function pollTranscriptions(): Promise<void> {
    pollingTimeout = undefined;

    if (!hasProcessingTranscriptions.value) {
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

  watch(
    hasProcessingTranscriptions,
    (shouldPoll) => {
      if (shouldPoll) {
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
    loading,
    next,
    refresh,
    status,
    transcriptions,
  };
}
