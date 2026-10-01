"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import {
  clientSchema,
  type ClientFormValues,
} from "@/libs/schemas/clientSchema";

export async function createCliente(data: ClientFormValues) {
  const validatedData = clientSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Los datos del cliente no son válidos.",
    };
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: validatedData.data.nombre,
        apellido: validatedData.data.apellido,
        correo: validatedData.data.correo,
        telefono: validatedData.data.telefono,
      },
    });

    return {
      success: true,
      cliente,
    };
  } catch (error) {
    console.error("Error creando cliente:", error);

    return {
      success: false,
      error: "No se pudo crear el cliente.",
    };
  }
}

export async function updateCliente(
  clienteId: number,
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
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
      },
    });

    if (!cliente) {
      return {
        success: false,
        error: "Cliente no encontrado.",
      };
    }

    await prisma.cliente.update({
      where: {
        id: clienteId,
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
    console.error("Error actualizando cliente:", error);

    return {
      success: false,
      error: "No fue posible actualizar el cliente.",
    };
  }
}