import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("q")?.trim() ?? "";

  if (search.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const proveedores = await prisma.proveedor.findMany({
      where: {
        OR: [
          {
            razonSocial: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ruc: {
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
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        razonSocial: true,
        ruc: true,
        correo: true,
      },
    });

    return NextResponse.json(
      proveedores.map((proveedor) => ({
        value: String(proveedor.id),
        label: proveedor.razonSocial,
      })),
    );
  } catch (error) {
    console.error("Error buscando proveedores:", error);

    return NextResponse.json(
      { error: "No se pudieron buscar los proveedores." },
      { status: 500 },
    );
  }
}
