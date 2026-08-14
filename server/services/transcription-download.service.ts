import {
  transcriptionRepository,
  type TranscriptionLookupRepositoryPort,
} from "../repositories/transcription.repository";
import {
  s3Service,
  type CreateTranscriptionDownloadUrlParams,
} from "./s3.service";

export interface TranscriptionDownloadStoragePort {
  createTranscriptionDownloadUrl(
    params: CreateTranscriptionDownloadUrlParams,
  ): Promise<string>;
}

export class TranscriptionNotFoundError extends Error {
  constructor() {
    super("Transcription not found");
    this.name = "TranscriptionNotFoundError";
  }
}

export class TranscriptionNotReadyForDownloadError extends Error {
  constructor() {
    super("Transcription is not ready for download");
    this.name = "TranscriptionNotReadyForDownloadError";
  }
}

export class TranscriptionDownloadService {
  constructor(
    private readonly repository: TranscriptionLookupRepositoryPort =
      transcriptionRepository,
    private readonly storage: TranscriptionDownloadStoragePort = s3Service,
  ) {}

  async createDownloadUrl(userId: string, id: string): Promise<string> {
    const transcription = await this.repository.getTranscriptionById(id);

    if (!transcription || transcription.userId !== userId) {
      throw new TranscriptionNotFoundError();
    }

    if (
      transcription.status !== "completed" ||
      !transcription.transcriptionS3Key
    ) {
      throw new TranscriptionNotReadyForDownloadError();
    }

    return this.storage.createTranscriptionDownloadUrl({
      fileName: transcription.fileName,
      objectKey: transcription.transcriptionS3Key,
    });
  }
}

export const transcriptionDownloadService = new TranscriptionDownloadService();
