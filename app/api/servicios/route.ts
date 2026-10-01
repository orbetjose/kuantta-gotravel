import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { TipoServicio, EstadoServicio } from "@/libs/generated/prisma/enums";
import { getDateRange, findEnumValue } from "@/libs/helpers";
import { getSearchIds } from "@/libs/helper-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search")?.trim() ?? "";
  const tipo = searchParams.get("tipo")?.trim() ?? "";
  const fechaDesde = searchParams.get("fechaDesde")?.trim() ?? "";
  const fechaHasta = searchParams.get("fechaHasta")?.trim() ?? "";
  const estado = searchParams.get("estado")?.trim() ?? "";

  const skip = (page - 1) * limit;

  const tiposBusqueda = search
    ? Object.values(TipoServicio).filter((item) =>
        item.toLowerCase().includes(search.toLowerCase()),
      )
    : [];
    
  const tipoServicio = findEnumValue(Object.values(TipoServicio), tipo);

  const estadoServicio = findEnumValue(Object.values(EstadoServicio), estado);

  try {
    const fechaEmision = getDateRange(fechaDesde, fechaHasta);

    const { clientesEncontrados, proveedoresEncontrados } =
      await getSearchIds(search);

    const where = {
      ...(tipoServicio
        ? {
            tipo: tipoServicio,
          }
        : {}),

      ...(estadoServicio
        ? {
            estado: estadoServicio,
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
              ...(tiposBusqueda.length > 0
                ? [
                    {
                      tipo: {
                        in: tiposBusqueda,
                      },
                    },
                  ]
                : []),

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
    };

    const [servicios, total] = await Promise.all([
      prisma.servicio.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,

        select: {
          id: true,
          tipo: true,
          estado: true,
          fechaEmision: true,

          cliente: true,

          proveedor: {
            select: {
              razonSocial: true,
            },
          },

          tiquete: {
            select: {
              totalPagar: true,
            },
          },

          detalleServicio: {
            select: {
              totalIngreso: true,
            },
          },
        },
      }),

      prisma.servicio.count({
        where,
      }),
    ]);

    const serviciosFormateados = servicios.map((servicio) => {
      const total =
        servicio.tipo === "TIQUETE"
          ? servicio.tiquete?.totalPagar
          : servicio.detalleServicio?.totalIngreso;

      return {
        id: servicio.id,

        tipo: servicio.tipo,

        cliente: servicio.cliente,

        proveedor: servicio.proveedor?.razonSocial ?? "Sin proveedor",

        total: total?.toString() ?? "0",

        estado: servicio.estado,

        fechaEmision: servicio.fechaEmision,
      };
    });

    return NextResponse.json({
      servicios: serviciosFormateados,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo servicios:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los servicios.",
      },
      {
        status: 500,
      },
    );
  }
}
