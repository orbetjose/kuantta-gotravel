"use server";

import { prisma } from "@/libs/prisma";
import { auth } from "@/auth";
import {
  providerSchema,
  type ProviderFormData,
} from "@/libs/schemas/providerSchema";

export async function createProveedor(data: ProviderFormData) {
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
        ...validatedData.data,
      },
    });

    return {
      success: true,
      proveedor,
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
  data: ProviderFormData,
) {
  const session = await auth();

  if (!session) {
    return {
      success: false,
      error: "No autorizado.",
    };
  }

  const validatedData = providerSchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Los datos del proveedor no son válidos.",
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
        ...validatedData.data,
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