import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "Email es requerido" })
    .min(1, "Email es requerido")
    .email("Email invalido"),
  password: z
    .string({ error: "Password es requerido" })
    .min(1, "Password es requerido")
    .min(6, "Password debe tener más de 6 caracteres")
    .max(32, "Password debe tener menos de 32 caracteres"),
});

const userBaseSchema = z.object({
  name: z
    .string({ error: "Nombre es requerido" })
    .min(2, "Nombre debe tener más de 2 caracteres")
    .max(32, "Nombre debe tener menos de 32 caracteres"),
  email: z.email({ error: "Email es requerido" }),
  role: z.enum(["ASESOR", "FACTURADOR", "ADMINISTRADOR"], {
    message: "Selecciona el role de usuario",
  }),
});

export const registerSchema = userBaseSchema
  .extend({
    password: z
      .string({ error: "Password es requerido" })
      .min(1, "Password es requerido")
      .min(6, "Password debe tener más de 6 caracteres")
      .max(32, "Password debe tener menos de 32 caracteres"),

    confirmPassword: z
      .string({ error: "Confirm Password es requerido" })
      .min(1, "Confirm Password es requerido")
      .min(6, "Confirm Password debe tener más de 6 caracteres")
      .max(32, "Confirm Password debe tener menos de 32 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const updateSchema = userBaseSchema
  .extend({
    password: z.string(),

    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      if (!data.password && !data.confirmPassword) {
        return true;
      }

      if (!data.password || !data.confirmPassword) {
        return false;
      }

      return data.password === data.confirmPassword;
    },
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    },
  );

export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateFormData = z.infer<typeof updateSchema>;

export type UserFormData = {
  name: string;
  email: string;
  role: "ASESOR" | "FACTURADOR" | "ADMINISTRADOR";
  password: string;
  confirmPassword: string;
};