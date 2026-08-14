/**
 * Shares the realtime session activity flag between the recording flow and the
 * transcription-history polling flow without duplicating realtime resources.
 */
export function useRealtimeTranscriptionState() {
  const isRealtimeSessionActive = useState<boolean>(
    "realtime-transcription-session-active",
    () => false,
  );

  return { isRealtimeSessionActive };
}
