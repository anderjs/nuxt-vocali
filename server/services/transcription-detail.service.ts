import {
  transcriptionRepository,
  type TranscriptionLookupRepositoryPort,
} from "../repositories/transcription.repository";
import type { Transcription } from "../types/transcription";
import { s3Service } from "./s3.service";

export interface TranscriptionDetailStoragePort {
  getTranscriptionText(objectKey: string): Promise<string>;
}

export interface TranscriptionDetail {
  id: string;
  fileName: string;
  type: Transcription["type"];
  status: Transcription["status"];
  createdAt: string;
  durationSeconds?: number;
  text?: string;
}

export class TranscriptionDetailNotFoundError extends Error {
  constructor() {
    super("Transcription not found");
    this.name = "TranscriptionDetailNotFoundError";
  }
}

export class TranscriptionDetailService {
  constructor(
    private readonly repository: TranscriptionLookupRepositoryPort =
      transcriptionRepository,
    private readonly storage: TranscriptionDetailStoragePort = s3Service,
  ) {}

  async getTranscription(
    userId: string,
    id: string,
  ): Promise<TranscriptionDetail> {
    const transcription = await this.repository.getTranscriptionById(id);

    if (!transcription || transcription.userId !== userId) {
      throw new TranscriptionDetailNotFoundError();
    }

    const text =
      transcription.status === "completed" && transcription.transcriptionS3Key
        ? await this.storage.getTranscriptionText(
            transcription.transcriptionS3Key,
          )
        : undefined;

    return {
      createdAt: transcription.createdAt,
      durationSeconds: transcription.durationSeconds,
      fileName: transcription.fileName,
      id: transcription.id,
      status: transcription.status,
      text,
      type: transcription.type,
    };
  }
}

export const transcriptionDetailService = new TranscriptionDetailService();
