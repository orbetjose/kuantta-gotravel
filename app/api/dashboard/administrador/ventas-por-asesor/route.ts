import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { EstadoServicio, Role } from "@/libs/generated/prisma/enums";
import {
  obtenerFecha,
  inicioDelDia,
  fechaValida,
} from "@/libs/dashboard-helpers";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const usuarioId = session?.user?.id;
    const rol = session?.user?.role;

    if (!usuarioId || !rol) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (rol !== Role.ADMINISTRADOR) {
      return NextResponse.json(
        { error: "No tienes permisos para consultar esta información" },
        { status: 403 },
      );
    }

    // Rango de fechas
    const { searchParams } = new URL(request.url);

    const hoy = obtenerFecha(new Date());
    const primerDiaMes = `${hoy.slice(0, 7)}-01`;

    const fechaDesde = searchParams.get("fechaDesde") ?? primerDiaMes;

    const fechaHasta = searchParams.get("fechaHasta") ?? hoy;

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

    // Obtener asesores
    const asesores = await prisma.user.findMany({
      where: {
        role: Role.ASESOR,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const ventasPorAsesor = new Map<
      string,
      { asesorId: string; asesor: string | null; total: number }
    >();

    // Inicializar todos los asesores en cero
    for (const asesor of asesores) {
      ventasPorAsesor.set(asesor.id, {
        asesorId: asesor.id,
        asesor: asesor.name,
        total: 0,
      });
    }

    const filtrosServicio = {
      estado: {
        not: EstadoServicio.ANULADO,
      },
      createdAt: {
        gte: fechaInicio,
        lt: fechaFin,
      },
    };

    // Consultar tiquetes y otros servicios
    const [tiquetes, detalles] = await Promise.all([
      prisma.tiquete.findMany({
        where: {
          servicio: filtrosServicio,
        },
        select: {
          totalPagar: true,
          servicio: {
            select: {
              creadoPorId: true,
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
              creadoPorId: true,
            },
          },
        },
      }),
    ]);

    // Sumar ventas de tiquetes
    for (const tiquete of tiquetes) {
      const asesorId = tiquete.servicio.creadoPorId;
      const asesor = ventasPorAsesor.get(asesorId);

      if (asesor) {
        asesor.total += Number(tiquete.totalPagar);
      }
    }

    // Sumar ventas de los demás servicios
    for (const detalle of detalles) {
      const asesorId = detalle.servicio.creadoPorId;
      const asesor = ventasPorAsesor.get(asesorId);

      if (asesor) {
        asesor.total += Number(detalle.totalVentaAgencia);
      }
    }

    // Ordenar de mayor a menor
    const datos = Array.from(ventasPorAsesor.values()).sort(
      (a, b) => b.total - a.total,
    );

    const totalVendido = datos.reduce(
      (total, asesor) => total + asesor.total,
      0,
    );

    return NextResponse.json({
      datos,
      totalVendido,
      rango: {
        fechaDesde,
        fechaHasta,
      },
    });
  } catch (error) {
    console.error("Error obteniendo ventas por asesor:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
