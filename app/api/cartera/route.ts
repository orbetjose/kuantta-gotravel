import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getAuthenticatedUser } from "@/actions/auth-actions";
import { TipoServicio } from "@/libs/generated/prisma/client";
import { getDateRange, findEnumValue } from "@/libs/helpers";
import { getSearchIds } from "@/libs/helper-search";
import { EstadoServicio } from "@/libs/generated/prisma/enums";

const getEstadoCartera = (fechaEmision: Date, creditoAgencia: number) => {
  const fechaVencimiento = new Date(fechaEmision);

  fechaVencimiento.setDate(fechaVencimiento.getDate() + creditoAgencia);

  const hoy = new Date();

  const diferenciaMs = fechaVencimiento.getTime() - hoy.getTime();

  const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

  return {
    fechaVencimiento,
    estado: dias < 0 ? "VENCIDO" : "PENDIENTE",
    dias: Math.abs(dias),
  };
};

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (user.role !== "ADMINISTRADOR") {
    return NextResponse.json(
      { error: "No tienes permisos para acceder a cartera" },
      { status: 403 },      
    );
  }

  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search")?.trim() ?? "";
  const tipo = searchParams.get("tipo")?.trim() ?? "";
  const fechaDesde = searchParams.get("fechaDesde")?.trim() ?? "";
  const fechaHasta = searchParams.get("fechaHasta")?.trim() ?? "";
  const skip = (page - 1) * limit;

  const tipoServicio = findEnumValue(Object.values(TipoServicio), tipo);

  const creditoAgencia = searchParams.get("creditoAgencia")?.trim() ?? "";

  const credito = creditoAgencia ? Number(creditoAgencia) : undefined;

  try {
    const fechaEmision = getDateRange(fechaDesde, fechaHasta);

    const { clientesEncontrados, proveedoresEncontrados } =
      await getSearchIds(search);
    const where = {
      AND: [
        { formaPago: "CREDITO_AGENCIA" as const },
        { pagadoCliente: false },
        { estado: { not: EstadoServicio.ANULADO } },
      ],
      ...(tipoServicio
        ? {
            tipo: tipoServicio,
          }
        : {}),
      ...(fechaDesde || fechaHasta
        ? {
            fechaEmision,
          }
        : {}),

      ...(search
        ? {
            OR: [
              ...(clientesEncontrados.length > 0
                ? [
                    {
                      clienteId: {
                        in: clientesEncontrados,
                      },
                    },
                  ]
                : []),

              ...(proveedoresEncontrados.length > 0
                ? [
                    {
                      proveedorId: {
                        in: proveedoresEncontrados,
                      },
                    },
                  ]
                : []),
            ],
          }
        : {}),
      ...(credito !== undefined
        ? {
            creditoAgencia: credito,
          }
        : {}),
    };
    const whereCartera = {
      formaPago: "CREDITO_AGENCIA" as const,
      pagadoCliente: false,
      estado: { not: EstadoServicio.ANULADO },
    };

    const [servicios, total, totalTiquetes, totalDetalles] = await Promise.all([
      prisma.servicio.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          uuid: true,
          tipo: true,
          estado: true,
          fechaEmision: true,
          creditoAgencia: true,
          pagadoCliente: true,
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          tiquete: {
            select: {
              id: true,
              totalPagar: true,
            },
          },
          detalleServicio: {
            select: {
              id: true,
              totalIngreso: true,
            },
          },
        },
      }),

      prisma.servicio.count({
        where,
      }),
      prisma.tiquete.aggregate({
        where: {
          servicio: {
            ...whereCartera,
          },
        },
        _sum: {
          totalPagar: true,
        },
      }),

      prisma.detalleServicio.aggregate({
        where: {
          servicio: {
            ...whereCartera,
          },
        },
        _sum: {
          totalIngreso: true,
        },
      }),
    ]);

    const totalCartera =
      Number(totalTiquetes._sum.totalPagar ?? 0) +
      Number(totalDetalles._sum.totalIngreso ?? 0);
    const serviciosFormateados = servicios.map((servicio) => {
      const { fechaVencimiento, estado, dias } = getEstadoCartera(
        servicio.fechaEmision,
        servicio.creditoAgencia!,
      );

      return {
        id: servicio.id,
        uuid: servicio.uuid,
        tipo: servicio.tipo,
        fechaEmision: servicio.fechaEmision ?? null,
        idTiquete: servicio.tiquete?.id,
        estado: servicio.estado,
        creditoAgencia: servicio.creditoAgencia,
        pagadoCliente: servicio.pagadoCliente,
        fechaVencimiento: fechaVencimiento,
        estadoCredito: estado,
        dias: dias,
        cliente: {
          id: servicio.cliente.id,
          nombre: `${servicio.cliente.nombre} ${servicio.cliente.apellido}`,
        },
        total: servicio.tiquete
          ? Number(servicio.tiquete.totalPagar)
          : Number(servicio.detalleServicio?.totalIngreso),
      };
    });

    return NextResponse.json({
      servicios: serviciosFormateados,
      totalCartera,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo servicios para cartera:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los servicios para cartera.",
      },
      {
        status: 500,
      },
    );
  }
}
