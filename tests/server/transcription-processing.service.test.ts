import type { TranscriptionProcessingRepositoryPort } from "../../server/repositories/transcription.repository";
import { TranscriptionProcessingService } from "../../server/services/transcription-processing.service";
import type { S3Service } from "../../server/services/s3.service";
import type { SpeechmaticsBatchClient } from "../../server/services/speechmatics.service";
import type { Transcription } from "../../server/types/transcription";

const processingTranscription: Transcription = {
  contentType: "audio/mpeg",
  createdAt: "2026-08-14T10:00:00.000Z",
  fileName: "consulta.mp3",
  fileSize: 1024,
  id: "transcription-123",
  s3Key: "uploads/user-123/consulta.mp3",
  status: "processing",
  type: "file",
  updatedAt: "2026-08-14T10:00:00.000Z",
  userId: "user-123",
};

function createRepository(
  transcription: Transcription | null = processingTranscription,
): jest.Mocked<TranscriptionProcessingRepositoryPort> {
  return {
    getTranscriptionById: jest.fn().mockResolvedValue(transcription),
    markTranscriptionCompleted: jest.fn().mockImplementation(async ({
      transcriptionS3Key,
    }) => ({ ...processingTranscription, status: "completed", transcriptionS3Key })),
    markTranscriptionFailed: jest.fn().mockImplementation(async () => ({
      ...processingTranscription,
      status: "failed",
    })),
  };
}

function createStorage(): jest.Mocked<
  Pick<S3Service, "createSourceAudioDownloadUrl" | "putTranscriptionText">
> {
  return {
    createSourceAudioDownloadUrl: jest
      .fn()
      .mockResolvedValue("https://s3.example/source"),
    putTranscriptionText: jest.fn().mockResolvedValue(undefined),
  };
}

describe("TranscriptionProcessingService", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("stores the final text before marking an owned processing record as completed", async () => {
    const repository = createRepository();
    const storage = createStorage();
    const speechmatics: SpeechmaticsBatchClient = {
      transcribeFile: jest.fn().mockResolvedValue("Texto final."),
    };
    const service = new TranscriptionProcessingService(repository, storage, speechmatics);

    await service.process({ transcriptionId: "transcription-123", userId: "user-123" });

    expect(storage.putTranscriptionText).toHaveBeenCalledWith({
      objectKey: "transcriptions/user-123/transcription-123.txt",
      text: "Texto final.",
    });
    expect(repository.markTranscriptionCompleted).toHaveBeenCalledWith({
      id: "transcription-123",
      transcriptionS3Key: "transcriptions/user-123/transcription-123.txt",
    });
    expect(repository.markTranscriptionFailed).not.toHaveBeenCalled();
  });

  it("marks the record as failed when Speechmatics rejects the job", async () => {
    const repository = createRepository();
    const storage = createStorage();
    const speechmatics: SpeechmaticsBatchClient = {
      transcribeFile: jest.fn().mockRejectedValue(new Error("provider failed")),
    };
    const service = new TranscriptionProcessingService(repository, storage, speechmatics);

    await service.process({ transcriptionId: "transcription-123", userId: "user-123" });

    expect(repository.markTranscriptionFailed).toHaveBeenCalledWith("transcription-123");
    expect(repository.markTranscriptionCompleted).not.toHaveBeenCalled();
  });

  it("does not store or complete an empty Speechmatics transcript", async () => {
    const repository = createRepository();
    const storage = createStorage();
    const speechmatics: SpeechmaticsBatchClient = {
      transcribeFile: jest.fn().mockResolvedValue("   "),
    };
    const service = new TranscriptionProcessingService(
      repository,
      storage,
      speechmatics,
    );

    await service.process({
      transcriptionId: "transcription-123",
      userId: "user-123",
    });

    expect(storage.putTranscriptionText).not.toHaveBeenCalled();
    expect(repository.markTranscriptionCompleted).not.toHaveBeenCalled();
    expect(repository.markTranscriptionFailed).toHaveBeenCalledWith(
      "transcription-123",
    );
  });

  it("does not mark completed when writing the transcript to S3 fails", async () => {
    const repository = createRepository();
    const storage = createStorage();
    storage.putTranscriptionText.mockRejectedValue(new Error("S3 unavailable"));
    const speechmatics: SpeechmaticsBatchClient = {
      transcribeFile: jest.fn().mockResolvedValue("Texto final."),
    };
    const service = new TranscriptionProcessingService(repository, storage, speechmatics);

    await service.process({ transcriptionId: "transcription-123", userId: "user-123" });

    expect(repository.markTranscriptionCompleted).not.toHaveBeenCalled();
    expect(repository.markTranscriptionFailed).toHaveBeenCalledWith("transcription-123");
  });

  it.each([
    [null, "user-123"],
    [{ ...processingTranscription, status: "completed" } as Transcription, "user-123"],
    [processingTranscription, "another-user"],
  ])("ignores missing, non-processing, or non-owned work", async (transcription, userId) => {
    const repository = createRepository(transcription);
    const storage = createStorage();
    const speechmatics: SpeechmaticsBatchClient = { transcribeFile: jest.fn() };
    const service = new TranscriptionProcessingService(repository, storage, speechmatics);

    await service.process({ transcriptionId: "transcription-123", userId });

    expect(speechmatics.transcribeFile).not.toHaveBeenCalled();
    expect(storage.putTranscriptionText).not.toHaveBeenCalled();
    expect(repository.markTranscriptionCompleted).not.toHaveBeenCalled();
    expect(repository.markTranscriptionFailed).not.toHaveBeenCalled();
  });
});
