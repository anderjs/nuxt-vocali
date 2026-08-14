import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import { z } from "zod";

export type DynamoDBCursorKey = Record<string, AttributeValue>;

const stringAttributeSchema = z.object({ S: z.string().min(1) }).strict();

const dynamoDBCursorSchema = z
  .object({
    createdAt: stringAttributeSchema,
    id: stringAttributeSchema,
    userId: stringAttributeSchema,
  })
  .strict();

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

  const decodedCursor: unknown = JSON.parse(
    Buffer.from(cursor, "base64url").toString("utf8"),
  );

  return dynamoDBCursorSchema.parse(decodedCursor);
}

export function isValidDynamoDBCursor(cursor: string): boolean {
  try {
    decodeDynamoDBCursor(cursor);
    return true;
  } catch {
    return false;
  }
}
