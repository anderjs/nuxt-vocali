import {
  PCMRecorder,
  type InputAudioEvent,
} from "@speechmatics/browser-audio-input";
import {
  RealtimeClient,
  type ReceiveMessageEvent,
  type SocketStateChangeEvent,
} from "@speechmatics/real-time-client";
import type {
  RealtimeSession,
  RealtimeSessionCallbacks,
  RealtimeSessionContext,
  RealtimeSessionResources,
} from "~/common/types";
import {
  SPEECHMATICS_APP_ID,
  SPEECHMATICS_WORKLET_URL,
  closeAudioContext,
  createPcmAudioBuffer,
  createRealtimeAudioContext,
  createRealtimeTranscriptionConfig,
} from "~/utils/realtime";

/**
 * Creates an isolated browser session for realtime transcription.
 *
 * The session owns the microphone recorder, Speechmatics client and audio
 * context for a single consumer. Reactive UI state remains in the composable
 * and is updated through the supplied callbacks.
 *
 * @param callbacks Handlers used to publish transcript and lifecycle events.
 * @returns Controls for starting and stopping the realtime session.
 */
export function createRealtimeSession(
  callbacks: RealtimeSessionCallbacks,
): RealtimeSession {
  const context: RealtimeSessionContext = {
    stopping: false,
    stopPromise: null,
    sessionVersion: 0,
    activeResources: null,
    unexpectedStopStarted: false,
  };

  /**
   * Routes Speechmatics messages to the corresponding application callback.
   * Protocol errors initiate a single controlled shutdown.
   *
   * @param event Message emitted by the Speechmatics realtime client.
   */
  const handleMessage = (event: ReceiveMessageEvent): void => {
    const { data } = event;

    if (data.message === "AddPartialTranscript") {
      callbacks.onPartialTranscript(data.metadata.transcript);
      return;
    }

    if (data.message === "AddTranscript") {
      callbacks.onFinalTranscript(data.metadata.transcript);
      return;
    }

    if (data.message === "Error") {
      callbacks.onError("La transcripción en tiempo real se interrumpió.");

      stopAfterUnexpectedClosure();
    }
  };

  /**
   * Detects socket closures that were not caused by an explicit stop request.
   *
   * @param event Socket lifecycle event emitted by the realtime client.
   */
  const handleSocketStateChange = (event: SocketStateChangeEvent): void => {
    if (event.socketState === "closed" && !context.stopping) {
      callbacks.onError(
        "Se perdió la conexión con la transcripción en tiempo real.",
      );
      stopAfterUnexpectedClosure();
    }
  };

  /**
   * Sends captured PCM data only after Speechmatics has accepted the session.
   * Audio produced while the socket is connecting is intentionally ignored.
   *
   * @param event PCM audio chunk emitted by the browser recorder.
   */
  const handleAudio = (event: InputAudioEvent): void => {
    const resources = context.activeResources;

    if (
      resources?.recognitionReady &&
      resources.client.socketState === "open"
    ) {
      resources.client.sendAudio(createPcmAudioBuffer(event.data));
    }
  };

  /**
   * Releases every browser and Speechmatics resource owned by a session.
   * The active reference is cleared only when it still points to these
   * resources, preventing an older cleanup from affecting a newer session.
   *
   * @param resources Resources associated with the session being released.
   */
  const releaseResources = async (
    resources: RealtimeSessionResources,
  ): Promise<void> => {
    resources.recorder.stopRecording();

    resources.recorder.removeEventListener("audio", handleAudio);

    resources.client.removeEventListener("receiveMessage", handleMessage);

    resources.client.removeEventListener(
      "socketStateChange",
      handleSocketStateChange,
    );

    await closeAudioContext(resources.audioContext);

    if (context.activeResources === resources) {
      context.activeResources = null;
    }
  };

  /**
   * Requests microphone access, starts Speechmatics recognition and enables
   * audio forwarding once the server confirms that recognition is ready.
   *
   * @param token Temporary Speechmatics credential obtained from the backend.
   * @returns Whether this session reached the recording state.
   */
  const start = async (token: string): Promise<boolean> => {
    const currentSession = ++context.sessionVersion;

    const audioContext = createRealtimeAudioContext();

    const client = new RealtimeClient({
      appId: SPEECHMATICS_APP_ID,
    });

    const recorder = new PCMRecorder(SPEECHMATICS_WORKLET_URL);

    const recorderStartPromise = recorder.startRecording({ audioContext });

    const resources: RealtimeSessionResources = {
      audioContext,
      client,
      recorder,
      recorderStartPromise,
      recognitionReady: false,
      clientStartPromise: null,
    };

    recorder.addEventListener("audio", handleAudio);

    client.addEventListener("receiveMessage", handleMessage);

    client.addEventListener("socketStateChange", handleSocketStateChange);

    context.activeResources = resources;

    await recorderStartPromise;

    if (currentSession !== context.sessionVersion) {
      await stop();

      return false;
    }

    resources.clientStartPromise = client.start(
      token,
      createRealtimeTranscriptionConfig(audioContext.sampleRate),
    );

    await resources.clientStartPromise;

    if (currentSession !== context.sessionVersion) {
      await stop();

      return false;
    }

    resources.recognitionReady = true;

    return true;
  };

  /**
   * Stops audio capture, waits for pending initialization and requests the
   * final transcript before releasing session resources.
   */
  const stopSession = async (): Promise<void> => {
    context.stopping = true;

    const resources = context.activeResources;

    if (!resources) {
      context.stopping = false;

      return;
    }

    try {
      await resources.recorderStartPromise;

      resources.recorder.stopRecording();

      if (resources.clientStartPromise) {
        await resources.clientStartPromise;
      }

      if (resources.client.socketState === "open") {
        await resources.client.stopRecognition();
      }
    } finally {
      await releaseResources(resources);

      context.stopping = false;
    }
  };

  /**
   * Stops the current session once and shares the pending operation between
   * concurrent callers.
   *
   * @returns The active stop operation.
   */
  const stop = (): Promise<void> => {
    if (context.stopPromise) {
      return context.stopPromise;
    }

    context.sessionVersion += 1;

    const pendingStop = stopSession().finally(() => {
      context.stopPromise = null;
    });

    context.stopPromise = pendingStop;

    return pendingStop;
  };

  /**
   * Converts protocol errors and unexpected socket closures into one cleanup
   * operation and one stopped notification.
   */
  const stopAfterUnexpectedClosure = (): void => {
    if (context.unexpectedStopStarted) {
      return;
    }

    context.unexpectedStopStarted = true;

    void stop().finally(() => {
      callbacks.onStopped();

      context.unexpectedStopStarted = false;
    });
  };

  return { start, stop };
}
