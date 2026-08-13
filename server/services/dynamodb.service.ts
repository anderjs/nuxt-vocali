import {
  DynamoDBClient,
  ScanCommand,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { config } from "../config";
import {
  transcriptionSchema,
  type Transcription,
} from "../types/transcription";

export class DynamoDBService {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({
      region: config.awsRegion,
    });
  }

  async listTranscriptionsByUserId(userId: string): Promise<Transcription[]> {
    const tableName = config.dynamodbTableName;

    if (!tableName) {
      throw new Error("DynamoDB table name is not configured");
    }

    const response = await this.client.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "#userId = :userId",
        ExpressionAttributeNames: {
          "#userId": "userId",
        },
        ExpressionAttributeValues: {
          ":userId": { S: userId },
        },
      }),
    );

    return (response.Items ?? []).map(
      (item: Record<string, AttributeValue>): Transcription =>
        transcriptionSchema.parse(unmarshall(item)),
    );
  }
}

export const dynamoDBService = new DynamoDBService();
