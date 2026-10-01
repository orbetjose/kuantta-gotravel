import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { TipoServicio } from "@/libs/generated/prisma/client";
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

  const skip = (page - 1) * limit;

  const tipoServicio = findEnumValue(Object.values(TipoServicio), tipo);

  try {
    const fechaEmision = getDateRange(fechaDesde, fechaHasta);

    const { clientesEncontrados, proveedoresEncontrados } =
      await getSearchIds(search);

    const where = {
      OR: [
        { estado: "POR_FACTURAR" as const },
        { estado: "FACTURADO" as const },
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
          uuid: true,
          tipo: true,
          estado: true,
          fechaEmision: true,
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
    ]);
    const serviciosFormateados = servicios.map((servicio) => ({
      id: servicio.id,
      uuid: servicio.uuid,
      tipo: servicio.tipo,
      fechaEmision: servicio.fechaEmision ?? null,
      idTiquete: servicio.tiquete?.id,
      estado: servicio.estado,
      cliente: {
        id: servicio.cliente.id,
        nombre: `${servicio.cliente.nombre} ${servicio.cliente.apellido}`,
      },
      total: servicio.tiquete
        ? Number(servicio.tiquete.totalPagar)
        : Number(servicio.detalleServicio?.totalIngreso),
    }));

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
    console.error("Error obteniendo servicios para facturación:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los servicios para facturación.",
      },
      {
        status: 500,
      },
    );
  }
}
