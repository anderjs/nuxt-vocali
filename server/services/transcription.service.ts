import { randomUUID } from "node:crypto";
import {
  transcriptionRepository,
  type TranscriptionRepositoryPort,
} from "../repositories/transcription.repository";
import { s3Service, type S3Service } from "./s3.service";
import {
  transcriptionProcessingDispatcher,
  type TranscriptionProcessingDispatcherPort,
} from "./transcription-processing-dispatcher.service";
import {
  createRealtimeTranscriptionRequestSchema,
  transcriptionSchema,
  type CreateFileTranscriptionRequestDto,
  type CreateRealtimeTranscriptionRequestDto,
  type Transcription,
} from "../types/transcription";
import {
  createRealtimeTranscriptionFileName,
  createRealtimeTranscriptionObjectKey,
  isUploadObjectKeyOwnedByUser,
} from "../utils/storage";

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
    private readonly storage: Pick<S3Service, "putTranscriptionText"> =
      s3Service,
    private readonly dispatcher: TranscriptionProcessingDispatcherPort =
      transcriptionProcessingDispatcher,
  ) {}

  async createFileTranscription(
    userId: string,
    input: CreateFileTranscriptionRequestDto,
  ): Promise<Transcription> {
    if (!isUploadObjectKeyOwnedByUser(input.s3Key, userId)) {
      throw new InvalidUploadObjectKeyError();
    }

    const timestamp = new Date().toISOString();
    const transcription = transcriptionSchema.parse({
      ...input,
      id: randomUUID(),
      userId,
      status: "processing",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const createdTranscription = await this.repository.createTranscription(transcription);

    try {
      await this.dispatcher.dispatch({
        transcriptionId: createdTranscription.id,
        userId,
      });
    } catch (error) {
      await this.repository.markTranscriptionFailed(createdTranscription.id);
      throw error;
    }

    return createdTranscription;
  }

  async createRealtimeTranscription(
    userId: string,
    input: CreateRealtimeTranscriptionRequestDto,
  ): Promise<Transcription> {
    const request = createRealtimeTranscriptionRequestSchema.parse(input);
    const createdAt = new Date();
    const id = randomUUID();
    const transcriptionS3Key = createRealtimeTranscriptionObjectKey(userId, id);
    const transcription = transcriptionSchema.parse({
      id,
      userId,
      fileName: createRealtimeTranscriptionFileName(createdAt),
      type: "realtime",
      status: "completed",
      startedAt: request.startedAt,
      endedAt: request.endedAt,
      transcriptionS3Key,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });

    await this.storage.putTranscriptionText({
      objectKey: transcriptionS3Key,
      text: request.text,
    });

    return this.repository.createTranscription(transcription);
  }
}

export const transcriptionService = new TranscriptionService();
