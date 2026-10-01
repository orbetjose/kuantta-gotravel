"use server";

import { prisma } from "@/libs/prisma";

export async function getClientes() {
  return await prisma.cliente.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      nombre: true,
      apellido: true,
      correo: true,
    },
  });
}

export async function getProveedores() {
  return await prisma.proveedor.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      razonSocial: true,
      ruc: true,
    },
  });
}

export async function getRutas() {
  return await prisma.ruta.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      origen: true,
      codigoOrigen: true,
      destino: true,
      codigoDestino: true,
    },
  });
}

export async function getPasajeros() {
  return await prisma.pasajero.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      nombre: true,
      apellido: true,
      correo: true,
    },
  });
}