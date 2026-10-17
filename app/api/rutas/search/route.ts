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
            codigoIATA: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            nombreAeropuerto: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ciudad: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            pais: {
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
        codigoIATA: true,
        nombreAeropuerto: true,
        ciudad: true,
        pais: true,
      },
    });

    return NextResponse.json(
      rutas.map((ruta) => ({
        value: String(ruta.id),
        label: `${ruta.codigoIATA} — ${ruta.ciudad}, ${ruta.pais}`,
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
