import { z } from "zod";

export const authUserSchema = z.object({
  sub: z.string().min(1).nullable(),
  email: z.email().nullable(),
  name: z.string().min(1).nullable(),
  givenName: z.string().min(1).nullable(),
  picture: z.url().nullable(),
});

export const authStateSchema = z.object({
  user: authUserSchema.nullable(),
  authenticated: z.boolean(),
  loading: z.boolean(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthState = z.infer<typeof authStateSchema>;
