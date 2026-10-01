"use server";

import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";

type servicioData = {
  tipoServicio:
    | "HOTEL"
    | "ALQUILER_AUTO"
    | "SALON"
    | "EVENTO"
    | "SILLA"
    | "TARJETA_ASISTENCIA"
    | "TRASLADO"
    | "VISA"
    | "WEB_CHECKIN"
    | "PLAN_VACACIONAL";

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

  // Campos específicos de Servicio
  pagadoProveedor: "SI" | "NO" | "NO_APLICA";

  codigoReserva: string;
  descripcionServicio: string;
  fechaPagoCliente?: string;
  fechaPagoProveedor?: string;
  vencimientoFacturaProveedor?: string;

  valorPagadoProveedor: number;
  trm: number;
  feePagoTarjetaCredito: number;
};

export async function createServicio(data: servicioData) {
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

      // -----------------------------------------
      // 2. Crear Servicio
      // -----------------------------------------

      const servicio = await tx.servicio.create({
        data: {
          clienteId: data.clienteId,
          pasajeroId: data.pasajeroId,
          proveedorId: data.proveedorId ?? null,

          tipo: data.tipoServicio,
          estado: "BORRADOR",

          creadoPorId: session.user.id,

          // Campos comunes
          fechaEmision: new Date(data.fechaEmision),
          fechaPagoCliente: data.fechaPagoCliente
            ? new Date(data.fechaPagoCliente)
            : null,
          fechaPagoProveedor: data.fechaPagoProveedor
            ? new Date(data.fechaPagoProveedor)
            : null,
          vencimientoFacturaProveedor: data.vencimientoFacturaProveedor
            ? new Date(data.vencimientoFacturaProveedor)
            : null,

          formaPago: data.formaPago,
          pagadoProveedor: data.pagadoProveedor,

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

      const valorPagadoGoTravel =
        data.valorPagadoProveedor + data.trm + data.feePagoTarjetaCredito;

      const totalIngreso = valorPagadoGoTravel - data.valorPagadoProveedor;

      const detalleServicio = await tx.detalleServicio.create({
        data: {
          servicioId: servicio.id,

          codigoReserva: data.codigoReserva,
          descripcionServicio: data.descripcionServicio,

          valorPagadoProveedor: data.valorPagadoProveedor,

          trm: data.trm,

          feePagoTarjetaCredito: data.feePagoTarjetaCredito,
          valorPagadoGoTravel: valorPagadoGoTravel,

          totalIngreso: totalIngreso,
        },
      });

      return {
        servicio,
        detalleServicio,
      };
    });

    return {
      success: true,
      servicioId: result.servicio.id,
      servicioUuid: result.servicio.uuid,
      detalleServicioId: result.detalleServicio.id,
      tipo: result.servicio.tipo,
    };
  } catch (error) {
    console.error("Error creando servicio:", error);

    return {
      success: false,
      error: "No se pudo crear el servicio.",
    };
  }
}

export async function updateServicio(
  detalleServicioId: number,
  data: servicioData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  // 1. Buscar el detalle y su servicio
  const detalleServicio = await prisma.detalleServicio.findUnique({
    where: {
      id: detalleServicioId,
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

  if (!detalleServicio) {
    throw new Error("El servicio no existe.");
  }

  // 2. No permitir editar estados finales
  if (
    detalleServicio.servicio.estado === "FACTURADO" ||
    detalleServicio.servicio.estado === "ANULADO"
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

  // 6. Calcular total en el servidor
  const valorPagadoGoTravel =
    data.valorPagadoProveedor + data.trm + data.feePagoTarjetaCredito;

  const totalIngreso = valorPagadoGoTravel - data.valorPagadoProveedor;

  // 7. Actualizar Servicio + Tiquete
  const resultado = await prisma.$transaction(async (tx) => {
    // -----------------------------------------
    // Servicio
    // -----------------------------------------

    const servicio = await tx.servicio.update({
      where: {
        id: detalleServicio.servicioId,
      },
      data: {
        clienteId: data.clienteId,
        proveedorId: data.proveedorId ?? null,

        fechaEmision: new Date(data.fechaEmision),
        fechaPagoCliente: data.fechaPagoCliente
          ? new Date(data.fechaPagoCliente)
          : null,
        fechaPagoProveedor: data.fechaPagoProveedor
          ? new Date(data.fechaPagoProveedor)
          : null,
        vencimientoFacturaProveedor: data.vencimientoFacturaProveedor
          ? new Date(data.vencimientoFacturaProveedor)
          : null,

        pagadoProveedor: data.pagadoProveedor,

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

        tipo: data.tipoServicio,

        ceCos: data.ceCos?.trim() || null,

        proyectoFCDS: data.proyectoFCDS?.trim() || null,

        observaciones: data.observaciones?.trim() || null,
      },
    });

    // -----------------------------------------
    // Tiquete
    // -----------------------------------------

    const detalleServicioActualizado = await tx.detalleServicio.update({
      where: {
        id: detalleServicioId,
      },
      data: {
        descripcionServicio: data.descripcionServicio,

        codigoReserva: data.codigoReserva,

        valorPagadoProveedor: data.valorPagadoProveedor,

        trm: data.trm,

        feePagoTarjetaCredito: data.feePagoTarjetaCredito,

        valorPagadoGoTravel,

        totalIngreso,
      },
    });

    return {
      servicio,
      detalleServicio: detalleServicioActualizado,
    };
  });

  return {
    success: true,
    servicioId: resultado.servicio.id,
    detalleServicioId: resultado.detalleServicio.id,
    tipo: resultado.servicio.tipo,
  };
}
