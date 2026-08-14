import {
  createTranscriptionRequestSchema,
  createUploadUrlRequestSchema,
} from "../../server/types/transcription";
import { MAX_AUDIO_UPLOAD_SIZE_BYTES } from "../../server/utils/storage";

describe("audio upload validation", () => {
  it("rejects files larger than 20 MB", () => {
    const result = createUploadUrlRequestSchema.safeParse({
      contentType: "audio/mpeg",
      fileName: "consulta.mp3",
      fileSize: MAX_AUDIO_UPLOAD_SIZE_BYTES + 1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported content types", () => {
    const result = createUploadUrlRequestSchema.safeParse({
      contentType: "video/mp4",
      fileName: "consulta.mp3",
      fileSize: 1024,
    });

    expect(result.success).toBe(false);
  });

  it("validates the metadata used to create a transcription", () => {
    const result = createTranscriptionRequestSchema.safeParse({
      contentType: "audio/mpeg",
      fileName: "consulta.mp3",
      fileSize: 1024,
      s3Key: "uploads/user-123/file.mp3",
      type: "file",
    });

    expect(result.success).toBe(true);
  });
});
