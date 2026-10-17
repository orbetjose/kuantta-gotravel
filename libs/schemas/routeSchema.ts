import { z } from "zod";

export const routeSchema = z.object({
  codigoIATA: z.string().min(1, "Ingresa el codigo IATA"),

  nombreAeropuerto: z.string().min(1, "Ingresa el nombre del aeropuerto"),

  ciudad: z.string().min(1, "Ingresa la ciudad"),

  pais: z.string().min(1, "Ingresa el pais"),

  region: z.string().min(1, "Ingresa la región"),
});

export type RouteFormValues = z.infer<typeof routeSchema>;
export type RouteFormInput = z.input<typeof routeSchema>;
export type RouteFormData = z.output<typeof routeSchema>;
