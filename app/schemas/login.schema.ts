import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Introduce un correo electrónico válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export type LoginSchema = z.output<typeof loginSchema>;
