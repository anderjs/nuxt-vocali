import { listTranscriptionsQuerySchema } from "../../server/types/transcription";
import {
  decodeDynamoDBCursor,
  encodeDynamoDBCursor,
} from "../../server/utils/pagination";

const cursorKey = {
  createdAt: { S: "2026-08-14T10:00:00.000Z" },
  id: { S: "transcription-123" },
  userId: { S: "user-123" },
};

describe("transcription pagination cursor", () => {
  it("round-trips the DynamoDB key used by the user-createdAt index", () => {
    const cursor = encodeDynamoDBCursor(cursorKey);

    expect(cursor).not.toBeNull();
    expect(decodeDynamoDBCursor(cursor ?? undefined)).toEqual(cursorKey);
  });

  it.each([
    "not-base64-json",
    Buffer.from(JSON.stringify({ id: { S: "transcription-123" } })).toString(
      "base64url",
    ),
  ])("rejects malformed cursors before repository access", (cursor) => {
    expect(
      listTranscriptionsQuerySchema.safeParse({ cursor, limit: 10 }).success,
    ).toBe(false);
  });
});
