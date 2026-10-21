import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 8;
  const skip = (page - 1) * limit;

  try {
    const [notas, total] = await Promise.all([
      prisma.nota.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          titulo: true,
          contenido: true,
          fijada: true,
          createdAt: true,
        },
      }),
      prisma.nota.count(),
    ]);

    return NextResponse.json({
      notas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo notas:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los notas.",
      },
      {
        status: 500,
      },
    );
  }
}
