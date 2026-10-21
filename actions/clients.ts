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
        razonSocial: validatedData.data.razonSocial,
        tipoPersona: validatedData.data.tipoPersona,
        documento: validatedData.data.documento,
        tipoDocumento: validatedData.data.tipoDocumento,
        direccion: validatedData.data.direccion,
        ciudad: validatedData.data.ciudad,
        observaciones: validatedData.data.observaciones,
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
    razonSocial?: string;
    tipoDocumento: "NIT" | "CEDULA" | "PASAPORTE";
    documento: string;
    direccion: string;
    ciudad: string;
    tipoPersona: "NATURAL" | "JURIDICA";
    correo: string;
    telefono: string;
    observaciones?: string;
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
        razonSocial: data.razonSocial,
        tipoDocumento: data.tipoDocumento,
        tipoPersona: data.tipoPersona,
        documento: data.documento,
        ciudad: data.ciudad,
        observaciones: data.observaciones,
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

export async function deleteCliente(clienteId: number) {
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
        error: "Proveedor no encontrado.",
      };
    }
    await prisma.cliente.update({
      where: {
        id: clienteId,
      },
      data: {
        activo: false,
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