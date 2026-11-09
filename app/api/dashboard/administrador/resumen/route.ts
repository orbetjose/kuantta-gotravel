import { NextResponse } from "next/server";
import {
  EstadoServicio,
  TipoPago,
  TipoPagadoProveedor,
} from "@/libs/generated/prisma/enums";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { obtenerFecha, inicioDelDia, fechaValida, redondear } from "@/libs/dashboard-helpers";



export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;

    if (userRole != "ADMINISTRADOR") {
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

    // Servicios dentro del rango seleccionado.
    const filtroVentas = {
      estado: {
        not: EstadoServicio.ANULADO,
      },
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
      ingresosTiquetes,
      ingresosDetalles,
      clientesConCartera,
      proveedoresPendientes,
    ] = await Promise.all([
      prisma.tiquete.aggregate({
        where: {
          servicio: filtroVentas,
        },
        _sum: {
          totalPagar: true,
        },
      }),

      prisma.detalleServicio.aggregate({
        where: {
          servicio: filtroVentas,
        },
        _sum: {
          totalVentaAgencia: true,
        },
      }),

      prisma.tiquete.aggregate({
        where: {
          servicio: {
            ...filtroVentas,
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
            ...filtroVentas,
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
            ...filtroVentas,
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
            ...filtroVentas,
          },
        },
        _sum: {
          feeAgenciaNeta: true,
          ivaFeeAgencia: true,
        },
      }),

      prisma.detalleServicio.aggregate({
        where: {
          servicio: {
            ...filtroVentas,
          },
        },
        _sum: {
          comisionAgencia: true,
        },
      }),

      prisma.cliente.count({
        where: {
          servicios: {
            some: {
              ...filtroVentas,
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
              ...filtroVentas,
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

    const totalIngresos =
      Number(ingresosTiquetes._sum.feeAgenciaNeta ?? 0) +
      Number(ingresosTiquetes._sum.ivaFeeAgencia ?? 0) +
      Number(ingresosDetalles._sum.comisionAgencia ?? 0);

    return NextResponse.json({
      totalVendido: redondear(totalVendido),
      carteraPendiente: redondear(carteraPendiente),
      clientesConCartera,
      pagoPendienteProveedores: redondear(pagoPendienteProveedores),
      totalIngresos: redondear(totalIngresos),
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
