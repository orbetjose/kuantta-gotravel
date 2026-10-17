import { Prisma } from "@/libs/generated/prisma/client";

export const tiqueteDetailSelect = {
  id: true,
  numeroTiquete: true,

  revision: true,
  numeroTiqueteRevision: true,

  clase: true,
  tipoViaje: true,
  tipoItinerario: true,
  codigoReserva: true,

  tarifaNeta: true,
  ivaTarifa: true,
  otrosImpuestos: true,
  tarifaAdministrativaNeta: true,
  ivaTarifaAdministrativa: true,
  feeAgenciaNeta: true,
  ivaFeeAgencia: true,
  tarifaAPH: true,
  ivaTarifaAPH: true,
  totalPagar: true,

  fechaEmisionTiqueteFES: true,

  createdAt: true,
  updatedAt: true,

  servicio: {
    select: {
      id: true,
      uuid: true,
      estado: true,
      fechaEmision: true,

      formaPago: true,
      creditoAgencia: true,
      numeroTarjeta: true,
      numeroAprobacion: true,
      tipoCash: true,

      ceCos: true,
      proyectoFCDS: true,

      facturaProveedorUrl: true,
      soporteTiqueteElectronicoUrl: true,
      facturaGoTravelUrl: true,

      observaciones: true,

      createdAt: true,

      cliente: {
        select: {
          id: true,
          nombre: true,
          tipoDocumento: true,
          documento: true,
          correo: true,
          telefono: true,
        },
      },

      pasajero: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          correo: true,
          telefono: true,
          documento: true,
        },
      },

      proveedor: {
        select: {
          id: true,
          razonSocial: true,
          nit: true,
          correoComercial: true,
          telefono: true,
        },
      },

      creadoPor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  trayectos: {
    orderBy: {
      orden: "asc",
    },
    select: {
      id: true,
      orden: true,
      fechaSalida: true,
      fechaRegreso: true,

      origen: {
        select: {
          id: true,
          codigoIATA: true,
          nombreAeropuerto: true,
          pais: true,
          ciudad: true,
        },
      },

      destino: {
        select: {
          id: true,
          codigoIATA: true,
          nombreAeropuerto: true,
          pais: true,
          ciudad: true,
        },
      },
    },
  },

  // Añade aquí el bloque servicio completo de tu consulta actual.
} satisfies Prisma.TiqueteSelect;

export type TiqueteDetailData = Prisma.TiqueteGetPayload<{
  select: typeof tiqueteDetailSelect;
}>;



export type TrayectoData = {
  origenId: number;
  destinoId: number;
  fechaSalida: string;
  fechaRegreso?: string;
};

export type TiqueteData = {
  clienteId: number;
  proveedorId?: number;
  pasajeroId: number;
  estado: "BORRADOR" | "POR_FACTURAR" | "DEVUELTO" | "FACTURADO" | "ANULADO";


  // Servicio
  fechaEmision: string;
  fechaSolicitud: string;
  formaPago: "CASH" | "TARJETA_CREDITO" | "CREDITO_AGENCIA" | "OTROS";
  creditoAgencia?: number;
  numeroTarjeta?: string;
  numeroAprobacion?: string;
  tipoCash?: "EFECTIVO" | "TRANSFERENCIA";
  ceCos?: string;
  proyectoFCDS?: string;
  observaciones?: string;

  // Tiquete
  numeroTiquete: string;
  codigoReserva: string;
  canalVenta:
    | "AMADEUS"
    | "SABRE"
    | "KONTROL_TRAVEL"
    | "KIU_TRAVEL"
    | "NDC"
    | "OTROS";
  tipoViaje: "NACIONAL" | "INTERNACIONAL";
  tipoItinerario: "SOLO_IDA" | "IDA_VUELTA" | "MULTIDESTINO";
  trayectos: TrayectoData[];

  revision: boolean;
  numeroTiqueteRevision?: string;
  clase: string;

  tarifaNeta: number;
  ivaTarifa: number;
  otrosImpuestos: number;
  tarifaAdministrativaNeta: number;
  ivaTarifaAdministrativa: number;
  feeAgenciaNeta: number;
  ivaFeeAgencia: number;
  tarifaAPH: number;
  ivaTarifaAPH?: number;

  fechaEmisionTiqueteFES: string;
};