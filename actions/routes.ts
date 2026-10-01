"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import { routeSchema, type RouteFormValues } from "@/libs/schemas/routeSchema";

export async function createRuta(data: RouteFormValues) {
  const validatedData = routeSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Los datos de la ruta no son válidos.",
    };
  }

  try {
    const ruta = await prisma.ruta.create({
      data: {
        origen: validatedData.data.origen,
        codigoOrigen: validatedData.data.codigoOrigen,
        destino: validatedData.data.destino,
        codigoDestino: validatedData.data.codigoDestino,
      },
    });

    return {
      success: true,
      ruta: {
        id: ruta.id,
        origen: ruta.origen,
        codigoOrigen: ruta.codigoOrigen,
        destino: ruta.destino,
        codigoDestino: ruta.codigoDestino,
      },
    };
  } catch (error) {
    console.error("Error creando ruta:", error);

    return {
      success: false,
      error: "No se pudo crear la ruta.",
    };
  }
}

export async function updateRuta(
  routeId: number,
  data: {
    origen: string;
    destino: string;
    codigoOrigen: string;
    codigoDestino: string;
  },
) {
  const session = await auth();

  if (!session) {
    return {
      success: false,
      error: "No autorizado.",
    };
  }

  try {
    const ruta = await prisma.ruta.findUnique({
      where: {
        id: routeId,
      },
    });

    if (!ruta) {
      return {
        success: false,
        error: "Ruta no encontrado.",
      };
    }

    await prisma.ruta.update({
      where: {
        id: routeId,
      },
      data: {
        origen: data.origen,
        destino: data.destino,
        codigoOrigen: data.codigoOrigen,
        codigoDestino: data.codigoDestino,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error actualizando ruta:", error);

    return {
      success: false,
      error: "No fue posible actualizar el ruta.",
    };
  }
}
