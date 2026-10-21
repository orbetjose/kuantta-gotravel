import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search")?.trim() ?? "";

  const skip = (page - 1) * limit;

  try {
    const where = {
      activo: true,
      ...(search
        ? {
            OR: [
              {
                codigoIATA: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                nombreAeropuerto: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                ciudad: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [rutas, total] = await Promise.all([
      prisma.ruta.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          codigoIATA: true,
          nombreAeropuerto: true,
          ciudad: true,
          pais: true,
          createdAt: true,
        },
      }),

      prisma.ruta.count({
        where,
      }),
    ]);

    return NextResponse.json({
      rutas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo rutas:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los rutas.",
      },
      {
        status: 500,
      },
    );
  }
}
