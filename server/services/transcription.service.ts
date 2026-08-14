import { randomUUID } from "node:crypto";
import {
  transcriptionRepository,
  type TranscriptionRepositoryPort,
} from "../repositories/transcription.repository";
import {
  transcriptionSchema,
  type CreateTranscriptionRequestDto,
  type Transcription,
} from "../types/transcription";
import { isUploadObjectKeyOwnedByUser } from "../utils/storage";

export class InvalidUploadObjectKeyError extends Error {
  constructor() {
    super("Invalid upload object key");
    this.name = "InvalidUploadObjectKeyError";
  }
}

export class TranscriptionService {
  constructor(
    private readonly repository: TranscriptionRepositoryPort =
      transcriptionRepository,
  ) {}

  async createFileTranscription(
    userId: string,
    input: CreateTranscriptionRequestDto,
  ): Promise<Transcription> {
    if (!isUploadObjectKeyOwnedByUser(input.s3Key, userId)) {
      throw new InvalidUploadObjectKeyError();
    }

    const timestamp = new Date().toISOString();
    const transcription = transcriptionSchema.parse({
      ...input,
      id: randomUUID(),
      userId,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.repository.createTranscription(transcription);
  }
}

export const transcriptionService = new TranscriptionService();
