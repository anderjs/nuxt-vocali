import { useAuthStore } from "~/stores/auth";
import { listTranscriptions } from "~/services/transcriptions.service";
import { EMPTY_TRANSCRIPTION_PAGE } from "~/utils/transcriptions";

export function useTranscriptions() {
  const api = useApi();
  const authStore = useAuthStore();

  const loading = ref(true);

  const error = ref(false);

  const transcriptions = ref(EMPTY_TRANSCRIPTION_PAGE);

  async function loadTranscriptions(): Promise<void> {
    loading.value = true;

    error.value = false;

    try {
      await authStore.initialize();

      if (!authStore.isAuthenticated) {
        transcriptions.value = EMPTY_TRANSCRIPTION_PAGE;
        return;
      }

      transcriptions.value = await listTranscriptions(api);
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
    refresh: loadTranscriptions,
  };
}
