import { listTranscriptions } from "~/services/transcriptions.service";
import { EMPTY_TRANSCRIPTION_PAGE } from "~/utils/transcriptions";

export function useTranscriptions() {
  const api = useApi();

  const loading = ref(true);

  const error = ref(false);

  const transcriptions = ref(EMPTY_TRANSCRIPTION_PAGE);

  async function loadTranscriptions(): Promise<void> {
    loading.value = true;

    error.value = false;

    try {
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
