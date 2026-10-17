"use server";

import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { ServiceFormValues } from "@/libs/schemas/serviceSchema";

const calcularIVA = (tarifa: number) => {
  return Number((tarifa * 0.19).toFixed(2));
};

function calcularValoresIVA(data: {
  tarifaNeta: number;
  tarifaNetaProveedor: number;
}) {
  return {
    ivaTarifa: calcularIVA(data.tarifaNeta),
    ivaTarifaProveedor: calcularIVA(data.tarifaNetaProveedor),
  };
}

function calcularTotalPagado(
  data: ServiceFormValues,
  ivaTarifaProveedor: number,
) {
  return data.tarifaNetaProveedor + ivaTarifaProveedor + data.comisionAgencia;
}

function calcularTotalVentaAgencia(data: ServiceFormValues, ivaTarifa: number) {
  return data.tarifaNeta + ivaTarifa + data.feePagoTarjetaCredito;
}

export async function createServicio(data: ServiceFormValues) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar relaciones
      const cliente = await tx.cliente.findUnique({
        where: { id: Number(data.clienteId) },
        select: { id: true },
      });

      if (!cliente) {
        throw new Error("El cliente seleccionado no existe.");
      }

      const pasajero = await tx.pasajero.findUnique({
        where: { id: Number(data.pasajeroId) },
        select: { id: true },
      });

      if (!pasajero) {
        throw new Error("El pasajero seleccionado no existe.");
      }

      if (data.proveedorId) {
        const proveedor = await tx.proveedor.findUnique({
          where: { id: Number(data.proveedorId) },
          select: { id: true },
        });

        if (!proveedor) {
          throw new Error("El proveedor seleccionado no existe.");
        }
      }

      // 2. Crear Servicio
      const servicio = await tx.servicio.create({
        data: {
          clienteId: Number(data.clienteId),
          pasajeroId: Number(data.pasajeroId),
          proveedorId: data.proveedorId ? Number(data.proveedorId) : null,

          tipo: data.tipo,
          estado: data.estado,
          creadoPorId: session.user.id,

          fechaEmision: new Date(data.fechaEmision),
          fechaSolicitud: new Date(data.fechaSolicitud),

          facturaProveedorUrl: String(data.facturaProveedorUrl) || null,
          facturaGoTravelUrl: String(data.facturaGoTravelUrl) || null,
          soporteTiqueteElectronicoUrl:
            String(data.soporteTiqueteElectronicoUrl) || null,
          comprobantePagoUrl: String(data.comprobantePagoUrl) || null,

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
          pagadoProveedor: data.pagadoProveedor ?? null,
          pagadoCliente: data.pagadoCliente,

          creditoAgencia:
            data.formaPago === "CREDITO_AGENCIA"
              ? Number(data.creditoAgencia)
              : null,

          numeroTarjeta:
            data.formaPago === "TARJETA_CREDITO"
              ? data.numeroTarjeta || null
              : null,

          numeroAprobacion:
            data.formaPago === "TARJETA_CREDITO"
              ? data.numeroAprobacion || null
              : null,

          tipoCash: data.formaPago === "CASH" ? (data.tipoCash ?? null) : null,

          ceCos: data.ceCos?.trim() || null,
          proyectoFCDS: data.proyectoFCDS?.trim() || null,
          observaciones: data.observaciones?.trim() || null,
        },
      });

      const valoresIVA = calcularValoresIVA(data);

      // 3. Crear DetalleServicio
      const detalleServicio = await tx.detalleServicio.create({
        data: {
          servicioId: servicio.id,

          descripcionServicio: data.descripcionServicio,
          codigoReserva: data.codigoReserva,
          ciudad: data.ciudad,
          pais: data.pais,

          fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : null,

          fechaSalida: data.fechaSalida ? new Date(data.fechaSalida) : null,

          tarifaNeta: data.tarifaNeta,
          feePagoTarjetaCredito: data.feePagoTarjetaCredito,
          ...valoresIVA,
          tarifaNetaProveedor: data.tarifaNetaProveedor,
          comisionAgencia: data.comisionAgencia,
          totalPagado: calcularTotalPagado(data, valoresIVA.ivaTarifaProveedor),

          totalVentaAgencia: calcularTotalVentaAgencia(
            data,
            valoresIVA.ivaTarifa,
          ),
        },
      });

      return { servicio, detalleServicio };
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
      error:
        error instanceof Error
          ? error.message
          : "No se pudo crear el servicio.",
    };
  }
}

export async function updateServicio(
  detalleServicioId: number,
  data: ServiceFormValues,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  const detalleServicio = await prisma.detalleServicio.findUnique({
    where: { id: detalleServicioId },
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

  if (
    detalleServicio.servicio.estado === "FACTURADO" ||
    detalleServicio.servicio.estado === "ANULADO"
  ) {
    throw new Error(
      "Este servicio no puede editarse porque ya está facturado o anulado.",
    );
  }

  // Validar relaciones
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(data.clienteId) },
    select: { id: true },
  });

  if (!cliente) {
    throw new Error("El cliente seleccionado no existe.");
  }

  const pasajero = await prisma.pasajero.findUnique({
    where: { id: Number(data.pasajeroId) },
    select: { id: true },
  });

  if (!pasajero) {
    throw new Error("El pasajero seleccionado no existe.");
  }

  if (data.proveedorId) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: Number(data.proveedorId) },
      select: { id: true },
    });

    if (!proveedor) {
      throw new Error("El proveedor seleccionado no existe.");
    }
  }

  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Actualizar Servicio
    const servicio = await tx.servicio.update({
      where: { id: detalleServicio.servicioId },
      data: {
        clienteId: Number(data.clienteId),
        pasajeroId: Number(data.pasajeroId),
        proveedorId: data.proveedorId ? Number(data.proveedorId) : null,
        estado: data.estado,
        tipo: data.tipo,

        fechaEmision: new Date(data.fechaEmision),
        fechaSolicitud: new Date(data.fechaSolicitud),

        facturaProveedorUrl: String(data.facturaProveedorUrl) || null,
        facturaGoTravelUrl: String(data.facturaGoTravelUrl) || null,
        soporteTiqueteElectronicoUrl:
          String(data.soporteTiqueteElectronicoUrl) || null,
        comprobantePagoUrl: String(data.comprobantePagoUrl) || null,

        fechaPagoCliente: data.fechaPagoCliente
          ? new Date(data.fechaPagoCliente)
          : null,

        fechaPagoProveedor: data.fechaPagoProveedor
          ? new Date(data.fechaPagoProveedor)
          : null,

        vencimientoFacturaProveedor: data.vencimientoFacturaProveedor
          ? new Date(data.vencimientoFacturaProveedor)
          : null,

        pagadoProveedor: data.pagadoProveedor ?? null,
        pagadoCliente: data.pagadoCliente,
        formaPago: data.formaPago,

        creditoAgencia:
          data.formaPago === "CREDITO_AGENCIA"
            ? Number(data.creditoAgencia)
            : null,

        numeroTarjeta:
          data.formaPago === "TARJETA_CREDITO"
            ? data.numeroTarjeta || null
            : null,

        numeroAprobacion:
          data.formaPago === "TARJETA_CREDITO"
            ? data.numeroAprobacion || null
            : null,

        tipoCash: data.formaPago === "CASH" ? (data.tipoCash ?? null) : null,

        ceCos: data.ceCos?.trim() || null,
        proyectoFCDS: data.proyectoFCDS?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
      },
    });

    const valoresIVA = calcularValoresIVA(data);

    // 2. Actualizar DetalleServicio
    const detalleServicioActualizado = await tx.detalleServicio.update({
      where: { id: detalleServicioId },
      data: {
        descripcionServicio: data.descripcionServicio,
        codigoReserva: data.codigoReserva,
        ciudad: data.ciudad,
        pais: data.pais,

        fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : null,

        fechaSalida: data.fechaSalida ? new Date(data.fechaSalida) : null,

        tarifaNeta: data.tarifaNeta,
        feePagoTarjetaCredito: data.feePagoTarjetaCredito,
        ...valoresIVA,
        tarifaNetaProveedor: data.tarifaNetaProveedor,
        comisionAgencia: data.comisionAgencia,
        totalPagado: calcularTotalPagado(data, valoresIVA.ivaTarifaProveedor),
        totalVentaAgencia: calcularTotalVentaAgencia(
          data,
          valoresIVA.ivaTarifa,
        ),
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
