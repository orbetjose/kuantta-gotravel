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
              nombre: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              apellido: {
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
            {
              telefono: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : undefined;

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
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
          correo: true,
          telefono: true,
          createdAt: true,
        },
      }),

      prisma.cliente.count({
        where,
      }),
    ]);

    return NextResponse.json({
      clientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo clientes:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los clientes.",
      },
      {
        status: 500,
      },
    );
  }
}
