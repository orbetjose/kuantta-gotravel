import * as z from "zod";

export const serviceSchema = z
  .object({
    tipoServicio: z.enum(
      [
        "HOTEL",
        "ALQUILER_AUTO",
        "SALON",
        "EVENTO",
        "SILLA",
        "TARJETA_ASISTENCIA",
        "TRASLADO",
        "VISA",
        "WEB_CHECKIN",
        "PLAN_VACACIONAL",
      ],
      {
        message: "Selecciona un tipo de servicio",
      },
    ),
    clienteId: z.coerce.number().min(1, "Selecciona un cliente"),
    pasajeroId: z.coerce.number().min(1, "Selecciona un pasajero"),
    fechaEmision: z.string().min(1, "Selecciona la fecha de emisión"),

    proveedorId: z.coerce.number().min(1, "Selecciona un proveedor"),

    facturaProveedor: z.instanceof(File, {
      message: "Debes adjuntar la factura del proveedor",
    }).optional(),
    soporteTiquete: z.instanceof(File, {
      message: "Debes adjuntar el soporte del tiquete",
    }).optional(),
    facturaGoTravel: z.instanceof(File, {
      message: "Debes adjuntar la factura de Go Travel",
    }).optional(),
    descripcionServicio: z
      .string()
      .max(240, "Las descripciones no pueden superar los 240 caracteres"),
    codigoReserva: z.string().min(1, "Ingresa el codigo de reserva"),
    valorPagadoProveedor: z.coerce
      .number({
        message: "Ingresa un valor válido",
      })
      .min(0, "El pago no puede ser negativa"),

    trm: z.coerce
      .number({
        message: "Ingresa un valor válido",
      })
      .min(0, "El TRM no puede ser negativo"),
    feePagoTarjetaCredito: z.coerce
      .number({
        message: "Ingresa un valor válido",
      })
      .min(0, "El fee no puede ser negativo"),

    formaPago: z.enum(["CASH", "TARJETA_CREDITO", "CREDITO_AGENCIA"], {
      message: "Selecciona un método de pago",
    }),
    creditoAgencia: z.enum(["3", "8", "15", "30"]).optional(),

    numeroTarjeta: z.string().optional(),

    numeroAprobacion: z.string().optional(),

    tipoCash: z.enum(["EFECTIVO", "TRANSFERENCIA"]).optional(),
    ceCos: z.string().optional(),

    proyectoFCDS: z.string().optional(),
    vencimientoFacturaProveedor: 
      z.string().optional(),
    pagadoProveedor: z.enum(["SI", "NO", "NO_APLICA"], {
      message: "Selecciona una opción",
    }),
    fechaPagoProveedor: z
      .string().optional(),

    fechaPagoCliente: z.string().min(1, "Selecciona la fecha de pago cliente").optional(),
    observaciones: z
      .string()
      .max(240, "Las observaciones no pueden superar los 240 caracteres"),
  })
  .refine(
    (data) => {
      if (data.pagadoProveedor === "SI") {
        return !!data.fechaPagoProveedor;
      }

      return true;
    },
    {
      message:
        "La fecha de pago es obligatoria cuando el proveedor ya fue pagado.",
      path: ["fechaPagoProveedor"],
    },
  )
  .refine(
    (data) => {
      if (data.pagadoProveedor !== "SI" && data.fechaPagoProveedor) {
        return false;
      }

      return true;
    },
    {
      message: "No debe existir una fecha si el proveedor no ha sido pagado.",
      path: ["fechaPagoProveedor"],
    },
  );

export type ServiceFormInput = z.input<typeof serviceSchema>;
export type ServiceFormValues = z.output<typeof serviceSchema>;

export type ServiceFormInitialData = Omit<
  ServiceFormValues,
  "facturaProveedor" | "soporteTiquete" | "facturaGoTravel" | "proveedorId"
> & {
  proveedorId?: number;
  totalIngreso: number;
};
