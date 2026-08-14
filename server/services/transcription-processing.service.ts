import {
  transcriptionRepository,
  type TranscriptionProcessingRepositoryPort,
} from "../repositories/transcription.repository";
import { s3Service, type S3Service } from "./s3.service";
import {
  speechmaticsService,
  type SpeechmaticsBatchClient,
} from "./speechmatics.service";
import { createTranscriptionResultObjectKey } from "../utils/storage";
import type { ProcessTranscriptionInvocation } from "./transcription-processing-dispatcher.service";

/** Runs a single file-transcription job from its authoritative DynamoDB record. */
export class TranscriptionProcessingService {
  constructor(
    private readonly repository: TranscriptionProcessingRepositoryPort =
      transcriptionRepository,
    private readonly storage: Pick<
      S3Service,
      "createSourceAudioDownloadUrl" | "putTranscriptionText"
    > = s3Service,
    private readonly speechmatics: SpeechmaticsBatchClient = speechmaticsService,
  ) {}

  async process({ transcriptionId, userId }: ProcessTranscriptionInvocation): Promise<void> {
    const transcription = await this.repository.getTranscriptionById(transcriptionId);

    if (
      !transcription ||
      transcription.userId !== userId ||
      transcription.type !== "file" ||
      transcription.status !== "processing" ||
      !transcription.s3Key
    ) {
      return;
    }

    try {
      const sourceUrl = await this.storage.createSourceAudioDownloadUrl(
        transcription.s3Key,
      );
      const text = (
        await this.speechmatics.transcribeFile({
          sourceUrl,
          language: transcription.language ?? "es",
        })
      ).trim();

      if (!text) {
        throw new Error("Speechmatics returned an empty transcript");
      }
      const transcriptionS3Key = createTranscriptionResultObjectKey(
        transcription.userId,
        transcription.id,
      );

      await this.storage.putTranscriptionText({
        objectKey: transcriptionS3Key,
        text,
      });
      await this.repository.markTranscriptionCompleted({
        id: transcription.id,
        transcriptionS3Key,
      });
    } catch {
      console.error("File transcription processing failed", { transcriptionId });

      try {
        await this.repository.markTranscriptionFailed(transcriptionId);
      } catch {
        console.error("Unable to mark transcription as failed", { transcriptionId });
      }
    }
  }
}

export const transcriptionProcessingService = new TranscriptionProcessingService();
