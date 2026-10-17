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
      tipoDocumento: true,
      documento: true,
      razonSocial: true,
      correo: true,
      telefono: true,
    },
  });
}

export async function getProveedores() {
  return await prisma.proveedor.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    select: {
      id: true,
      razonSocial: true,
      nit: true,
      correoComercial: true,
      nombreComercial: true,
      telefono: true,
    },
  });
}

export async function getRutas() {
  return await prisma.ruta.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    select: {
      id: true,
      codigoIATA: true,
      nombreAeropuerto: true,
      ciudad: true,
      pais: true,
    },
  });
}

export async function getPasajeros() {
  return await prisma.pasajero.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    select: {
      id: true,
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
      documento: true,
    },
  });
}