import * as z from "zod";

export const ticketSchema = z
  .object({
    // Información general
    clienteId: z.coerce.number().min(1, "Selecciona un cliente"),
    pasajeroId: z.coerce.number().min(1, "Selecciona un pasajero"),

    fechaEmision: z.string().min(1, "Selecciona la fecha de emisión"),

    proveedorId: z.coerce.number().min(1, "Selecciona un proveedor"),

    facturaProveedor: z.instanceof(File, {
      message: "Debes adjuntar la factura del proveedor",
    }).optional(),

    numeroTiquete: z.string().min(1, "Ingresa el número de tiquete"),

    soporteTiquete: z.instanceof(File, {
      message: "Debes adjuntar el soporte del tiquete",
    }).optional(),

    // Revisión
    revision: z.enum(["SI", "NO"], {
      message: "Selecciona una opción",
    }),

    numeroTiqueteRevision: z.string().optional(),

    // Información del viaje
    rutaId: z.coerce.number().min(1, "Selecciona una ruta"),
    
    clase: z.string().min(1, "Ingresa la clase"),

    fechaIda: z.string().min(1, "Selecciona la fecha de ida"),

    fechaRegreso: z.string().optional(),

    aph: z.enum(["NACIONAL", "INTERNACIONAL"], {
      message: "Selecciona el tipo de APH",
    }),

    // Valores del tiquete
    tarifaNeta: z.coerce
      .number({
        message: "Ingresa una tarifa neta válida",
      })
      .min(0, "La tarifa no puede ser negativa"),

    ivaTarifa: z.coerce
      .number({
        message: "Ingresa un iva tarifa válido",
      })
      .min(0, "El iva tarifa no puede ser negativo"),

    otrosImpuestos: z.coerce
      .number({
        message: "Ingresa una tasa aeroportuaria válida",
      })
      .min(0, "La tasa no puede ser negativa"),

    tarifaAdministrativaNeta: z.coerce
      .number({
        message: "Ingresa una tarifa administrativa válida",
      })
      .min(0, "La tarifa no puede ser negativa"),

    ivaTarifaAdministrativa: z.coerce
      .number({
        message: "Ingresa un iva tarifa administrativa válido",
      })
      .min(0, "El iva tarifa administrativa no puede ser negativo"),

    feeAgenciaNeta: z.coerce
      .number({
        message: "Ingresa un fee de agencia válido",
      })
      .min(0, "El fee no puede ser negativo"),
    ivaFeeAgencia: z.coerce
      .number({
        message: "Ingresa un iva fee agencia válido",
      })
      .min(0, "El iva fee agencia no puede ser negativo"),

    feePagoTarjeta: z.coerce
      .number({
        message: "Ingresa un fee válido",
      })
      .min(0, "El fee no puede ser negativo")
      .default(0),

    // Pago
    formaPago: z.enum(["CASH", "TARJETA_CREDITO", "CREDITO_AGENCIA"], {
      message: "Selecciona un método de pago",
    }),

    creditoAgencia: z.enum(["3", "8", "15", "30"]).optional(),

    numeroTarjeta: z.string().optional(),

    numeroAprobacion: z.string().optional(),

    tipoCash: z.enum(["EFECTIVO", "TRANSFERENCIA"]).optional(),

    // Información adicional
    ceCos: z.string().optional(),

    proyectoFCDS: z.string().optional(),

    facturaGoTravel: z.instanceof(File, {
      message: "Debes adjuntar la factura de Go Travel",
    }).optional(),

    observaciones: z
      .string()
      .max(240, "Las observaciones no pueden superar los 240 caracteres")
      .optional(),

    fechaEmisionTiqueteFES: z
      .string()
      .min(1, "Selecciona la fecha de emisión del tiquete"),
  })

  // Revisión = SI → número de tiquete obligatorio
  .refine(
    (data) =>
      data.revision === "NO" || data.numeroTiqueteRevision?.trim() !== "",
    {
      path: ["numeroTiqueteRevision"],
      message: "Ingresa el número de tiquete de revisión",
    },
  )

  // Pago = CRÉDITO AGENCIA → plazo obligatorio
  .refine(
    (data) =>
      data.formaPago !== "CREDITO_AGENCIA" || data.creditoAgencia !== undefined,
    {
      path: ["creditoAgencia"],
      message: "Selecciona el plazo del crédito",
    },
  )

  // Pago = TARJETA CRÉDITO → número de tarjeta obligatorio
  .refine(
    (data) =>
      data.formaPago !== "TARJETA_CREDITO" || data.numeroTarjeta?.trim() !== "",
    {
      path: ["numeroTarjeta"],
      message: "Ingresa el número de tarjeta",
    },
  )

  // Pago = TARJETA CRÉDITO → número de aprobación obligatorio
  .refine(
    (data) =>
      data.formaPago !== "TARJETA_CREDITO" || data.numeroAprobacion?.trim() !== "",
    {
      path: ["numeroAprobacion"],
      message: "Ingresa el número de aprobación",
    },
  )

  // Pago = CASH → tipo de pago obligatorio
  .refine((data) => data.formaPago !== "CASH" || data.tipoCash !== undefined, {
    path: ["tipoCash"],
    message: "Selecciona el tipo de pago",
  });

export type TicketFormInput = z.input<typeof ticketSchema>;
export type TicketFormValues = z.output<typeof ticketSchema>;

export type TicketFormInitialData = Omit<
  TicketFormValues,
  "facturaProveedor" | "soporteTiquete" | "facturaGoTravel" | "proveedorId"
> & {
  proveedorId?: number;
  totalPagar: number;
};