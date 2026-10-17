"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import { RouteFormData, routeSchema, type RouteFormValues } from "@/libs/schemas/routeSchema";

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
        codigoIATA: validatedData.data.codigoIATA,
        nombreAeropuerto: validatedData.data.nombreAeropuerto,
        ciudad: validatedData.data.ciudad,
        pais: validatedData.data.pais,
        region: validatedData.data.region,
      },
    });

    return {
      success: true,
      ruta: {
        id: ruta.id,
        codigoIATA: ruta.codigoIATA,
        nombreAeropuerto: ruta.nombreAeropuerto,
        ciudad: ruta.ciudad,
        pais: ruta.pais,
        region: ruta.region,
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
  data: RouteFormData
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
        codigoIATA: data.codigoIATA,
        nombreAeropuerto: data.nombreAeropuerto,
        ciudad: data.ciudad,
        pais: data.pais,
        region: data.region,
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
