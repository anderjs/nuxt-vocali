import { z } from "zod";

export const authUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  email: z.email().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
