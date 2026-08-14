import { transcriptionProcessingService } from "../services/transcription-processing.service";
import { processTranscriptionInvocationSchema } from "../types/transcription";

/** Handles internal asynchronous Lambda invocations for uploaded audio files. */
export const handler = async (event: unknown): Promise<void> => {
  const invocation = processTranscriptionInvocationSchema.parse(event);

  await transcriptionProcessingService.process(invocation);
};
