import type { z } from "zod";

export function parseJsonBody<TSchema extends z.ZodType>(
  schema: TSchema,
  body: string | undefined,
): z.infer<TSchema> {
  return schema.parse(body ? JSON.parse(body) : {});
}

export function parseUnknown<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.infer<TSchema> {
  return schema.parse(value);
}
