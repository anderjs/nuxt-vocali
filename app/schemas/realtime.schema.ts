import { z } from "zod";

export const realtimeCredentialSchema = z.object({
  token: z.string().min(1),
});

export type RealtimeCredential = z.infer<typeof realtimeCredentialSchema>;
