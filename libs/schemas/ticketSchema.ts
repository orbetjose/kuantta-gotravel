import { z } from "zod";

const trayectoSchema = z
  .object({
    origenId: z.string().min(1, "Selecciona el aeropuerto de origen"),
    destinoId: z.string().min(1, "Selecciona el aeropuerto de destino"),
    fechaSalida: z.string().min(1, "Ingresa la fecha de salida"),
    fechaRegreso: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.origenId || !data.destinoId || data.origenId !== data.destinoId,
    {
      message: "El origen y el destino deben ser diferentes",
      path: ["destinoId"],
    },
  );

export const ticketSchema = z
  .object({
    // Servicio
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
    fechaEmision: z.string().min(1, "Ingresa la fecha de emisión"),
    fechaSolicitud: z.string().min(1, "Ingresa la fecha de solicitud"),

    formaPago: z.enum(["CASH", "TARJETA_CREDITO", "CREDITO_AGENCIA", "OTROS"]),
    creditoAgencia: z.number().optional(),
    numeroTarjeta: z.string().optional(),
    numeroAprobacion: z.string().optional(),
    tipoCash: z.enum(["EFECTIVO", "TRANSFERENCIA"]).optional(),

    ceCos: z.string().optional(),
    proyectoFCDS: z.string().optional(),
    observaciones: z.string().optional(),

    // Tiquete
    numeroTiquete: z.string().min(1, "Ingresa el número de tiquete"),
    codigoReserva: z.string().min(1, "Ingresa el código de reserva"),

    canalVenta: z.enum([
      "AMADEUS",
      "SABRE",
      "KONTROL_TRAVEL",
      "KIU_TRAVEL",
      "NDC",
      "OTROS",
    ]),

    tipoViaje: z.enum(["NACIONAL", "INTERNACIONAL"]),
    tipoItinerario: z.enum(["SOLO_IDA", "IDA_VUELTA", "MULTIDESTINO"]),

    trayectos: z.array(trayectoSchema).min(1, "Agrega al menos un trayecto"),

    revision: z.boolean(),
    numeroTiqueteRevision: z.string().optional(),

    clase: z.string().min(1, "Ingresa la clase"),

    tarifaNeta: z.number().min(0),
    ivaTarifa: z.number().min(0),
    otrosImpuestos: z.number().min(0),
    tarifaAdministrativaNeta: z.number().min(0),
    ivaTarifaAdministrativa: z.number().min(0),
    feeAgenciaNeta: z.number().min(0),
    ivaFeeAgencia: z.number().min(0),
    tarifaAPH: z.number().min(0),
    ivaTarifaAPH: z.number().min(0).optional(),

    fechaEmisionTiqueteFES: z
      .string()
      .min(1, "Ingresa la fecha de emisión del tiquete FES"),
    facturaProveedor: z.instanceof(File).optional(),
    facturaGoTravel: z.instanceof(File).optional(),
    soporteTiquete: z.instanceof(File).optional(),
    comprobanteTransferencia: z
      .instanceof(File)
      .refine(
        (file) =>
          ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
        "Solo se permiten archivos PDF, JPG o PNG",
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.revision && !data.numeroTiqueteRevision?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroTiqueteRevision"],
        message: "Ingresa el número del tiquete original",
      });
    }

    if (data.formaPago === "CREDITO_AGENCIA" && !data.creditoAgencia) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona el plazo del crédito",
        path: ["creditoAgencia"],
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
      !data.comprobanteTransferencia
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Adjunta el comprobante de transferencia",
        path: ["comprobanteTransferencia"],
      });
    }

    if (data.tipoItinerario === "SOLO_IDA" && data.trayectos.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Solo ida debe tener un trayecto",
        path: ["trayectos"],
      });
    }

    if (data.tipoItinerario === "IDA_VUELTA" && data.trayectos.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Ida y vuelta debe tener un trayecto",
        path: ["trayectos"],
      });
    }

    if (
      data.tipoItinerario === "IDA_VUELTA" &&
      !data.trayectos[0]?.fechaRegreso?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Ingresa la fecha de regreso",
        path: ["trayectos", 0, "fechaRegreso"],
      });
    }

    if (data.tipoItinerario === "MULTIDESTINO" && data.trayectos.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Multidestino requiere al menos dos trayectos",
        path: ["trayectos"],
      });
    }
  });

export type TicketFormInput = z.input<typeof ticketSchema>;
export type TicketFormValues = z.output<typeof ticketSchema>;

type TrayectoInitialData = TicketFormInput["trayectos"][number] & {
  origenLabel: string;
  destinoLabel: string;
};

export type TicketFormInitialData = Omit<
  TicketFormInput,
  "facturaProveedor" | "facturaGoTravel" | "soporteTiquete" | "trayectos"
> & {
  totalPagar?: number;
  trayectos: TrayectoInitialData[];
};
