import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { EstadoServicio } from "@/libs/generated/prisma/enums";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const asesorId = session?.user?.id;

    if (!asesorId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");

    const whereServicio = {
      creadoPorId: asesorId,
      estado: {
        not: EstadoServicio.ANULADO,
      },
      ...(fechaDesde || fechaHasta
        ? {
            fechaEmision: {
              ...(fechaDesde && {
                gte: new Date(`${fechaDesde}T00:00:00-05:00`),
              }),
              ...(fechaHasta && {
                lt: new Date(
                  new Date(`${fechaHasta}T00:00:00-05:00`).getTime() +
                    24 * 60 * 60 * 1000
                ),
              }),
            },
          }
        : {}),
    };

    const [tiquetes, detalles] = await Promise.all([
      prisma.tiquete.findMany({
        where: {
          servicio: whereServicio,
        },
        select: {
          totalPagar: true,
          servicio: {
            select: {
              tipo: true,
            },
          },
        },
      }),

      prisma.detalleServicio.findMany({
        where: {
          servicio: whereServicio,
        },
        select: {
          totalVentaAgencia: true,
          servicio: {
            select: {
              tipo: true,
            },
          },
        },
      }),
    ]);

    const ventasPorTipo = new Map<string, number>();

    for (const tiquete of tiquetes) {
      const tipo = tiquete.servicio.tipo;
      const total = Number(tiquete.totalPagar ?? 0);

      ventasPorTipo.set(
        tipo,
        (ventasPorTipo.get(tipo) ?? 0) + total
      );
    }

    for (const detalle of detalles) {
      const tipo = detalle.servicio.tipo;
      const total = Number(detalle.totalVentaAgencia ?? 0);

      ventasPorTipo.set(
        tipo,
        (ventasPorTipo.get(tipo) ?? 0) + total
      );
    }

    const datos = Array.from(ventasPorTipo, ([tipo, total]) => ({
      tipo,
      total: Math.round(total * 100) / 100,
    })).sort((a, b) => b.total - a.total);

    const totalVendido =
      Math.round(
        datos.reduce((acumulado, item) => acumulado + item.total, 0) * 100
      ) / 100;

    return NextResponse.json({
      datos,
      totalVendido,
    });
  } catch (error) {
    console.error("Error al obtener ventas por tipo:", error);

    return NextResponse.json(
      { error: "Error al obtener las ventas por tipo" },
      { status: 500 }
    );
  }
}