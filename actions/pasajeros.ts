"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import {
  pasajeroSchema,
  type PasajeroFormValues,
} from "@/libs/schemas/pasajeroSchema";

export async function createPasajero(data: PasajeroFormValues) {
  const validatedData = pasajeroSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Los datos del pasajero no son válidos.",
    };
  }

  try {
    const pasajero = await prisma.pasajero.create({
      data: {
        nombre: validatedData.data.nombre,
        apellido: validatedData.data.apellido,
        correo: validatedData.data.correo,
        telefono: validatedData.data.telefono,
      },
    });

    return {
      success: true,
      pasajero,
    };
  } catch (error) {
    console.error("Error creando pasajero:", error);

    return {
      success: false,
      error: "No se pudo crear el pasajero.",
    };
  }
}

export async function updatePasajero(
  pasajeroId: number,
  data: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
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
    const pasajero = await prisma.pasajero.findUnique({
      where: {
        id: pasajeroId,
      },
    });

    if (!pasajero) {
      return {
        success: false,
        error: "Pasajero no encontrado.",
      };
    }

    await prisma.pasajero.update({
      where: {
        id: pasajeroId,
      },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error actualizando pasajero:", error);

    return {
      success: false,
      error: "No fue posible actualizar el pasajero.",
    };
  }
}