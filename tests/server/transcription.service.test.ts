import type { TranscriptionRepositoryPort } from "../../server/repositories/transcription.repository";
import {
  InvalidUploadObjectKeyError,
  TranscriptionService,
} from "../../server/services/transcription.service";
import type { S3Service } from "../../server/services/s3.service";
import type { TranscriptionProcessingDispatcherPort } from "../../server/services/transcription-processing-dispatcher.service";
import {
  createRealtimeTranscriptionRequestSchema,
  type CreateFileTranscriptionRequestDto,
  type CreateRealtimeTranscriptionRequestDto,
  type Transcription,
} from "../../server/types/transcription";

const validRequest: CreateFileTranscriptionRequestDto = {
  contentType: "audio/mpeg",
  fileName: "consulta.mp3",
  fileSize: 1024,
  s3Key: "uploads/user-123/generated-consulta.mp3",
  type: "file",
};

const realtimeRequest: CreateRealtimeTranscriptionRequestDto = {
  endedAt: "2026-08-14T10:05:00.000Z",
  startedAt: "2026-08-14T10:00:00.000Z",
  text: "Transcripción final.",
  type: "realtime",
};

const dispatcher: TranscriptionProcessingDispatcherPort = {
  dispatch: jest.fn().mockResolvedValue(undefined),
};

describe("TranscriptionService", () => {
  it("creates a processing transcription after receiving valid upload metadata", async () => {
    const createTranscription = jest.fn(
      async (transcription: Transcription): Promise<Transcription> =>
        transcription,
    );
    const repository: TranscriptionRepositoryPort = {
      createTranscription,
      markTranscriptionFailed: jest.fn(),
    };
    const service = new TranscriptionService(repository, undefined, dispatcher);

    const transcription = await service.createFileTranscription(
      "user-123",
      validRequest,
    );

    expect(transcription).toMatchObject({
      contentType: "audio/mpeg",
      fileName: "consulta.mp3",
      fileSize: 1024,
      s3Key: validRequest.s3Key,
      status: "processing",
      type: "file",
      userId: "user-123",
    });
    expect(createTranscription).toHaveBeenCalledWith(transcription);
    expect(dispatcher.dispatch).toHaveBeenCalledWith({
      transcriptionId: transcription.id,
      userId: "user-123",
    });
  });

  it("marks the record as failed when asynchronous dispatch cannot be started", async () => {
    const createTranscription = jest.fn(
      async (transcription: Transcription): Promise<Transcription> => transcription,
    );
    const markTranscriptionFailed = jest.fn().mockResolvedValue({});
    const failingDispatcher: TranscriptionProcessingDispatcherPort = {
      dispatch: jest.fn().mockRejectedValue(new Error("Lambda unavailable")),
    };
    const repository: TranscriptionRepositoryPort = {
      createTranscription,
      markTranscriptionFailed,
    };
    const service = new TranscriptionService(
      repository,
      undefined,
      failingDispatcher,
    );

    await expect(
      service.createFileTranscription("user-123", validRequest),
    ).rejects.toThrow("Lambda unavailable");
    expect(markTranscriptionFailed).toHaveBeenCalledTimes(1);
  });

  it("rejects a key belonging to another user before persistence", async () => {
    const createTranscription = jest.fn();
    const repository: TranscriptionRepositoryPort = {
      createTranscription,
      markTranscriptionFailed: jest.fn(),
    };
    const service = new TranscriptionService(repository, undefined, dispatcher);

    await expect(
      service.createFileTranscription("user-123", {
        ...validRequest,
        s3Key: "uploads/another-user/generated-consulta.mp3",
      }),
    ).rejects.toBeInstanceOf(InvalidUploadObjectKeyError);
    expect(createTranscription).not.toHaveBeenCalled();
  });

  it("stores a completed realtime transcript before creating its history record", async () => {
    const createTranscription = jest.fn(
      async (transcription: Transcription): Promise<Transcription> =>
        transcription,
    );
    const putTranscriptionText = jest.fn().mockResolvedValue(undefined);
    const repository: TranscriptionRepositoryPort = {
      createTranscription,
      markTranscriptionFailed: jest.fn(),
    };
    const storage: Pick<S3Service, "putTranscriptionText"> = {
      putTranscriptionText,
    };
    const service = new TranscriptionService(repository, storage, dispatcher);

    const transcription = await service.createRealtimeTranscription(
      "user-123",
      realtimeRequest,
    );

    expect(putTranscriptionText).toHaveBeenCalledWith({
      objectKey: `transcriptions/user-123/${transcription.id}.txt`,
      text: realtimeRequest.text,
    });
    expect(transcription).toMatchObject({
      status: "completed",
      type: "realtime",
      userId: "user-123",
    });
    expect(transcription.text).toBeUndefined();
    expect(transcription.transcriptionS3Key).toBe(
      `transcriptions/user-123/${transcription.id}.txt`,
    );
    expect(createTranscription).toHaveBeenCalledWith(transcription);
  });

  it("does not create a history record when storing the realtime text fails", async () => {
    const createTranscription = jest.fn();
    const putTranscriptionText = jest
      .fn()
      .mockRejectedValue(new Error("S3 unavailable"));
    const repository: TranscriptionRepositoryPort = {
      createTranscription,
      markTranscriptionFailed: jest.fn(),
    };
    const storage: Pick<S3Service, "putTranscriptionText"> = {
      putTranscriptionText,
    };
    const service = new TranscriptionService(repository, storage, dispatcher);

    await expect(
      service.createRealtimeTranscription("user-123", realtimeRequest),
    ).rejects.toThrow("S3 unavailable");
    expect(createTranscription).not.toHaveBeenCalled();
  });

  it("rejects empty realtime text and frontend user identity fields", () => {
    expect(
      createRealtimeTranscriptionRequestSchema.safeParse({
        ...realtimeRequest,
        text: " ",
      }).success,
    ).toBe(false);
    expect(
      createRealtimeTranscriptionRequestSchema.safeParse({
        ...realtimeRequest,
        userId: "another-user",
      }).success,
    ).toBe(false);
  });
});
