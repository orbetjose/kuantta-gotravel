import { z } from "zod";

export const clientSchema = z.object({
  nombre: z
    .string()
    .min(1, "Ingresa el nombre"),

  apellido: z
    .string()
    .min(1, "Ingresa el apellido"),

  correo: z
    .string()
    .min(1, "Ingresa el correo")
    .email("Ingresa un correo válido"),

  telefono: z
    .string()
    .min(1, "Ingresa el teléfono"),
});

export type ClientFormValues = z.infer<typeof clientSchema>;