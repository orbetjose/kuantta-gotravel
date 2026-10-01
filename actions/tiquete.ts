"use server";

import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

type TiqueteData = {
  clienteId: number;
  proveedorId?: number;
  pasajeroId: number;

  // Campos comunes de Servicio
  fechaEmision: string;
  formaPago: "CASH" | "TARJETA_CREDITO" | "CREDITO_AGENCIA";

  creditoAgencia?: "3" | "8" | "15" | "30";
  numeroTarjeta?: string;
  numeroAprobacion?: string;
  tipoCash?: "EFECTIVO" | "TRANSFERENCIA";

  ceCos?: string;
  proyectoFCDS?: string;
  observaciones?: string;

  // Campos específicos de Tiquete
  numeroTiquete: string;
  revision: "SI" | "NO";
  numeroTiqueteRevision?: string;

  rutaId: number;
  clase: string;
  fechaIda: string;
  fechaRegreso?: string;

  tarifaNeta: number;
  ivaTarifa: number;
  otrosImpuestos: number;
  tarifaAdministrativaNeta: number;
  ivaTarifaAdministrativa: number;
  feeAgenciaNeta: number;
  ivaFeeAgencia: number;
  feePagoTarjeta: number;

  aph: "NACIONAL" | "INTERNACIONAL";

  fechaEmisionTiqueteFES: string;
};

export async function createTiquete(data: TiqueteData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // -----------------------------------------
      // 1. Validaciones
      // -----------------------------------------

      const cliente = await tx.cliente.findUnique({
        where: {
          id: data.clienteId,
        },
        select: {
          id: true,
        },
      });

      if (!cliente) {
        throw new Error("El cliente seleccionado no existe.");
      }

      const pasajero = await tx.pasajero.findUnique({
        where: {
          id: data.pasajeroId,
        },
        select: {
          id: true,
        },
      });

      if (!pasajero) {
        throw new Error("El pasajero seleccionado no existe.");
      }

      if (data.proveedorId) {
        const proveedor = await tx.proveedor.findUnique({
          where: {
            id: data.proveedorId,
          },
          select: {
            id: true,
          },
        });

        if (!proveedor) {
          throw new Error("El proveedor seleccionado no existe.");
        }
      }

      const ruta = await tx.ruta.findUnique({
        where: {
          id: data.rutaId,
        },
        select: {
          id: true,
        },
      });

      if (!ruta) {
        throw new Error("La ruta seleccionada no existe.");
      }

      // -----------------------------------------
      // 2. Crear Servicio
      // -----------------------------------------

      const servicio = await tx.servicio.create({
        data: {
          clienteId: data.clienteId,
          proveedorId: data.proveedorId ?? null,
          pasajeroId: data.pasajeroId,

          tipo: "TIQUETE",
          estado: "BORRADOR",

          creadoPorId: session.user.id,

          // Campos comunes
          fechaEmision: new Date(data.fechaEmision),

          formaPago: data.formaPago,

          creditoAgencia:
            data.formaPago === "CREDITO_AGENCIA"
              ? Number(data.creditoAgencia)
              : null,

          numeroTarjeta:
            data.formaPago === "TARJETA_CREDITO" ? data.numeroTarjeta : null,
          numeroAprobacion:
            data.formaPago === "TARJETA_CREDITO" ? data.numeroAprobacion : null,

          tipoCash: data.formaPago === "CASH" ? data.tipoCash : null,

          ceCos: data.ceCos || null,
          proyectoFCDS: data.proyectoFCDS || null,

          observaciones: data.observaciones || null,

          // Archivos todavía sin Storage
          facturaProveedorUrl: null,
          facturaGoTravelUrl: null,
          soporteTiqueteElectronicoUrl: null,
        },
      });

      // -----------------------------------------
      // 3. Crear Tiquete
      // -----------------------------------------

      const totalPagar =
        data.tarifaNeta +
        data.ivaTarifa +
        data.otrosImpuestos +
        data.tarifaAdministrativaNeta +
        data.ivaTarifaAdministrativa +
        data.feeAgenciaNeta +
        data.ivaFeeAgencia +
        data.feePagoTarjeta;

      const tiquete = await tx.tiquete.create({
        data: {
          servicioId: servicio.id,

          rutaId: data.rutaId,

          numeroTiquete: data.numeroTiquete,

          revision: data.revision === "SI",

          numeroTiqueteRevision:
            data.revision === "SI" ? data.numeroTiqueteRevision || null : null,

          clase: data.clase,

          fechaIda: new Date(data.fechaIda),

          fechaRegreso: data.fechaRegreso ? new Date(data.fechaRegreso) : null,

          tarifaNeta: data.tarifaNeta,

          ivaTarifa: data.ivaTarifa,

          otrosImpuestos: data.otrosImpuestos,

          tarifaAdministrativaNeta: data.tarifaAdministrativaNeta,

          ivaTarifaAdministrativa: data.ivaTarifaAdministrativa,

          feeAgenciaNeta: data.feeAgenciaNeta,

          ivaFeeAgencia: data.ivaFeeAgencia,

          feePagoTarjeta: data.feePagoTarjeta,

          totalPagar,

          aph: data.aph,

          fechaEmisionTiqueteFES: new Date(data.fechaEmisionTiqueteFES),
        },
      });

      return {
        servicio,
        tiquete,
      };
    });

    return {
      success: true,
      servicioId: result.servicio.id,
      servicioUuid: result.servicio.uuid,
      tiqueteId: result.tiquete.id,
    };
  } catch (error) {
    console.error("Error creando tiquete:", error);

    return {
      success: false,
      error: "No se pudo crear el tiquete.",
    };
  }
}

export async function updateTiquete(tiqueteId: number, data: TiqueteData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  // 1. Buscar el tiquete y su servicio
  const tiquete = await prisma.tiquete.findUnique({
    where: {
      id: tiqueteId,
    },
    select: {
      id: true,
      servicioId: true,
      servicio: {
        select: {
          id: true,
          estado: true,
        },
      },
    },
  });

  if (!tiquete) {
    throw new Error("El tiquete no existe.");
  }

  // 2. No permitir editar estados finales
  if (
    tiquete.servicio.estado === "FACTURADO" ||
    tiquete.servicio.estado === "ANULADO"
  ) {
    throw new Error(
      "Este tiquete no puede editarse porque ya está facturado o anulado.",
    );
  }

  // 3. Validar cliente
  const cliente = await prisma.cliente.findUnique({
    where: {
      id: data.clienteId,
    },
    select: {
      id: true,
    },
  });

  if (!cliente) {
    throw new Error("El cliente seleccionado no existe.");
  }

  // 4. Validar proveedor si existe
  if (data.proveedorId) {
    const proveedor = await prisma.proveedor.findUnique({
      where: {
        id: data.proveedorId,
      },
      select: {
        id: true,
      },
    });

    if (!proveedor) {
      throw new Error("El proveedor seleccionado no existe.");
    }
  }

  // 5. Validar ruta
  const ruta = await prisma.ruta.findUnique({
    where: {
      id: data.rutaId,
    },
    select: {
      id: true,
    },
  });

  if (!ruta) {
    throw new Error("La ruta seleccionada no existe.");
  }

  // 6. Calcular total en el servidor
  const totalPagar =
    data.tarifaNeta +
    data.ivaTarifa +
    data.otrosImpuestos +
    data.tarifaAdministrativaNeta +
    data.ivaTarifaAdministrativa +
    data.feeAgenciaNeta +
    data.ivaFeeAgencia +
    data.feePagoTarjeta;

  // 7. Actualizar Servicio + Tiquete
  const resultado = await prisma.$transaction(async (tx) => {
    // -----------------------------------------
    // Servicio
    // -----------------------------------------

    const servicio = await tx.servicio.update({
      where: {
        id: tiquete.servicioId,
      },
      data: {
        clienteId: data.clienteId,
        proveedorId: data.proveedorId ?? null,
        pasajeroId: data.pasajeroId,

        fechaEmision: new Date(data.fechaEmision),

        formaPago: data.formaPago,

        creditoAgencia:
          data.formaPago === "CREDITO_AGENCIA"
            ? Number(data.creditoAgencia)
            : null,

        numeroTarjeta:
          data.formaPago === "TARJETA_CREDITO" ? data.numeroTarjeta : null,
        numeroAprobacion:
          data.formaPago === "TARJETA_CREDITO" ? data.numeroAprobacion : null,

        tipoCash: data.formaPago === "CASH" ? data.tipoCash : null,

        ceCos: data.ceCos?.trim() || null,

        proyectoFCDS: data.proyectoFCDS?.trim() || null,

        observaciones: data.observaciones?.trim() || null,
      },
    });

    // -----------------------------------------
    // Tiquete
    // -----------------------------------------

    const tiqueteActualizado = await tx.tiquete.update({
      where: {
        id: tiqueteId,
      },
      data: {
        numeroTiquete: data.numeroTiquete,

        revision: data.revision === "SI",

        numeroTiqueteRevision:
          data.revision === "SI" ? data.numeroTiqueteRevision || null : null,

        rutaId: data.rutaId,

        clase: data.clase,

        fechaIda: new Date(data.fechaIda),

        fechaRegreso: data.fechaRegreso ? new Date(data.fechaRegreso) : null,

        tarifaNeta: data.tarifaNeta,

        ivaTarifa: data.ivaTarifa,

        otrosImpuestos: data.otrosImpuestos,

        tarifaAdministrativaNeta: data.tarifaAdministrativaNeta,

        ivaTarifaAdministrativa: data.ivaTarifaAdministrativa,

        feeAgenciaNeta: data.feeAgenciaNeta,

        ivaFeeAgencia: data.ivaFeeAgencia,

        feePagoTarjeta: data.feePagoTarjeta,

        totalPagar,

        aph: data.aph,

        fechaEmisionTiqueteFES: new Date(data.fechaEmisionTiqueteFES),
      },
    });

    return {
      servicio,
      tiquete: tiqueteActualizado,
    };
  });

  return {
    success: true,
    servicioId: resultado.servicio.id,
    tiqueteId: resultado.tiquete.id,
  };
}
