import * as z from "zod";

export const serviceSchema = z
  .object({
    // Relaciones
    clienteId: z.string().min(1, "Selecciona un cliente"),
    proveedorId: z.string().optional(),
    pasajeroId: z.string().min(1, "Selecciona un pasajero"),
    estado: z.enum([
      "BORRADOR",
      "POR_FACTURAR",
      "DEVUELTO",
      "FACTURADO",
      "ANULADO",
    ]),

    // Servicio
    tipo: z.enum(
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
      { message: "Selecciona un tipo de servicio" },
    ),

    fechaEmision: z.string().min(1, "Selecciona la fecha de emisión"),
    fechaSolicitud: z.string().min(1, "Selecciona la fecha de solicitud"),

    facturaProveedorUrl: z.instanceof(File).optional(),
    facturaGoTravelUrl: z.instanceof(File).optional(),
    soporteTiqueteElectronicoUrl: z.instanceof(File).optional(),
    comprobantePagoUrl: z
      .instanceof(File)
      .refine(
        (file) =>
          ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
        "Solo se permiten archivos PDF, JPG o PNG",
      )
      .optional(),

    observaciones: z
      .string()
      .max(240, "Las observaciones no pueden superar los 240 caracteres"),

    // Forma de pago
    formaPago: z.enum(["CASH", "TARJETA_CREDITO", "CREDITO_AGENCIA", "OTROS"], {
      message: "Selecciona un método de pago",
    }),

    tipoCash: z.enum(["EFECTIVO", "TRANSFERENCIA"]).optional(),
    numeroTarjeta: z.string().optional(),
    numeroAprobacion: z.string().optional(),
    creditoAgencia: z.number().optional(),

    // Administración
    proyectoFCDS: z.string().optional(),
    ceCos: z.string().optional(),
    vencimientoFacturaProveedor: z.string().optional(),

    pagadoProveedor: z.enum(["SI", "NO", "NO_APLICA"]),
    fechaPagoProveedor: z.string().optional(),
    fechaPagoCliente: z.string().optional(),
    pagadoCliente: z.boolean(),

    // DetalleServicio
    descripcionServicio: z
      .string()
      .min(1, "Ingresa la descripción del servicio")
      .max(240, "La descripción no puede superar los 240 caracteres"),

    codigoReserva: z.string().min(1, "Ingresa el código de reserva"),
    ciudad: z.string().min(1, "Ingresa la ciudad"),
    pais: z.string().min(1, "Ingresa el país"),

    fechaIngreso: z.string().optional(),
    fechaSalida: z.string().optional(),

    tarifaNeta: z.number().min(0, "La tarifa no puede ser negativa"),
    ivaTarifa: z.number().min(0, "El IVA no puede ser negativo"),

    feePagoTarjetaCredito: z.number().min(0, "El fee no puede ser negativo"),

    totalVentaAgencia: z
      .number()
      .min(0, "El total de venta no puede ser negativo"),

    tarifaNetaProveedor: z
      .number()
      .min(0, "La tarifa del proveedor no puede ser negativa"),

    ivaTarifaProveedor: z
      .number()
      .min(0, "El IVA del proveedor no puede ser negativo"),

    comisionAgencia: z.number().min(0, "La comisión no puede ser negativa"),

    totalPagado: z.number().min(0, "El total pagado no puede ser negativo"),
  })
  .superRefine((data, ctx) => {
    if (data.pagadoProveedor === "SI" && !data.fechaPagoProveedor) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaPagoProveedor"],
        message: "La fecha es obligatoria cuando el proveedor está pagado.",
      });
    }

    if (data.pagadoProveedor !== "SI" && data.fechaPagoProveedor) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaPagoProveedor"],
        message: "No debe existir una fecha si el proveedor no está pagado.",
      });
    }

    // Número de tarjeta y aprobación
    if (data.formaPago === "TARJETA_CREDITO" || data.formaPago === "OTROS") {
      if (!data.numeroTarjeta?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Ingresa el número de tarjeta",
          path: ["numeroTarjeta"],
        });
      }

      if (!data.numeroAprobacion?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Ingresa el número de aprobación",
          path: ["numeroAprobacion"],
        });
      }
    }

    // Tipo de pago para Cash y Otros
    if (data.formaPago === "CASH" || data.formaPago === "OTROS") {
      if (!data.tipoCash) {
        ctx.addIssue({
          code: "custom",
          message: "Selecciona el tipo de pago",
          path: ["tipoCash"],
        });
      }
    }

    // Comprobante obligatorio para transferencias
    if (
      (data.formaPago === "CASH" || data.formaPago === "OTROS") &&
      data.tipoCash === "TRANSFERENCIA" &&
      !data.soporteTiqueteElectronicoUrl
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Adjunta el comprobante de transferencia",
        path: ["comprobanteTransferencia"],
      });
    }

    if (data.formaPago === "CREDITO_AGENCIA" && !data.creditoAgencia) {
      ctx.addIssue({
        code: "custom",
        path: ["creditoAgencia"],
        message: "Selecciona el plazo del crédito.",
      });
    }

    if (data.fechaIngreso && data.fechaSalida) {
      if (data.fechaSalida < data.fechaIngreso) {
        ctx.addIssue({
          code: "custom",
          path: ["fechaSalida"],
          message: "La fecha de salida no puede ser anterior al ingreso.",
        });
      }
    }
  });

export type ServiceFormInput = z.input<typeof serviceSchema>;
export type ServiceFormValues = z.output<typeof serviceSchema>;

export type ServiceFormInitialData = ServiceFormValues & {
  totalIngreso: number;
};
