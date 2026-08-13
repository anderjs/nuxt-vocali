import type { AttributeValue } from "@aws-sdk/client-dynamodb";

export type DynamoDBCursorKey = Record<string, AttributeValue>;

export function encodeDynamoDBCursor(
  cursorKey: DynamoDBCursorKey | undefined,
): string | null {
  if (!cursorKey) {
    return null;
  }

  return Buffer.from(JSON.stringify(cursorKey)).toString("base64url");
}

export function decodeDynamoDBCursor(
  cursor: string | undefined,
): DynamoDBCursorKey | undefined {
  if (!cursor) {
    return undefined;
  }

  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as DynamoDBCursorKey;
}
