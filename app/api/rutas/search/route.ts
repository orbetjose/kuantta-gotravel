import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("q")?.trim() ?? "";

  if (search.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const rutas = await prisma.ruta.findMany({
      where: {
        OR: [
          {
            origen: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            codigoOrigen: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            destino: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            codigoDestino: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
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

    return NextResponse.json(
      rutas.map((ruta) => ({
        value: String(ruta.id),
        label: `${ruta.origen} (${ruta.codigoOrigen}) → ${ruta.destino} (${ruta.codigoDestino})`,
      })),
    );
  } catch (error) {
    console.error("Error buscando rutas:", error);

    return NextResponse.json(
      { error: "No se pudieron buscar las rutas." },
      { status: 500 },
    );
  }
}
