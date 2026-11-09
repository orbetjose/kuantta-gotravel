import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  EstadoServicio,
  TipoPago,
  TipoPagadoProveedor,
} from "@/libs/generated/prisma/enums";
import { prisma } from "@/libs/prisma";
import {
  obtenerFecha,
  inicioDelDia,
  fechaValida,
  redondear,
} from "@/libs/dashboard-helpers";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const facturadorId = session?.user?.id;

    if (!facturadorId) {
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

    const inicioHoy = inicioDelDia(hoy);
    const inicioManana = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);

    const fechaInicio = inicioDelDia(fechaDesde);
    const fechaFin = new Date(
      inicioDelDia(fechaHasta).getTime() + 24 * 60 * 60 * 1000,
    );

    const filtroFacturador = {
      facturadoPorId: facturadorId,
      estado: EstadoServicio.FACTURADO,
    };

    const [
      tiquetesFacturadosHoy,
      detallesFacturadosdetallesHoy,
      tiquetesCartera,
      detallesCartera,
      detallesPendientesProveedor,
      clientesConCartera,
      proveedoresPendientes,
    ] = await Promise.all([
      prisma.tiquete.aggregate({
        where: {
          servicio: {
            ...filtroFacturador,
            fechaFacturacion: {
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
            ...filtroFacturador,
            fechaFacturacion: {
              gte: inicioHoy,
              lt: inicioManana,
            },
          },
        },
        _sum: {
          totalVentaAgencia: true,
        },
      }),

      prisma.tiquete.aggregate({
        where: {
          servicio: {
            formaPago: TipoPago.CREDITO_AGENCIA,
            pagadoCliente: false,
            createdAt: {
              gte: fechaInicio,
              lt: fechaFin,
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
            formaPago: TipoPago.CREDITO_AGENCIA,
            pagadoCliente: false,
            createdAt: {
              gte: fechaInicio,
              lt: fechaFin,
            },
          },
        },
        _sum: {
          totalVentaAgencia: true,
        },
      }),
      prisma.detalleServicio.findMany({
        where: {
          servicio: {
            pagadoProveedor: TipoPagadoProveedor.NO,
            createdAt: {
              gte: fechaInicio,
              lt: fechaFin,
            },
          },
        },
        select: {
          tarifaNetaProveedor: true,
          ivaTarifaProveedor: true,
        },
      }),
      prisma.cliente.count({
        where: {
          servicios: {
            some: {
              formaPago: TipoPago.CREDITO_AGENCIA,
              pagadoCliente: false,
              createdAt: {
                gte: fechaInicio,
                lt: fechaFin,
              },
            },
          },
        },
      }),
      prisma.proveedor.count({
        where: {
          servicios: {
            some: {
              pagadoProveedor: TipoPagadoProveedor.NO,
              detalleServicio: {
                isNot: null,
              },
              createdAt: {
                gte: fechaInicio,
                lt: fechaFin,
              },
            },
          },
        },
      }),
    ]);
    const totalFacturadoHoy =
      Number(tiquetesFacturadosHoy._sum.totalPagar ?? 0) +
      Number(detallesFacturadosdetallesHoy._sum.totalVentaAgencia ?? 0);

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

    return NextResponse.json({
      totalFacturadoHoy: redondear(totalFacturadoHoy),
      carteraPendiente: redondear(carteraPendiente),
      pagoPendienteProveedores: redondear(pagoPendienteProveedores),
      clientesConCartera,
      proveedoresPendientes,
      rango: {
        fechaDesde,
        fechaHasta,
      },
    });
  } catch (error) {
    console.error("Error al obtener métricas del facturador:", error);

    return NextResponse.json(
      { error: "Error al obtener las métricas del dashboard" },
      { status: 500 },
    );
  }
}
