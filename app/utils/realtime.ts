import type { RealtimeTranscriptionConfig } from "@speechmatics/real-time-client";
import workletScriptUrl from "@speechmatics/browser-audio-input/pcm-audio-worklet.min.js?url";

export const SPEECHMATICS_APP_ID = "vocali-nuxt";
export const SPEECHMATICS_SAMPLE_RATE = 16_000;
export const SPEECHMATICS_WORKLET_URL = workletScriptUrl;

export function createRealtimeAudioContext(): AudioContext {
  return new AudioContext({
    sampleRate: SPEECHMATICS_SAMPLE_RATE,
  });
}

/**
 * Copies a PCM chunk into an ArrayBuffer accepted by the browser WebSocket API.
 * The copy prevents a SharedArrayBuffer-backed typed array from crossing the
 * Speechmatics client boundary.
 *
 * @param audio PCM samples emitted by the browser audio recorder.
 * @returns A standalone buffer containing the same PCM samples.
 */
export function createPcmAudioBuffer(audio: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(audio.byteLength);

  new Float32Array(buffer).set(audio);

  return buffer;
}

export function createRealtimeTranscriptionConfig(
  sampleRate: number,
): RealtimeTranscriptionConfig {
  return {
    audio_format: {
      encoding: "pcm_f32le",
      sample_rate: sampleRate,
      type: "raw",
    },
    transcription_config: {
      enable_partials: true,
      language: "es",
    },
  };
}

export async function closeAudioContext(
  audioContext: AudioContext | null,
): Promise<void> {
  if (audioContext && audioContext.state !== "closed") {
    await audioContext.close();
  }
}

export function appendTranscriptSegment(
  transcript: string,
  segment: string,
): string {
  return [transcript.trim(), segment.trim()].filter(Boolean).join(" ");
}

export function getRealtimeErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "No pudimos acceder al micrófono. Revisa los permisos del navegador.";
  }

  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No encontramos un micrófono disponible.";
  }

  return "No pudimos iniciar la transcripción en tiempo real.";
}
