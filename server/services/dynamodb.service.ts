import { VocaliTable } from "../utils/tables.js";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { config } from "../config/index.js";

export class DynamoDBService {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({
      region: config.awsRegion,
    });
  }

  async queryTranscriptions(): Promise<[]> {
    const input = new QueryCommand({
      TableName: VocaliTable.TRANSCRIPTIONS,
    });

    const data = await this.client.send(input);

    return data.Items as [];
  }
}
