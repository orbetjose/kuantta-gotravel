import { z } from "zod";

export const notaSchema = z.object({
  titulo: z.string().min(1, "Ingresa el titulo de la nota"),
  contenido: z.string().min(1, "Ingrese el contenido de l anota"),
});

export type NotaFormValues = z.infer<typeof notaSchema>;
