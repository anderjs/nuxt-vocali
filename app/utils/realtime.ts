import type { RealtimeTranscriptionConfig } from "@speechmatics/real-time-client";
import workletScriptUrl from "@speechmatics/browser-audio-input/pcm-audio-worklet.min.js?url";
import type { PcmAudioCapture } from "~/common/types";

export const SPEECHMATICS_APP_ID = "vocali-nuxt";
export const SPEECHMATICS_SAMPLE_RATE = 16_000;

export async function prepareRealtimeAudioContext(): Promise<AudioContext> {
  const audioContext = new AudioContext({
    sampleRate: SPEECHMATICS_SAMPLE_RATE,
  });

  await audioContext.audioWorklet.addModule(workletScriptUrl);

  if (audioContext.state !== "running") {
    await audioContext.resume();
  }

  return audioContext;
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

export function startPcmAudioCapture(
  audioContext: AudioContext,
  mediaStream: MediaStream,
  onAudio: (audio: Float32Array) => void,
): PcmAudioCapture {
  const inputSource = audioContext.createMediaStreamSource(mediaStream);
  const workletNode = new AudioWorkletNode(
    audioContext,
    "pcm-audio-processor",
  );

  workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
    onAudio(event.data);
  };

  inputSource.connect(workletNode);
  workletNode.connect(audioContext.destination);

  return { inputSource, workletNode };
}

export function stopPcmAudioCapture(
  capture: PcmAudioCapture | null,
): void {
  if (!capture) {
    return;
  }

  capture.workletNode.port.onmessage = null;
  capture.workletNode.port.postMessage("stop");
  capture.inputSource.disconnect();
  capture.workletNode.disconnect();
}

export function stopMediaStream(mediaStream: MediaStream | null): void {
  mediaStream?.getTracks().forEach((track) => track.stop());
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
