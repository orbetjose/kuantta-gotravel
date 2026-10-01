import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { EstadoServicio } from "@/libs/generated/prisma/enums";
import { getDateRange, findEnumValue } from "@/libs/helpers";
import { getSearchIds } from "@/libs/helper-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const search = searchParams.get("search")?.trim() ?? "";
  const fechaDesde = searchParams.get("fechaDesde")?.trim() ?? "";
  const fechaHasta = searchParams.get("fechaHasta")?.trim() ?? "";
  const estado = searchParams.get("estado")?.trim() ?? "";

  const skip = (page - 1) * limit;

  const estadoServicio = findEnumValue(
    Object.values(EstadoServicio),
    estado,
  );

  try {
    const fechaEmision = getDateRange(fechaDesde, fechaHasta);

    const {
      clientesEncontrados,
      proveedoresEncontrados,
    } = await getSearchIds(search);

    const servicioWhere = {
      ...(estadoServicio && {
        estado: estadoServicio,
      }),

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
    };

    const where = {
      servicio: servicioWhere,
    };

    const [tiquetes, total] = await Promise.all([
      prisma.tiquete.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,

        select: {
          id: true,
          numeroTiquete: true,
          totalPagar: true,

          servicio: {
            select: {
              estado: true,
              fechaEmision: true,

              cliente: {
                select: {
                  nombre: true,
                  apellido: true,
                },
              },

              proveedor: {
                select: {
                  razonSocial: true,
                },
              },
            },
          },
        },
      }),

      prisma.tiquete.count({
        where,
      }),
    ]);

    return NextResponse.json({
      tiquetes: tiquetes.map((tiquete) => ({
        id: tiquete.id,
        numeroTiquete: tiquete.numeroTiquete,
        fechaEmision: tiquete.servicio.fechaEmision,
        totalPagar: tiquete.totalPagar.toString(),

        cliente: `${tiquete.servicio.cliente.nombre} ${tiquete.servicio.cliente.apellido}`,

        proveedor:
          tiquete.servicio.proveedor?.razonSocial ?? "Sin proveedor",

        estado: tiquete.servicio.estado,
      })),

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo tiquetes:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los tiquetes.",
      },
      {
        status: 500,
      },
    );
  }
}
