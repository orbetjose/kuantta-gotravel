import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search")?.trim() ?? "";

  const skip = (page - 1) * limit;

  try {
    const where = search
      ? {
          OR: [
            {
              razonSocial: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              ruc: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              correo: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : undefined;

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
          ruc: true,
          correo: true,
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
