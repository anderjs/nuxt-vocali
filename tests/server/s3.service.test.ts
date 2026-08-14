import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Service } from "../../server/services/s3.service";

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

describe("S3Service", () => {
  it("signs a short-lived PUT for the validated content type and size", async () => {
    const mockedGetSignedUrl = jest.mocked(getSignedUrl);
    mockedGetSignedUrl.mockResolvedValue("https://example.com/signed-upload");
    const service = new S3Service();

    const result = await service.createUploadUrl({
      contentType: "audio/mpeg",
      fileName: "consulta.mp3",
      fileSize: 1024,
      userId: "user-123",
    });

    const command = mockedGetSignedUrl.mock.calls[0]?.[1];

    expect(command).toBeInstanceOf(PutObjectCommand);
    expect((command as PutObjectCommand).input).toMatchObject({
      Bucket: "vocali-test",
      ContentLength: 1024,
      ContentType: "audio/mpeg",
    });
    expect(mockedGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(PutObjectCommand),
      { expiresIn: 300 },
    );
    expect(result.objectKey).toMatch(/^uploads\/user-123\//);
  });

  it("signs a short-lived private URL for Speechmatics to fetch source audio", async () => {
    const mockedGetSignedUrl = jest.mocked(getSignedUrl);
    mockedGetSignedUrl.mockResolvedValue("https://example.com/source-audio");
    const service = new S3Service();

    await expect(
      service.createSourceAudioDownloadUrl("uploads/user-123/consulta.mp3"),
    ).resolves.toBe("https://example.com/source-audio");
    expect(mockedGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      { expiresIn: 900 },
    );
  });

  it("signs a short-lived attachment download for a transcription result", async () => {
    const mockedGetSignedUrl = jest.mocked(getSignedUrl);
    mockedGetSignedUrl.mockResolvedValue("https://example.com/signed-download");
    const service = new S3Service();

    const downloadUrl = await service.createTranscriptionDownloadUrl({
      fileName: "consulta.mp3",
      objectKey: "transcriptions/user-123/transcription-123.txt",
    });

    const command = mockedGetSignedUrl.mock.calls[0]?.[1];

    expect(command).toBeInstanceOf(GetObjectCommand);
    expect((command as GetObjectCommand).input).toMatchObject({
      Bucket: "vocali-test",
      Key: "transcriptions/user-123/transcription-123.txt",
      ResponseContentDisposition: 'attachment; filename="consulta.txt"',
      ResponseContentType: "text/plain; charset=utf-8",
    });
    expect(mockedGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      { expiresIn: 300 },
    );
    expect(downloadUrl).toBe("https://example.com/signed-download");
  });
  it("stores realtime text privately with the expected content type", async () => {
    const send = jest
      .spyOn(S3Client.prototype, "send")
      .mockResolvedValue({} as never);
    const service = new S3Service();

    await service.putTranscriptionText({
      objectKey: "transcriptions/user-123/transcription-123.txt",
      text: "Transcripción final.",
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Body: "Transcripción final.",
          Bucket: "vocali-test",
          ContentType: "text/plain; charset=utf-8",
          Key: "transcriptions/user-123/transcription-123.txt",
        }),
      }),
    );

    send.mockRestore();
  });

});
