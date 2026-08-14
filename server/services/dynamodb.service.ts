import {
  QueryCommand,
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
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
  private readonly tableName: string;

  constructor(
    client?: DynamoDBClient,
    tableName = config.dynamodbTableName,
  ) {
    if (!tableName) {
      throw new Error("DynamoDB table name is not configured");
    }

    this.client =
      client ??
      new DynamoDBClient({
        region: config.awsRegion,
      });
    this.tableName = tableName;
  }

  async putTranscription(transcription: Transcription): Promise<void> {
    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(transcription, { removeUndefinedValues: true }),
        ConditionExpression: "attribute_not_exists(#id)",
        ExpressionAttributeNames: {
          "#id": "id",
        },
      }),
    );
  }

  async markTranscriptionCompleted(
    id: string,
    transcriptionS3Key: string,
  ): Promise<Transcription> {
    return this.updateTranscriptionStatus({
      id,
      status: "completed",
      transcriptionS3Key,
    });
  }

  async markTranscriptionFailed(id: string): Promise<Transcription> {
    return this.updateTranscriptionStatus({ id, status: "failed" });
  }

  private async updateTranscriptionStatus({
    id,
    status,
    transcriptionS3Key,
  }: {
    id: string;
    status: "completed" | "failed";
    transcriptionS3Key?: string;
  }): Promise<Transcription> {
    const updatedAt = new Date().toISOString();
    const response = await this.client.send(
      new UpdateItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
        UpdateExpression:
          status === "completed"
            ? "SET #status = :status, #updatedAt = :updatedAt, #transcriptionS3Key = :transcriptionS3Key"
            : "SET #status = :status, #updatedAt = :updatedAt",
        ConditionExpression: "#status = :processing",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
          "#transcriptionS3Key": "transcriptionS3Key",
        },
        ExpressionAttributeValues: {
          ":status": { S: status },
          ":updatedAt": { S: updatedAt },
          ":processing": { S: "processing" },
          ...(transcriptionS3Key
            ? { ":transcriptionS3Key": { S: transcriptionS3Key } }
            : {}),
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    if (!response.Attributes) {
      throw new Error("Transcription status was not updated");
    }

    return transcriptionSchema.parse(unmarshall(response.Attributes));
  }

  async getTranscriptionById(id: string): Promise<Transcription | null> {
    const response = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: {
          id: { S: id },
        },
      }),
    );

    return response.Item
      ? transcriptionSchema.parse(unmarshall(response.Item))
      : null;
  }

  async listTranscriptionsByUserId({
    userId,
    limit,
    cursor,
  }: ListTranscriptionsByUserIdParams): Promise<ListTranscriptionsByUserIdResult> {
    const response = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
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
