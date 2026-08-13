import {
  DynamoDBClient,
  QueryCommand,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { config } from "../config";
import {
  transcriptionSchema,
  type Transcription,
} from "../types/transcription";
import { DynamoDBIndex } from "../utils/tables";
import {
  decodeDynamoDBCursor,
  encodeDynamoDBCursor,
} from "../utils/pagination";

export interface ListTranscriptionsByUserIdParams {
  userId: string;
  limit: number;
  cursor?: string;
}

export interface ListTranscriptionsByUserIdResult {
  items: Transcription[];
  nextCursor: string | null;
}

export class DynamoDBService {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({
      region: config.awsRegion,
    });
  }

  async listTranscriptionsByUserId({
    userId,
    limit,
    cursor,
  }: ListTranscriptionsByUserIdParams): Promise<ListTranscriptionsByUserIdResult> {
    const tableName = config.dynamodbTableName;

    if (!tableName) {
      throw new Error("DynamoDB table name is not configured");
    }

    const response = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: DynamoDBIndex.TRANSCRIPTIONS_BY_USER_CREATED_AT,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
          "#userId": "userId",
        },
        ExpressionAttributeValues: {
          ":userId": { S: userId },
        },
        ExclusiveStartKey: decodeDynamoDBCursor(cursor),
        Limit: limit,
        ScanIndexForward: false,
      }),
    );

    const items = (response.Items ?? []).map(
      (item: Record<string, AttributeValue>): Transcription =>
        transcriptionSchema.parse(unmarshall(item)),
    );

    return {
      items,
      nextCursor: encodeDynamoDBCursor(response.LastEvaluatedKey),
    };
  }
}

export const dynamoDBService = new DynamoDBService();
