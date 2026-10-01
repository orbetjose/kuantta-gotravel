import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("q")?.trim() ?? "";

  if (!search) {
    return NextResponse.json([]);
  }

  try {
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
        correo: true,
      },
    });

    return NextResponse.json(
      pasajeros.map((pasajero) => ({
        value: String(pasajero.id),
        label: `${pasajero.nombre} ${pasajero.apellido}`,
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
