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
}

/**
 * @description
 * Transcription Repository.
 */
export class TranscriptionRepository {
  constructor(private readonly dynamodb: DynamoDBService = dynamoDBService) {}

  /**
   * @description
   *
   * @param transcription - current transcription.
   */
  async createTranscription(
    transcription: Transcription,
  ): Promise<Transcription> {
    await this.dynamodb.putTranscription(transcription);

    return transcription;
  }

  /**
   * @description
   * Fetch transcriptions from dynamo.
   * @param limit - pagination args.
   * @param cursor - pagination args.
   * @param userId - user id.
   */
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
