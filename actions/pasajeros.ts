"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import {
  PasajeroFormData,
  pasajeroSchema,  
} from "@/libs/schemas/pasajeroSchema";

export async function createPasajero(data: PasajeroFormData) {
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
        documento: validatedData.data.documento,
        fechaNacimiento: new Date(validatedData.data.fechaNacimiento),
        preferenciaSilla: validatedData.data.preferenciaSilla,
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
  data: PasajeroFormData,
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
        documento: data.documento,
        fechaNacimiento: new Date(data.fechaNacimiento),
        preferenciaSilla: data.preferenciaSilla,
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

export async function deletePasajero(pasajeroId: number) {
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
        activo: false,
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