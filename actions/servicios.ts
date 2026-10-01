"use server";


import { prisma } from "@/libs/prisma";
import { getAuthenticatedUser } from "./auth-actions";



export async function porFacturarServicio(servicioId: number) {
  const user = await getAuthenticatedUser();

  if (
    user.role !== "ASESOR" &&
    user.role !== "ADMINISTRADOR" &&
    user.role !== "FACTURADOR"
  ) {
    throw new Error("No tienes permisos para enviar este servicio a facturar.");
  }

  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },

    select: {
      id: true,
      estado: true,
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe.");
  }

  if (servicio.estado !== "BORRADOR" && servicio.estado !== "DEVUELTO") {
    throw new Error(
      "Este servicio no puede ser enviado a facturar desde su estado actual.",
    );
  }

  await prisma.servicio.update({
    where: {
      id: servicioId,
    },
    data: {
      estado: "POR_FACTURAR",
      motivoDevolucion: null,
    },
  });

  return {
    success: true,
  };
}

export async function devolverServicio(servicioId: number, motivo: string) {
  const user = await getAuthenticatedUser();

  if (user.role !== "FACTURADOR" && user.role !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para devolver este servicio.");
  }

  if (!motivo.trim()) {
    throw new Error("Debes indicar el motivo de la devolución.");
  }

  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },

    select: {
      id: true,
      estado: true,
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe.");
  }

  if (servicio.estado !== "POR_FACTURAR") {
    throw new Error("Solo puedes devolver servicios que estén por revisar.");
  }

  await prisma.servicio.update({
    where: {
      id: servicioId,
    },
    data: {
      estado: "DEVUELTO",
      motivoDevolucion: motivo.trim(),
    },
  });

  return {
    success: true,
  };
}

export async function facturarServicio(servicioId: number) {
  const user = await getAuthenticatedUser();

  if (user.role !== "FACTURADOR" && user.role !== "ADMINISTRADOR") {
    throw new Error("No tienes permisos para facturar este servicio.");
  }

  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },

    select: {
      id: true,
      estado: true,
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe.");
  }

  if (servicio.estado !== "POR_FACTURAR") {
    throw new Error("Solo puedes facturar servicios que estén por facturar.");
  }

  await prisma.servicio.update({
    where: {
      id: servicioId,
    },
    data: {
      estado: "FACTURADO",
      facturadoPorId: user.id,
      fechaFacturacion: new Date(),
      motivoDevolucion: null,
    },
  });

  return {
    success: true,
    error: "El servicio no existe.",
  };
}

export async function anularServicio(servicioId: number) {
  const user = await getAuthenticatedUser();

  if (user.role !== "ADMINISTRADOR") {
    throw new Error("Solo un administrador puede anulado este servicio.");
  }

  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },

    select: {
      id: true,
      estado: true,
    },
  });

  if (!servicio) {
    throw new Error("El servicio no existe.");
  }

  if (servicio.estado === "ANULADO") {
    throw new Error("Este servicio ya está cancelado.");
  }

  await prisma.servicio.update({
    where: {
      id: servicioId,
    },
    data: {
      estado: "ANULADO",
    },
  });

  return {
    success: true,
  };
}

export async function registrarPagoCliente(
  servicioId: number,
  fechaPagoCliente: Date,
) {
  try {
    const user = await getAuthenticatedUser();

    if (user.role !== "ADMINISTRADOR") {
      return {
        success: false,
        error: "No tienes permisos para registrar pagos.",
      };
    }

    const servicio = await prisma.servicio.findUnique({
      where: {
        id: servicioId,
      },
      select: {
        id: true,
        formaPago: true,
        pagadoCliente: true,
      },
    });

    if (!servicio) {
      return {
        success: false,
        error: "El servicio no existe.",
      };
    }

    if (servicio.formaPago !== "CREDITO_AGENCIA") {
      return {
        success: false,
        error: "El servicio no pertenece a cartera.",
      };
    }

    if (servicio.pagadoCliente) {
      return {
        success: false,
        error: "Este servicio ya está marcado como pagado.",
      };
    }

    await prisma.servicio.update({
      where: {
        id: servicioId,
      },
      data: {
        pagadoCliente: true,
        fechaPagoCliente,
      },
    });

    return {
      success: true,
      message: "Pago registrado correctamente.",
    };
  } catch (error) {
    console.error("Error registrando pago del cliente:", error);

    return {
      success: false,
      error: "No se pudo registrar el pago.",
    };
  }
}