import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBService } from "../../server/services/dynamodb.service";
import type { Transcription } from "../../server/types/transcription";

describe("DynamoDBService", () => {
  it("fails fast when the table name is not configured", () => {
    const client = { send: jest.fn() } as unknown as DynamoDBClient;

    expect(() => new DynamoDBService(client, "")).toThrow(
      "DynamoDB table name is not configured",
    );
  });

  it("uses a mocked AWS client to persist the transcription", async () => {
    const send = jest.fn().mockResolvedValue({});
    const client = { send } as unknown as DynamoDBClient;
    const service = new DynamoDBService(client);
    const transcription: Transcription = {
      contentType: "audio/mpeg",
      createdAt: "2026-08-14T10:00:00.000Z",
      fileName: "consulta.mp3",
      fileSize: 1024,
      id: "transcription-123",
      s3Key: "uploads/user-123/generated-consulta.mp3",
      status: "pending",
      type: "file",
      updatedAt: "2026-08-14T10:00:00.000Z",
      userId: "user-123",
    };

    await service.putTranscription(transcription);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(PutItemCommand);
  });

  it("retrieves a transcription by its primary key", async () => {
    const transcription: Transcription = {
      contentType: "audio/mpeg",
      createdAt: "2026-08-14T10:00:00.000Z",
      fileName: "consulta.mp3",
      fileSize: 1024,
      id: "transcription-123",
      s3Key: "uploads/user-123/generated-consulta.mp3",
      status: "completed",
      transcriptionS3Key: "transcriptions/user-123/transcription-123.txt",
      type: "file",
      updatedAt: "2026-08-14T10:00:00.000Z",
      userId: "user-123",
    };
    const send = jest.fn().mockResolvedValue({
      Item: marshall(transcription),
    });
    const client = { send } as unknown as DynamoDBClient;
    const service = new DynamoDBService(client);

    await expect(
      service.getTranscriptionById("transcription-123"),
    ).resolves.toEqual(transcription);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(GetItemCommand);
  });

  it("updates a processing record to completed only after a transcript key exists", async () => {
    const completed = {
      contentType: "audio/mpeg",
      createdAt: "2026-08-14T10:00:00.000Z",
      fileName: "consulta.mp3",
      fileSize: 1024,
      id: "transcription-123",
      s3Key: "uploads/user-123/generated-consulta.mp3",
      status: "completed" as const,
      transcriptionS3Key: "transcriptions/user-123/transcription-123.txt",
      type: "file" as const,
      updatedAt: "2026-08-14T10:01:00.000Z",
      userId: "user-123",
    };
    const send = jest.fn().mockResolvedValue({ Attributes: marshall(completed) });
    const service = new DynamoDBService({ send } as unknown as DynamoDBClient);

    await expect(
      service.markTranscriptionCompleted(
        completed.id,
        completed.transcriptionS3Key,
      ),
    ).resolves.toEqual(completed);
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(UpdateItemCommand);
  });

});
