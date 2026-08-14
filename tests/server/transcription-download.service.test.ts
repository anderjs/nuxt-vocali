import type { TranscriptionLookupRepositoryPort } from "../../server/repositories/transcription.repository";
import {
  TranscriptionDownloadService,
  TranscriptionNotFoundError,
  TranscriptionNotReadyForDownloadError,
  type TranscriptionDownloadStoragePort,
} from "../../server/services/transcription-download.service";
import type { Transcription } from "../../server/types/transcription";

const completedTranscription: Transcription = {
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

describe("TranscriptionDownloadService", () => {
  it("creates a download URL only for the completed transcription owner", async () => {
    const getTranscriptionById = jest.fn().mockResolvedValue(completedTranscription);
    const createTranscriptionDownloadUrl = jest
      .fn()
      .mockResolvedValue("https://example.com/signed-download");
    const repository: TranscriptionLookupRepositoryPort = {
      getTranscriptionById,
    };
    const storage: TranscriptionDownloadStoragePort = {
      createTranscriptionDownloadUrl,
    };
    const service = new TranscriptionDownloadService(repository, storage);

    await expect(
      service.createDownloadUrl("user-123", "transcription-123"),
    ).resolves.toBe("https://example.com/signed-download");
    expect(createTranscriptionDownloadUrl).toHaveBeenCalledWith({
      fileName: "consulta.mp3",
      objectKey: "transcriptions/user-123/transcription-123.txt",
    });
  });

  it("does not disclose a transcription owned by another user", async () => {
    const repository: TranscriptionLookupRepositoryPort = {
      getTranscriptionById: jest.fn().mockResolvedValue(completedTranscription),
    };
    const storage: TranscriptionDownloadStoragePort = {
      createTranscriptionDownloadUrl: jest.fn(),
    };
    const service = new TranscriptionDownloadService(repository, storage);

    await expect(
      service.createDownloadUrl("another-user", "transcription-123"),
    ).rejects.toBeInstanceOf(TranscriptionNotFoundError);
  });

  it.each([
    { ...completedTranscription, status: "processing" as const },
    { ...completedTranscription, transcriptionS3Key: undefined },
  ])("rejects a transcription that is not ready", async (transcription) => {
    const repository: TranscriptionLookupRepositoryPort = {
      getTranscriptionById: jest.fn().mockResolvedValue(transcription),
    };
    const storage: TranscriptionDownloadStoragePort = {
      createTranscriptionDownloadUrl: jest.fn(),
    };
    const service = new TranscriptionDownloadService(repository, storage);

    await expect(
      service.createDownloadUrl("user-123", "transcription-123"),
    ).rejects.toBeInstanceOf(TranscriptionNotReadyForDownloadError);
  });
});
