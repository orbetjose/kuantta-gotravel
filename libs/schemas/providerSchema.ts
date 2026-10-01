import { z } from "zod";

export const providerSchema = z.object({
  razonSocial: z
    .string()
    .min(1, "Ingresa la razón social"),

  ruc: z
    .string()
    .min(1, "Ingresa el RUC"),
  direccionFiscal: z
    .string()
    .min(1, "Ingresa la dirección fiscal"),

  telefono: z
    .string()
    .min(1, "Ingresa el teléfono"),

  correo: z
    .string()
    .min(1, "Ingresa el correo")
    .email("Ingresa un correo válido"),
});

export type ProviderFormValues = z.infer<typeof providerSchema>;