import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const search = searchParams.get("q")?.trim() ?? "";

  try {
    if (id !== null) {
      const proveedorId = Number(id);

      if (!Number.isInteger(proveedorId) || proveedorId <= 0) {
        return NextResponse.json(
          { error: "ID de proveedor inválido." },
          { status: 400 },
        );
      }

      const proveedor = await prisma.proveedor.findUnique({
        where: { id: proveedorId },
        select: {
          id: true,
          nombreComercial: true,
          razonSocial: true,
          correoComercial: true,
          nit: true,
          telefono: true,
        },
      });

      if (!proveedor) {
        return NextResponse.json(
          { error: "Proveedor no encontrado." },
          { status: 404 },
        );
      }

      return NextResponse.json(proveedor);
    }

    if (search.length < 2) {
      return NextResponse.json([]);
    }

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
            nit: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            correoComercial: {
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
        nit: true,
        correoComercial: true,
        nombreComercial: true,
        telefono: true,
      },
    });

    return NextResponse.json(
      proveedores.map((proveedor) => ({
        value: String(proveedor.id),
        label: proveedor.razonSocial,
        nombrecomercial: proveedor.nombreComercial,
        nit: proveedor.nit,
        telefono: proveedor.telefono,
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
