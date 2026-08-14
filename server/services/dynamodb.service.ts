import {
  QueryCommand,
  DynamoDBClient,
  PutItemCommand,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
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

const defaultItems: Record<string, AttributeValue>[] = [];

export class DynamoDBService {
  private readonly client: DynamoDBClient;

  constructor(client?: DynamoDBClient) {
    this.client =
      client ??
      new DynamoDBClient({
        region: config.awsRegion,
      });
  }

  async putTranscription(transcription: Transcription): Promise<void> {
    const tableName = config.dynamodbTableName;

    await this.client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: marshall(transcription, { removeUndefinedValues: true }),
        ConditionExpression: "attribute_not_exists(#id)",
        ExpressionAttributeNames: {
          "#id": "id",
        },
      }),
    );
  }

  /**
   * @description
   * Fetch transcription.
   */
  async listTranscriptionsByUserId({
    userId,
    limit,
    cursor,
  }: ListTranscriptionsByUserIdParams): Promise<ListTranscriptionsByUserIdResult> {
    const tableName = config.dynamodbTableName;

    const response = await this.client.send(
      new QueryCommand({
        TableName: tableName,
        ExpressionAttributeNames: {
          "#userId": "userId",
        },
        ExpressionAttributeValues: {
          ":userId": { S: userId },
        },
        Limit: limit,
        ScanIndexForward: false,
        KeyConditionExpression: "#userId = :userId",
        ExclusiveStartKey: decodeDynamoDBCursor(cursor),
        IndexName: DynamoDBIndex.TRANSCRIPTIONS_BY_USER_CREATED_AT,
      }),
    );

    const items = (response.Items ?? defaultItems).map(
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
