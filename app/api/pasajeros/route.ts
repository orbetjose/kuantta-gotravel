import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(searchParams.get("limit")) || 10);
  const search = searchParams.get("search")?.trim() ?? "";

  const skip = (page - 1) * limit;

  try {
    let idsEncontrados: number[] | undefined;

    if (search) {
      const termino = `%${search}%`;

      const resultados = await prisma.$queryRaw<{ id: number }[]>`
        SELECT "id"
        FROM "Pasajero"
        WHERE "activo" = true
          AND (
            unaccent(lower(COALESCE("nombre", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("apellido", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("documento", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("correo", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("telefono", '')))
              LIKE unaccent(lower(${termino}))
          )
      `;

      idsEncontrados = resultados.map((pasajero) => pasajero.id);
    }

    const where = {
      activo: true,
      ...(idsEncontrados !== undefined
        ? {
            id: {
              in: idsEncontrados,
            },
          }
        : {}),
    };

    const [pasajeros, total] = await Promise.all([
      prisma.pasajero.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          documento: true,
          correo: true,
          telefono: true,
          createdAt: true,
        },
      }),

      prisma.pasajero.count({
        where,
      }),
    ]);

    return NextResponse.json({
      pasajeros,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo pasajeros:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los pasajeros.",
      },
      {
        status: 500,
      },
    );
  }
}