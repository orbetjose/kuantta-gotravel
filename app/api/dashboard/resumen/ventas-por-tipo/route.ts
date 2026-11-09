
import { NextResponse } from "next/server";
import {
  EstadoServicio,
  Role,
} from "@/libs/generated/prisma/enums";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { obtenerFecha, inicioDelDia, fechaValida } from "@/libs/dashboard-helpers";



export async function GET(request: Request) {
  try {
    const session = await auth();
    const usuarioId = session?.user?.id;
    const rol = session?.user?.role;

    if (!usuarioId || !rol) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 },
      );
    }

    if (rol !== Role.ADMINISTRADOR && rol !== Role.ASESOR) {
      return NextResponse.json(
        { error: "No tienes permisos para consultar estos datos" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Por defecto: primer día del mes hasta hoy.
    const hoy = obtenerFecha(new Date());
    const primerDiaMes = `${hoy.slice(0, 7)}-01`;

    const fechaDesde = searchParams.get("fechaDesde") ?? primerDiaMes;
    const fechaHasta = searchParams.get("fechaHasta") ?? hoy;

    // Validación del rango.
    if (
      !fechaValida(fechaDesde) ||
      !fechaValida(fechaHasta) ||
      fechaDesde > fechaHasta
    ) {
      return NextResponse.json(
        { error: "Rango de fechas inválido" },
        { status: 400 },
      );
    }

    const fechaInicio = inicioDelDia(fechaDesde);

    const fechaFin = new Date(
      inicioDelDia(fechaHasta).getTime() + 24 * 60 * 60 * 1000,
    );

    // Filtros comunes para los servicios.
    const filtrosServicio = {
      ...(rol === Role.ASESOR && {
        creadoPorId: usuarioId,
      }),
      estado: {
        not: EstadoServicio.ANULADO,
      },
      createdAt: {
        gte: fechaInicio,
        lt: fechaFin,
      },
    };

    const [tiquetes, detalles] = await Promise.all([
      prisma.tiquete.findMany({
        where: {
          servicio: filtrosServicio,
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
          servicio: filtrosServicio,
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

    // Ventas de tiquetes.
    for (const tiquete of tiquetes) {
      const tipo = tiquete.servicio.tipo;
      const total = Number(tiquete.totalPagar ?? 0);

      ventasPorTipo.set(
        tipo,
        (ventasPorTipo.get(tipo) ?? 0) + total,
      );
    }

    // Ventas de los demás servicios.
    for (const detalle of detalles) {
      const tipo = detalle.servicio.tipo;
      const total = Number(detalle.totalVentaAgencia ?? 0);

      ventasPorTipo.set(
        tipo,
        (ventasPorTipo.get(tipo) ?? 0) + total,
      );
    }

    const datos = Array.from(
      ventasPorTipo,
      ([tipo, total]) => ({
        tipo,
        total: Math.round(total * 100) / 100,
      }),
    ).sort((a, b) => b.total - a.total);

    const totalVendido = Math.round(
      datos.reduce(
        (acumulado, item) => acumulado + item.total,
        0,
      ) * 100,
    ) / 100;

    return NextResponse.json({
      datos,
      totalVendido,
      rango: {
        fechaDesde,
        fechaHasta,
      },
    });
  } catch (error) {
    console.error("Error al obtener ventas por tipo:", error);

    return NextResponse.json(
      { error: "Error al obtener las ventas por tipo" },
      { status: 500 },
    );
  }
}
