import { RealtimeTranscriptionStatus } from "~/common/types";
import { createRealtimeSession } from "~/services/realtime-session.service";
import { getRealtimeCredential } from "~/services/realtime.service";
import {
  appendTranscriptSegment,
  getRealtimeErrorMessage,
} from "~/utils/realtime";

export function useRealtimeTranscription() {
  const api = useApi();
  const { isRealtimeSessionActive } = useRealtimeTranscriptionState();

  const error = ref<string | null>(null);
  const status = ref(RealtimeTranscriptionStatus.IDLE);
  const transcript = ref("");
  const partialTranscript = ref("");
  let stoppingForPersistence = false;

  const isConnecting = computed(
    () => status.value === RealtimeTranscriptionStatus.CONNECTING,
  );
  const isRecording = computed(
    () => status.value === RealtimeTranscriptionStatus.RECORDING,
  );
  const isStopping = computed(
    () => status.value === RealtimeTranscriptionStatus.STOPPING,
  );

  const complete = (): void => {
    isRealtimeSessionActive.value = false;
    stoppingForPersistence = false;
  };

  const session = createRealtimeSession({
    onError(message) {
      error.value = message;
      status.value = RealtimeTranscriptionStatus.STOPPING;
    },
    onFinalTranscript(segment) {
      transcript.value = appendTranscriptSegment(transcript.value, segment);
      partialTranscript.value = "";
    },
    onPartialTranscript(segment) {
      partialTranscript.value = segment;
    },
    onStopped() {
      partialTranscript.value = "";
      status.value = RealtimeTranscriptionStatus.IDLE;

      if (!stoppingForPersistence) {
        complete();
      }
    },
  });

  const start = async (): Promise<void> => {
    if (status.value !== RealtimeTranscriptionStatus.IDLE) {
      return;
    }

    error.value = null;
    transcript.value = "";
    partialTranscript.value = "";
    status.value = RealtimeTranscriptionStatus.CONNECTING;
    isRealtimeSessionActive.value = true;

    try {
      const credential = await getRealtimeCredential(api);
      const started = await session.start(credential.token);

      status.value = started
        ? RealtimeTranscriptionStatus.RECORDING
        : RealtimeTranscriptionStatus.IDLE;

      if (!started) {
        complete();
      }
    } catch (startError) {
      error.value ??= getRealtimeErrorMessage(startError);
      await stop();
      complete();
    }
  };

  /** Stops microphone capture while retaining the shared activity flag until persistence completes. */
  const stop = async (): Promise<void> => {
    if (status.value === RealtimeTranscriptionStatus.IDLE) {
      return;
    }

    stoppingForPersistence = true;
    status.value = RealtimeTranscriptionStatus.STOPPING;

    try {
      await session.stop();
    } catch {
      error.value ??= "No pudimos cerrar la transcripción correctamente.";
    } finally {
      partialTranscript.value = "";
      status.value = RealtimeTranscriptionStatus.IDLE;
    }
  };

  onScopeDispose(() => {
    complete();
    void session.stop();
  });

  return {
    complete,
    error,
    stop,
    start,
    transcript,
    isStopping,
    isRecording,
    isConnecting,
    partialTranscript,
  };
}
