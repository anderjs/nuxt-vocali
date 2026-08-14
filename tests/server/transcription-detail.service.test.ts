import type { TranscriptionLookupRepositoryPort } from "../../server/repositories/transcription.repository";
import {
  TranscriptionDetailNotFoundError,
  TranscriptionDetailService,
  type TranscriptionDetailStoragePort,
} from "../../server/services/transcription-detail.service";
import type { Transcription } from "../../server/types/transcription";

const transcription: Transcription = {
  createdAt: "2026-08-14T10:00:00.000Z",
  fileName: "transcripcion-2026-08-14.txt",
  id: "transcription-123",
  status: "completed",
  transcriptionS3Key: "transcriptions/user-123/transcription-123.txt",
  type: "realtime",
  updatedAt: "2026-08-14T10:00:00.000Z",
  userId: "user-123",
};

describe("TranscriptionDetailService", () => {
  it("returns an owned completed transcription with its private S3 text", async () => {
    const getTranscriptionById = jest.fn().mockResolvedValue(transcription);
    const getTranscriptionText = jest
      .fn()
      .mockResolvedValue("Texto de la transcripción.");
    const repository: TranscriptionLookupRepositoryPort = {
      getTranscriptionById,
    };
    const storage: TranscriptionDetailStoragePort = { getTranscriptionText };
    const service = new TranscriptionDetailService(repository, storage);

    await expect(
      service.getTranscription("user-123", transcription.id),
    ).resolves.toEqual({
      createdAt: transcription.createdAt,
      fileName: transcription.fileName,
      id: transcription.id,
      status: "completed",
      text: "Texto de la transcripción.",
      type: "realtime",
    });
    expect(getTranscriptionText).toHaveBeenCalledWith(
      transcription.transcriptionS3Key,
    );
  });

  it("does not expose a transcription owned by another user", async () => {
    const repository: TranscriptionLookupRepositoryPort = {
      getTranscriptionById: jest.fn().mockResolvedValue(transcription),
    };
    const storage: TranscriptionDetailStoragePort = {
      getTranscriptionText: jest.fn(),
    };
    const service = new TranscriptionDetailService(repository, storage);

    await expect(
      service.getTranscription("another-user", transcription.id),
    ).rejects.toBeInstanceOf(TranscriptionDetailNotFoundError);
    expect(storage.getTranscriptionText).not.toHaveBeenCalled();
  });

  it("does not read transcript content until the transcription is completed", async () => {
    const repository: TranscriptionLookupRepositoryPort = {
      getTranscriptionById: jest.fn().mockResolvedValue({
        ...transcription,
        status: "processing",
      }),
    };
    const storage: TranscriptionDetailStoragePort = {
      getTranscriptionText: jest.fn(),
    };
    const service = new TranscriptionDetailService(repository, storage);

    const result = await service.getTranscription("user-123", transcription.id);

    expect(result.text).toBeUndefined();
    expect(storage.getTranscriptionText).not.toHaveBeenCalled();
  });
});
