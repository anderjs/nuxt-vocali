import {
  createUploadObjectKey,
  isUploadObjectKeyOwnedByUser,
} from "../../server/utils/storage";

describe("upload object keys", () => {
  it("generates a sanitized user-scoped S3 key", () => {
    const userId = "user-123";
    const prefix = `uploads/${userId}/`;
    const objectKey = createUploadObjectKey(
      userId,
      "../consulta médica.mp3",
    );

    expect(objectKey).toMatch(/^uploads\/user-123\//);
    expect(objectKey.slice(prefix.length)).not.toMatch(/[\\/]/);
    expect(objectKey.endsWith("consulta_m_dica.mp3")).toBe(true);
  });

  it("does not accept another user's S3 key", () => {
    expect(
      isUploadObjectKeyOwnedByUser(
        "uploads/another-user/audio.mp3",
        "user-123",
      ),
    ).toBe(false);
  });
});
