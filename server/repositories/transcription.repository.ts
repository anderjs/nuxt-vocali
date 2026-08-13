import {
  dynamoDBService,
  type DynamoDBService,
} from "../services/dynamodb.service";
import type {
  ListTranscriptionsQueryDto,
  ListTranscriptionsResponseDto,
} from "../types/transcription";

export class TranscriptionRepository {
  constructor(private readonly dynamodb: DynamoDBService = dynamoDBService) {}

  async listTranscriptions(
    userId: string,
    params: ListTranscriptionsQueryDto,
  ): Promise<ListTranscriptionsResponseDto> {
    const result = await this.dynamodb.listTranscriptionsByUserId({
      cursor: params.cursor,
      limit: params.limit,
      userId,
    });

    return {
      data: result.items,
      nextCursor: result.nextCursor,
    };
  }
}

export const transcriptionRepository = new TranscriptionRepository();
