import { z } from "zod";

export const clientSchema = z.object({
  nombre: z
    .string()
    .min(1, "Ingresa el nombre"),

  razonSocial: z
    .string()
    .optional(),

  tipoDocumento: z.enum(["NIT", "CEDULA", "PASAPORTE"]),

  documento: z
    .string()
    .min(1, "Ingresa el documento"),

  direccion: z
    .string()
    .min(1, "Ingresa la dirección"),

  ciudad: z
    .string()
    .min(1, "Ingresa la ciudad"),

  telefono: z
    .string()
    .min(1, "Ingresa el teléfono celular"),

  correo: z
    .string()
    .min(1, "Ingresa el correo electrónico")
    .email("Ingresa un correo válido"),

  tipoPersona: z.enum(["NATURAL", "JURIDICA"]),

  observaciones: z
    .string()
    .optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>; 