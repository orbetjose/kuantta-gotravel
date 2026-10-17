import { z } from "zod";

export const providerSchema = z.object({
  razonSocial: z
    .string()
    .min(1, "Ingresa la razón social"),

  nombreComercial: z
    .string()
    .optional(),

  nit: z
    .string()
    .min(1, "Ingresa el NIT"),

  categoria: z.enum([
    "HOTEL_CADENA",
    "ASISTENCIA_MEDICA",
    "TECNOLOGIA_GDS",
    "CONSOLIDADOR",
    "MAYORISTA",
    "AEROLINEA",
    "HOTEL_PLATAFORMA",
    "TRANSPORTE_TERRESTRE",
  ]),

  ciudad: z
    .string()
    .min(1, "Ingresa la ciudad"),

  direccion: z
    .string()
    .min(1, "Ingresa la dirección"),

  telefono: z
    .string()
    .min(1, "Ingresa el teléfono"),

  correoComercial: z
    .string()
    .email("Ingresa un correo comercial válido")
    .optional()
    .or(z.literal("")),

  correoFacturacion: z
    .string()
    .email("Ingresa un correo de facturación válido")
    .optional()
    .or(z.literal("")),

  contacto: z
    .string()
    .optional(),

  remuneracion: z.enum([
    "COMISION",
    "NETO_MARKUP",
  ]),

  monedaBase: z.enum([
    "COP",
    "USD",
    "EUR",
  ]),

  condicionPago: z.enum([
    "INMEDIATO",
    "CREDITO",
  ]),

  documentosPdf: z
    .array(z.string())
    .max(4, "Puedes adjuntar máximo 4 documentos PDF")
    .default([]),
});

export type ProviderFormValues = z.infer<typeof providerSchema>;
export type ProviderFormInput = z.input<typeof providerSchema>;
export type ProviderFormData = z.output<typeof providerSchema>;