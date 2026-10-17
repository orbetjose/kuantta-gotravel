"use server";

import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { TiqueteData, TrayectoData } from "@/types/tiquete";

const calcularIVA = (tarifa: number) => {
  return Number((tarifa * 0.19).toFixed(2));
};

function calcularValoresIVA(data: {
  tarifaNeta: number;
  tarifaAdministrativaNeta: number;
  feeAgenciaNeta: number;
  tarifaAPH?: number | null;
}) {
  return {
    ivaTarifa: calcularIVA(data.tarifaNeta),
    ivaTarifaAdministrativa: calcularIVA(data.tarifaAdministrativaNeta),
    ivaFeeAgencia: calcularIVA(data.feeAgenciaNeta),
    ivaTarifaAPH: data.tarifaAPH != null ? calcularIVA(data.tarifaAPH) : null,
  };
}

function calcularTotal(
  data: TiqueteData,
  ivaTarifa: number,
  ivaTarifaAdministrativa: number,
  ivaFeeAgencia: number,
  ivaTarifaAPH?: number,
) {
  return (
    data.tarifaNeta +
    ivaTarifa +
    data.otrosImpuestos +
    data.tarifaAdministrativaNeta +
    ivaTarifaAdministrativa +
    data.feeAgenciaNeta +
    ivaFeeAgencia +
    data.tarifaAPH +
    (ivaTarifaAPH ?? 0)
  );
}

async function validarRelaciones(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  data: TiqueteData,
) {
  const cliente = await tx.cliente.findUnique({
    where: { id: data.clienteId },
    select: { id: true },
  });

  if (!cliente) throw new Error("El cliente seleccionado no existe.");

  const pasajero = await tx.pasajero.findUnique({
    where: { id: data.pasajeroId },
    select: { id: true },
  });

  if (!pasajero) throw new Error("El pasajero seleccionado no existe.");

  if (data.proveedorId) {
    const proveedor = await tx.proveedor.findUnique({
      where: { id: data.proveedorId },
      select: { id: true },
    });

    if (!proveedor) {
      throw new Error("El proveedor seleccionado no existe.");
    }
  }

  if (!data.trayectos.length) {
    throw new Error("Debes agregar al menos un trayecto.");
  }

  const rutaIds = [
    ...new Set(
      data.trayectos.flatMap((trayecto) => [
        trayecto.origenId,
        trayecto.destinoId,
      ]),
    ),
  ];

  const rutas = await tx.ruta.findMany({
    where: { id: { in: rutaIds } },
    select: { id: true },
  });

  if (rutas.length !== rutaIds.length) {
    throw new Error("Uno o más aeropuertos seleccionados no existen.");
  }

  for (const trayecto of data.trayectos) {
    if (trayecto.origenId === trayecto.destinoId) {
      throw new Error("El origen y el destino deben ser diferentes.");
    }
  }
}

function mapearTrayectos(trayectos: TrayectoData[]) {
  return trayectos.map((trayecto, index) => ({
    orden: index + 1,
    origenId: trayecto.origenId,
    destinoId: trayecto.destinoId,
    fechaSalida: new Date(trayecto.fechaSalida),
    fechaRegreso: trayecto.fechaRegreso
      ? new Date(trayecto.fechaRegreso)
      : null,
  }));
}

export async function createTiquete(data: TiqueteData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await validarRelaciones(tx, data);

      const servicio = await tx.servicio.create({
        data: {
          clienteId: data.clienteId,
          proveedorId: data.proveedorId ?? null,
          pasajeroId: data.pasajeroId,

          tipo: "TIQUETE",
          estado: data.estado,
          creadoPorId: session.user.id,

          fechaEmision: new Date(data.fechaEmision),
          fechaSolicitud: new Date(data.fechaSolicitud),

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

          facturaProveedorUrl: null,
          facturaGoTravelUrl: null,
          soporteTiqueteElectronicoUrl: null,
        },
      });

      const valoresIVA = calcularValoresIVA(data);

      const tiquete = await tx.tiquete.create({
        data: {
          servicioId: servicio.id,

          numeroTiquete: data.numeroTiquete,
          codigoReserva: data.codigoReserva,
          canalVenta: data.canalVenta,
          tipoViaje: data.tipoViaje,
          tipoItinerario: data.tipoItinerario,

          revision: data.revision,
          numeroTiqueteRevision: data.revision
            ? data.numeroTiqueteRevision || null
            : null,

          clase: data.clase,

          tarifaNeta: data.tarifaNeta,
          otrosImpuestos: data.otrosImpuestos,
          tarifaAdministrativaNeta: data.tarifaAdministrativaNeta,
          feeAgenciaNeta: data.feeAgenciaNeta,
          tarifaAPH: data.tarifaAPH,
          ...valoresIVA,
          totalPagar: calcularTotal(
            data,
            valoresIVA.ivaFeeAgencia,
            valoresIVA.ivaTarifa,
            valoresIVA.ivaTarifaAdministrativa,
            valoresIVA.ivaTarifaAPH ?? 0,
          ),

          fechaEmisionTiqueteFES: new Date(data.fechaEmisionTiqueteFES),

          trayectos: {
            create: mapearTrayectos(data.trayectos),
          },
        },
      });

      return { servicio, tiquete };
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
      error:
        error instanceof Error ? error.message : "No se pudo crear el tiquete.",
    };
  }
}

export async function updateTiquete(tiqueteId: number, data: TiqueteData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  const tiquete = await prisma.tiquete.findUnique({
    where: { id: tiqueteId },
    select: {
      id: true,
      servicioId: true,
      servicio: {
        select: { estado: true },
      },
    },
  });

  if (!tiquete) {
    throw new Error("El tiquete no existe.");
  }

  if (
    tiquete.servicio.estado === "FACTURADO" ||
    tiquete.servicio.estado === "ANULADO"
  ) {
    throw new Error(
      "Este tiquete no puede editarse porque ya está facturado o anulado.",
    );
  }

  const resultado = await prisma.$transaction(async (tx) => {
    await validarRelaciones(tx, data);

    const servicio = await tx.servicio.update({
      where: { id: tiquete.servicioId },
      data: {
        clienteId: data.clienteId,
        proveedorId: data.proveedorId ?? null,
        pasajeroId: data.pasajeroId,
        estado: data.estado,

        fechaEmision: new Date(data.fechaEmision),
        fechaSolicitud: new Date(data.fechaSolicitud),

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

    // Eliminar los trayectos anteriores y guardar el itinerario actualizado.
    await tx.trayectoTiquete.deleteMany({
      where: { tiqueteId },
    });

    const valoresIVA = calcularValoresIVA(data);

    const tiqueteActualizado = await tx.tiquete.update({
      where: { id: tiqueteId },
      data: {
        numeroTiquete: data.numeroTiquete,
        codigoReserva: data.codigoReserva,
        canalVenta: data.canalVenta,
        tipoViaje: data.tipoViaje,
        tipoItinerario: data.tipoItinerario,

        revision: data.revision,
        numeroTiqueteRevision: data.revision
          ? data.numeroTiqueteRevision || null
          : null,

        clase: data.clase,

        tarifaNeta: data.tarifaNeta,
        otrosImpuestos: data.otrosImpuestos,
        tarifaAdministrativaNeta: data.tarifaAdministrativaNeta,
        feeAgenciaNeta: data.feeAgenciaNeta,
        tarifaAPH: data.tarifaAPH,
        ...valoresIVA,

        totalPagar: calcularTotal(
          data,
          valoresIVA.ivaFeeAgencia,
          valoresIVA.ivaTarifa,
          valoresIVA.ivaTarifaAdministrativa,
          valoresIVA.ivaTarifaAPH ?? 0,
        ),

        fechaEmisionTiqueteFES: new Date(data.fechaEmisionTiqueteFES),

        trayectos: {
          create: mapearTrayectos(data.trayectos),
        },
      },
    });

    return { servicio, tiquete: tiqueteActualizado };
  });

  return {
    success: true,
    servicioId: resultado.servicio.id,
    tiqueteId: resultado.tiquete.id,
    error: null,
  };
}
