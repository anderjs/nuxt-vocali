import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Introduce tu nombre completo."),
    email: z.email("Introduce un correo electrónico válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula.")
      .regex(/[^A-Za-z0-9]/, "La contraseña debe incluir al menos un símbolo."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export type SignUpSchema = z.output<typeof signUpSchema>;

export const confirmSignUpSchema = z.object({
  confirmationCode: z.string().min(1, "Introduce el código de confirmación."),
});

export type ConfirmSignUpSchema = z.output<typeof confirmSignUpSchema>;
