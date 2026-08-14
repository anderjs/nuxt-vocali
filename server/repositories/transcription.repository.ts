import {
  dynamoDBService,
  type DynamoDBService,
} from "../services/dynamodb.service";
import type {
  Transcription,
  ListTranscriptionsQueryDto,
  ListTranscriptionsResponseDto,
} from "../types/transcription";

export interface TranscriptionRepositoryPort {
  createTranscription(transcription: Transcription): Promise<Transcription>;
  markTranscriptionFailed(id: string): Promise<Transcription>;
}

export interface TranscriptionLookupRepositoryPort {
  getTranscriptionById(id: string): Promise<Transcription | null>;
}

export interface TranscriptionProcessingRepositoryPort
  extends TranscriptionLookupRepositoryPort {
  markTranscriptionCompleted(input: {
    id: string;
    transcriptionS3Key: string;
  }): Promise<Transcription>;
  markTranscriptionFailed(id: string): Promise<Transcription>;
}

export class TranscriptionRepository {
  constructor(private readonly dynamodb: DynamoDBService = dynamoDBService) {}

  async createTranscription(
    transcription: Transcription,
  ): Promise<Transcription> {
    await this.dynamodb.putTranscription(transcription);

    return transcription;
  }

  async markTranscriptionCompleted({
    id,
    transcriptionS3Key,
  }: {
    id: string;
    transcriptionS3Key: string;
  }): Promise<Transcription> {
    return this.dynamodb.markTranscriptionCompleted(id, transcriptionS3Key);
  }

  async markTranscriptionFailed(id: string): Promise<Transcription> {
    return this.dynamodb.markTranscriptionFailed(id);
  }

  async getTranscriptionById(id: string): Promise<Transcription | null> {
    return this.dynamodb.getTranscriptionById(id);
  }

  async listTranscriptions(
    userId: string,
    params: ListTranscriptionsQueryDto,
  ): Promise<ListTranscriptionsResponseDto> {
    const result = await this.dynamodb.listTranscriptionsByUserId({
      userId,
      limit: params.limit,
      cursor: params.cursor,
    });

    return {
      data: result.items,
      nextCursor: result.nextCursor,
    };
  }
}

export const transcriptionRepository = new TranscriptionRepository();
