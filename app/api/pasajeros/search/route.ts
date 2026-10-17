import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const search = searchParams.get("q")?.trim() ?? "";



  try {
    if (id !== null) {
      const pasajeroId = Number(id);

      if (!Number.isInteger(pasajeroId) || pasajeroId <= 0) {
        return NextResponse.json(
          { error: "ID de pasajero inválido." },
          { status: 400 },
        );
      }

      const pasajero = await prisma.pasajero.findUnique({
        where: { id: pasajeroId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          documento: true,
          correo: true,
          telefono: true,
        },
      });

      if (!pasajero) {
        return NextResponse.json(
          { error: "Pasajero no encontrado." },
          { status: 404 },
        );
      }

      return NextResponse.json(pasajero);
    }

    // Buscar clientes por texto
    if (search.trim().length < 2) {
      return NextResponse.json([]);
    }
    const pasajeros = await prisma.pasajero.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            apellido: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            correo: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },

      orderBy: {
        nombre: "asc",
      },

      take: 10,

      select: {
        id: true,
        nombre: true,
        apellido: true,
        documento: true,
        telefono: true,
        correo: true,
      },
    });

    return NextResponse.json(
      pasajeros.map((pasajero) => ({
        value: String(pasajero.id),
        label: `${pasajero.nombre} ${pasajero.apellido}`,
        documento: pasajero.documento,
        correo: pasajero.correo,
        telefono: pasajero.telefono,
      })),
    );
  } catch (error) {
    console.error("Error buscando pasajeros:", error);

    return NextResponse.json(
      { error: "No se pudieron buscar los pasajeros." },
      { status: 500 },
    );
  }
}
