import { z } from "zod";

export const routeSchema = z.object({
  origen: z
    .string()
    .min(1, "Ingresa el origen"),

  codigoOrigen: z
    .string()
    .min(1, "Ingresa el código de origen")
    .length(3, "El código debe tener 3 caracteres"),

  destino: z
    .string()
    .min(1, "Ingresa el destino"),

  codigoDestino: z
    .string()
    .min(1, "Ingresa el código de destino")
    .length(3, "El código debe tener 3 caracteres"),
});

export type RouteFormValues = z.infer<typeof routeSchema>;