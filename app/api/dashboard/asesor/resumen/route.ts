import { NextResponse } from "next/server";
import {
  EstadoServicio,
  TipoPago,
  TipoPagadoProveedor,
} from "@/libs/generated/prisma/enums";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { obtenerFecha, inicioDelDia } from "@/libs/dashboard-helpers";

function fechaValida(fecha: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const fechaParseada = inicioDelDia(fecha);

  return (
    !Number.isNaN(fechaParseada.getTime()) &&
    obtenerFecha(fechaParseada) === fecha
  );
}

function redondear(valor: number) {
  return Math.round(valor * 100) / 100;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const asesorId = session?.user?.id;

    if (!asesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    const inicioHoy = inicioDelDia(hoy);
    const inicioManana = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);

    // Servicios del asesor que no estén anulados.
    const filtrosAsesor = {
      creadoPorId: asesorId,
      estado: {
        not: EstadoServicio.ANULADO,
      },
    };

    // Servicios dentro del rango seleccionado.
    const filtrosRango = {
      ...filtrosAsesor,
      createdAt: {
        gte: fechaInicio,
        lt: fechaFin,
      },
    };

    // 1. Total vendido
    // 2. Cartera pendiente
    // 3. Pago pendiente a proveedores
    // 4. Ventas del día

    const [
      tiquetesVendidos,
      detallesVendidos,
      tiquetesCartera,
      detallesCartera,
      detallesPendientesProveedor,
      tiquetesHoy,
      detallesHoy,
      clientesConCartera,
      proveedoresPendientes,
    ] = await Promise.all([
      prisma.tiquete.aggregate({
        where: {
          servicio: filtrosRango,
        },
        _sum: {
          totalPagar: true,
        },
      }),

      prisma.detalleServicio.aggregate({
        where: {
          servicio: filtrosRango,
        },
        _sum: {
          totalVentaAgencia: true,
        },
      }),

      prisma.tiquete.aggregate({
        where: {
          servicio: {
            ...filtrosRango,
            formaPago: TipoPago.CREDITO_AGENCIA,
            pagadoCliente: false,
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),

      prisma.detalleServicio.aggregate({
        where: {
          servicio: {
            ...filtrosRango,
            formaPago: TipoPago.CREDITO_AGENCIA,
            pagadoCliente: false,
          },
        },
        _sum: {
          totalVentaAgencia: true,
        },
      }),

      prisma.detalleServicio.findMany({
        where: {
          servicio: {
            ...filtrosRango,
            pagadoProveedor: TipoPagadoProveedor.NO,
          },
        },
        select: {
          tarifaNetaProveedor: true,
          ivaTarifaProveedor: true,
        },
      }),

      prisma.tiquete.aggregate({
        where: {
          servicio: {
            ...filtrosAsesor,
            createdAt: {
              gte: inicioHoy,
              lt: inicioManana,
            },
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),

      prisma.detalleServicio.aggregate({
        where: {
          servicio: {
            ...filtrosAsesor,
            createdAt: {
              gte: inicioHoy,
              lt: inicioManana,
            },
          },
        },
        _sum: {
          totalVentaAgencia: true,
        },
      }),
      prisma.cliente.count({
        where: {
          servicios: {
            some: {
              ...filtrosRango,
              formaPago: TipoPago.CREDITO_AGENCIA,
              pagadoCliente: false,
            },
          },
        },
      }),
      prisma.proveedor.count({
        where: {
          servicios: {
            some: {
              ...filtrosRango,
              pagadoProveedor: TipoPagadoProveedor.NO,
              detalleServicio: {
                isNot: null,
              },
            },
          },
        },
      }),
    ]);

    const totalVendido =
      Number(tiquetesVendidos._sum.totalPagar ?? 0) +
      Number(detallesVendidos._sum.totalVentaAgencia ?? 0);

    const carteraPendiente =
      Number(tiquetesCartera._sum.totalPagar ?? 0) +
      Number(detallesCartera._sum.totalVentaAgencia ?? 0);

    const pagoPendienteProveedores = detallesPendientesProveedor.reduce(
      (total, detalle) => {
        const costoProveedor =
          Number(detalle.tarifaNetaProveedor) +
          Number(detalle.ivaTarifaProveedor);

        return total + costoProveedor;
      },
      0,
    );

    const ventasDelDia =
      Number(tiquetesHoy._sum.totalPagar ?? 0) +
      Number(detallesHoy._sum.totalVentaAgencia ?? 0);

    return NextResponse.json({
      totalVendido: redondear(totalVendido),
      carteraPendiente: redondear(carteraPendiente),
      clientesConCartera,
      pagoPendienteProveedores: redondear(pagoPendienteProveedores),
      ventasDelDia: redondear(ventasDelDia),
      proveedoresPendientes,
      rango: {
        fechaDesde,
        fechaHasta,
      },
    });
  } catch (error) {
    console.error("Error al obtener métricas del asesor:", error);

    return NextResponse.json(
      { error: "Error al obtener las métricas del dashboard" },
      { status: 500 },
    );
  }
}
