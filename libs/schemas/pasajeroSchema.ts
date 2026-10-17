import { z } from "zod";

export const pasajeroSchema = z.object({
  nombre: z.string().min(1, "Ingresa los nombres"),

  apellido: z.string().min(1, "Ingresa los apellidos"),

  documento: z.string().min(1, "Ingresa el documento"),

  fechaNacimiento: z.string().min(1, "Ingresa una fecha de nacimiento válida"),

  correo: z
    .string()
    .min(1, "Ingresa el correo")
    .email("Ingresa un correo válido"),

  telefono: z.string().min(1, "Ingresa el celular"),

  preferenciaSilla: z.enum(["VENTANA", "PASILLO"], {
    error: "Selecciona una preferencia de silla",
  }),
});

export type PasajeroFormValues = z.infer<typeof pasajeroSchema>;
export type PasajeroFormInput = z.input<typeof pasajeroSchema>;
export type PasajeroFormData = z.output<typeof pasajeroSchema>;
