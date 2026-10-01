import * as z from "zod";

export const loginSchema = z.object({
  email: z.string({ error: "Email es requerido" }).min(1, "Email es requerido").email("Email invalido"),
  password: z.string({ error: "Password es requerido" })
    .min(1, "Password es requerido")
    .min(6, "Password debe tener más de 6 caracteres")
    .max(32, "Password debe tener menos de 32 caracteres"),
});

export const registerSchema = z.object({
  email: z.email({ error: "Email es requerido" }),
  password: z.string({ error: "Password es requerido" })
    .min(1, "Password es requerido")
    .min(6, "Password debe tener más de 6 caracteres")
    .max(32, "Password debe tener menos de 32 caracteres"),
  name: z.string({ error: "Nombre es requerido" })
    .min(2, "Nombre debe tener más de 2 caracteres")
    .max(32, "Nombre debe tener menos de 32 caracteres"),
  confirmPassword: z.string({ error: "Confirm Password es requerido" })
    .min(1, "Confirm Password es requerido")
    .min(6, "Confirm Password debe tener más de 6 caracteres")
    .max(32, "Confirm Password debe tener menos de 32 caracteres"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;


