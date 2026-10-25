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
  const rutasPopulares = [
    50,
    52,
    38,
    11,
    17,
    27,
  ];

  const rutas = await prisma.ruta.findMany({
    where: {
      id: {
        in: rutasPopulares,
      },
    },
    select: {
      id: true,
      codigoIATA: true,
      nombreAeropuerto: true,
      ciudad: true,
      pais: true,
    },
  });

  // Mantener el orden definido en rutasPopulares
  const orden = new Map(
    rutasPopulares.map((id, index) => [id, index])
  );

  return rutas.sort(
    (a, b) => orden.get(a.id)! - orden.get(b.id)!
  );
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