import { NextResponse } from "next/server";

import { prisma } from "@/libs/prisma";
import { EstadoServicio } from "@/libs/generated/prisma/enums";
import { getDateRange } from "@/libs/helpers";
import { TipoPago } from "@/libs/generated/prisma/enums";
import {
  getChartDateRange,
  getPeriodoAgrupacion,
  getPeriodoKey,
} from "@/libs/dashboard-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const fechaDesde = searchParams.get("fechaDesde")?.trim() ?? "";
  const fechaHasta = searchParams.get("fechaHasta")?.trim() ?? "";

  try {
    // =========================================================
    // RANGO DEL GRÁFICO
    // =========================================================

    // Si hay filtro:
    //   usa el rango seleccionado.
    //
    // Si no hay filtro:
    //   usa primer día del mes actual -> hoy.
    const { desde: chartDesde, hasta: chartHasta } = getChartDateRange(
      fechaDesde,
      fechaHasta,
    );

    const fechaEmisionChart = {
      gte: chartDesde,
      lt: new Date(chartHasta.getTime() + 24 * 60 * 60 * 1000),
    };

    const agrupacion = getPeriodoAgrupacion(chartDesde, chartHasta);

    // =========================================================
    // FILTROS DE LAS MÉTRICAS
    // =========================================================

    const fechaEmision = getDateRange(fechaDesde, fechaHasta);

    // Las métricas solamente reciben filtro de fecha
    // cuando el usuario seleccionó fechas.
    const filtrosGlobales =
      fechaDesde || fechaHasta
        ? {
            fechaEmision,
          }
        : {};

    // =========================================================
    // 1. TOTAL VENDIDO
    // =========================================================

    const whereTotalVendido = {
      ...filtrosGlobales,
      estado: {
        not: EstadoServicio.ANULADO,
      },
    };

    // =========================================================
    // 2. TOTAL EN CARTERA
    // =========================================================

    const whereCartera = {
      ...filtrosGlobales,
      estado: {
        not: EstadoServicio.ANULADO,
      },
      formaPago: TipoPago.CREDITO_AGENCIA,
      pagadoCliente: false,
    };

    // =========================================================
    // 3. PENDIENTE POR FACTURAR
    // =========================================================

    const wherePendienteFacturar = {
      ...filtrosGlobales,
      estado: EstadoServicio.POR_FACTURAR,
    };

    // =========================================================
    // FILTRO EXCLUSIVO DEL GRÁFICO
    // =========================================================

    const whereVentasPeriodo = {
      fechaEmision: fechaEmisionChart,
      estado: {
        not: EstadoServicio.ANULADO,
      },
    };

    // =========================================================
    // MÉTRICAS
    // =========================================================

    const [
      totalVendidoTiquetes,
      totalVendidoDetalles,
      carteraTiquetes,
      carteraDetalles,
      pendienteTiquetes,
      pendienteDetalles,
    ] = await Promise.all([
      // Total vendido - Tiquetes
      prisma.tiquete.aggregate({
        where: {
          servicio: whereTotalVendido,
        },
        _sum: {
          totalPagar: true,
        },
      }),

      // Total vendido - Otros servicios
      prisma.detalleServicio.aggregate({
        where: {
          servicio: whereTotalVendido,
        },
        _sum: {
          totalIngreso: true,
        },
      }),

      // Cartera - Tiquetes
      prisma.tiquete.aggregate({
        where: {
          servicio: whereCartera,
        },
        _sum: {
          totalPagar: true,
        },
      }),

      // Cartera - Otros servicios
      prisma.detalleServicio.aggregate({
        where: {
          servicio: whereCartera,
        },
        _sum: {
          totalIngreso: true,
        },
      }),

      // Pendiente por facturar - Tiquetes
      prisma.tiquete.aggregate({
        where: {
          servicio: wherePendienteFacturar,
        },
        _sum: {
          totalPagar: true,
        },
      }),

      // Pendiente por facturar - Otros servicios
      prisma.detalleServicio.aggregate({
        where: {
          servicio: wherePendienteFacturar,
        },
        _sum: {
          totalIngreso: true,
        },
      }),
    ]);

    const totalVendido =
      Number(totalVendidoTiquetes._sum.totalPagar ?? 0) +
      Number(totalVendidoDetalles._sum.totalIngreso ?? 0);

    const totalCartera =
      Number(carteraTiquetes._sum.totalPagar ?? 0) +
      Number(carteraDetalles._sum.totalIngreso ?? 0);

    const pendientePorFacturar =
      Number(pendienteTiquetes._sum.totalPagar ?? 0) +
      Number(pendienteDetalles._sum.totalIngreso ?? 0);

    // =========================================================
    // DATOS PARA LOS GRÁFICOS
    // =========================================================

    const [tiquetes, detalles] = await Promise.all([
      prisma.tiquete.findMany({
        where: {
          servicio: whereTotalVendido,
        },
        select: {
          totalPagar: true,
          servicio: {
            select: {
              tipo: true,
              fechaEmision: true,
            },
          },
        },
      }),

      prisma.detalleServicio.findMany({
        where: {
          servicio: whereTotalVendido,
        },
        select: {
          totalIngreso: true,
          servicio: {
            select: {
              tipo: true,
              fechaEmision: true,
            },
          },
        },
      }),
    ]);

    // =========================================================
    // VENTAS Y CANTIDAD POR TIPO
    // =========================================================

    const ventasPorTipoMap = new Map<string, number>();

    const serviciosPorCantidadMap = new Map<string, number>();

    for (const tiquete of tiquetes) {
      const tipo = tiquete.servicio.tipo;

      // Cantidad de servicios
      const cantidadActual = serviciosPorCantidadMap.get(tipo) ?? 0;

      serviciosPorCantidadMap.set(tipo, cantidadActual + 1);

      // Dinero generado
      const totalActual = ventasPorTipoMap.get(tipo) ?? 0;

      ventasPorTipoMap.set(tipo, totalActual + Number(tiquete.totalPagar ?? 0));
    }

    for (const detalle of detalles) {
      const tipo = detalle.servicio.tipo;

      // Cantidad de servicios
      const cantidadActual = serviciosPorCantidadMap.get(tipo) ?? 0;

      serviciosPorCantidadMap.set(tipo, cantidadActual + 1);

      // Dinero generado
      const totalActual = ventasPorTipoMap.get(tipo) ?? 0;

      ventasPorTipoMap.set(
        tipo,
        totalActual + Number(detalle.totalIngreso ?? 0),
      );
    }

    const ventasPorTipo = Array.from(ventasPorTipoMap.entries())
      .map(([tipo, total]) => ({
        tipo,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const serviciosPorCantidad = Array.from(serviciosPorCantidadMap.entries())
      .map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // =========================================================
    // VENTAS POR PERIODO
    // =========================================================

    const ventasPorPeriodoMap = new Map<string, number>();

    // IMPORTANTE:
    // aquí usamos solamente los servicios
    // correspondientes al rango del gráfico.
    //
    // Esto es diferente a tiquetes/detalles usados
    // arriba para los otros gráficos.

    const [tiquetesPeriodo, detallesPeriodo] = await Promise.all([
      prisma.tiquete.findMany({
        where: {
          servicio: whereVentasPeriodo,
        },
        select: {
          totalPagar: true,
          servicio: {
            select: {
              fechaEmision: true,
            },
          },
        },
      }),

      prisma.detalleServicio.findMany({
        where: {
          servicio: whereVentasPeriodo,
        },
        select: {
          totalIngreso: true,
          servicio: {
            select: {
              fechaEmision: true,
            },
          },
        },
      }),
    ]);

    for (const tiquete of tiquetesPeriodo) {
      const periodo = getPeriodoKey(tiquete.servicio.fechaEmision, agrupacion);

      const actual = ventasPorPeriodoMap.get(periodo) ?? 0;

      ventasPorPeriodoMap.set(
        periodo,
        actual + Number(tiquete.totalPagar ?? 0),
      );
    }

    for (const detalle of detallesPeriodo) {
      const periodo = getPeriodoKey(detalle.servicio.fechaEmision, agrupacion);

      const actual = ventasPorPeriodoMap.get(periodo) ?? 0;

      ventasPorPeriodoMap.set(
        periodo,
        actual + Number(detalle.totalIngreso ?? 0),
      );
    }

    const ventasPorPeriodo = Array.from(ventasPorPeriodoMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, total]) => ({
        periodo,
        total,
      }));

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json({
      totalVendido,
      totalCartera,
      pendientePorFacturar,

      serviciosPorCantidad,
      ventasPorTipo,

      ventasPorPeriodo,
      periodoAgrupacion: agrupacion,
    });
  } catch (error) {
    console.error("Error obteniendo resumen del dashboard:", error);

    return NextResponse.json(
      {
        error: "No se pudo obtener el resumen del dashboard.",
      },
      {
        status: 500,
      },
    );
  }
}
