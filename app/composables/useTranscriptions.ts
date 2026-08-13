import { useAuthStore } from "~/stores/auth";
import { listTranscriptions } from "~/services/transcriptions.service";
import { TRANSCRIPTIONS_PAGE_SIZE } from "~/utils/constants";
import { EMPTY_TRANSCRIPTION_PAGE } from "~/utils/transcriptions";

export function useTranscriptions() {
  const api = useApi();

  const authStore = useAuthStore();

  const error = ref(false);

  const loading = ref(true);

  const transcriptions = ref(EMPTY_TRANSCRIPTION_PAGE);

  async function loadTranscriptions(cursor?: string): Promise<void> {
    loading.value = true;

    error.value = false;

    try {
      await authStore.initialize();

      if (!authStore.isAuthenticated) {
        transcriptions.value = EMPTY_TRANSCRIPTION_PAGE;
        return;
      }

      transcriptions.value = await listTranscriptions(api, {
        cursor,
        limit: TRANSCRIPTIONS_PAGE_SIZE,
      });
    } catch {
      transcriptions.value = EMPTY_TRANSCRIPTION_PAGE;
      error.value = true;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    void loadTranscriptions();
  });

  return {
    error,
    loading,
    transcriptions,
    next: loadTranscriptions,
    refresh: () => loadTranscriptions(),
  };
}
