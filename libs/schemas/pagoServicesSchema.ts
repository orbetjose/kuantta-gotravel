import { z } from "zod";

export const paymentSchema = z.object({
  fechaPagoCliente: z
    .string()
    .min(1, "La fecha de pago es obligatoria."),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;