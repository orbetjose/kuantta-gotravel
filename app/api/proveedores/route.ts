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
        FROM "Proveedor"
        WHERE "activo" = true
          AND (
            unaccent(lower(COALESCE("razonSocial", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("nombreComercial", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("nit", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("correoComercial", '')))
              LIKE unaccent(lower(${termino}))
            OR unaccent(lower(COALESCE("correoFacturacion", '')))
              LIKE unaccent(lower(${termino}))
          )
      `;

      idsEncontrados = resultados.map((proveedor) => proveedor.id);
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

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          razonSocial: true,
          nombreComercial: true,
          categoria: true,
          correoComercial: true,
          correoFacturacion: true,
          contacto: true,
          nit: true,
          telefono: true,
          createdAt: true,
        },
      }),

      prisma.proveedor.count({
        where,
      }),
    ]);

    return NextResponse.json({
      proveedores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo proveedores:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los proveedores.",
      },
      {
        status: 500,
      },
    );
  }
}
