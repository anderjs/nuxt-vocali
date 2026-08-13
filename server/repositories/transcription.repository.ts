import {
  dynamoDBService,
  type DynamoDBService,
} from "../services/dynamodb.service";
import type { Transcription } from "../types/transcription";

export class TranscriptionRepository {
  constructor(private readonly dynamodb: DynamoDBService = dynamoDBService) {}

  async listTranscriptions(userId: string): Promise<Transcription[]> {
    return await this.dynamodb.listTranscriptionsByUserId(userId);
  }
}

export const transcriptionRepository = new TranscriptionRepository();
