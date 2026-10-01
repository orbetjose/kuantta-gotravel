"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import {
  providerSchema,
  type ProviderFormValues,
} from "@/libs/schemas/providerSchema";

export async function createProveedor(data: ProviderFormValues) {
  const validatedData = providerSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Los datos del proveedor no son válidos.",
    };
  }

  try {
    const proveedor = await prisma.proveedor.create({
      data: {
        razonSocial: validatedData.data.razonSocial,
        ruc: validatedData.data.ruc,
        direccionFiscal: validatedData.data.direccionFiscal,
        telefono: validatedData.data.telefono,
        correo: validatedData.data.correo,
      },
    });

    return {
      success: true,
      proveedor: {
        id: proveedor.id,
        razonSocial: proveedor.razonSocial,
        ruc: proveedor.ruc,
        direccionFiscal: proveedor.direccionFiscal,
        telefono: proveedor.telefono,
        correo: proveedor.correo,
      },
    };
  } catch (error) {
    console.error("Error creando proveedor:", error);

    return {
      success: false,
      error: "No se pudo crear el proveedor.",
    };
  }
}


export async function updateProveedor(
  proveedorId: number,
  data: {
    razonSocial: string;
    ruc: string;
    direccionFiscal: string;
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
    const proveedor = await prisma.proveedor.findUnique({
      where: {
        id: proveedorId,
      },
    });

    if (!proveedor) {
      return {
        success: false,
        error: "Proveedor no encontrado.",
      };
    }

    await prisma.proveedor.update({
      where: {
        id: proveedorId,
      },
      data: {
        razonSocial: data.razonSocial,
        ruc: data.ruc,
        direccionFiscal: data.direccionFiscal,
        correo: data.correo,
        telefono: data.telefono,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error actualizando proveedor:", error);

    return {
      success: false,
      error: "No fue posible actualizar el proveedor.",
    };
  }
}