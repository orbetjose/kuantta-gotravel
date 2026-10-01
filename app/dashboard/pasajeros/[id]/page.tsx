import { notFound } from "next/navigation";

import { prisma } from "@/libs/prisma";
import PasajeroDetail from "@/app/components/dashboard/pasajero/pasajero-detail";

export default async function PasajeroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pasajeroId = Number(id);

  if (Number.isNaN(pasajeroId)) {
    notFound();
  }

  const pasajero = await prisma.pasajero.findUnique({
    where: {
      id: pasajeroId,
    },
    include: {
      servicios: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          proveedor: true,
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
      },
    },
  });

  if (!pasajero) {
    notFound();
  }

const pasajeroData = {
  ...pasajero,
  servicios: pasajero.servicios.map((servicio) => ({
    ...servicio,

    tiquete: servicio.tiquete
      ? {
          ...servicio.tiquete,
          totalPagar: Number(servicio.tiquete.totalPagar),
        }
      : null,

    detalleServicio: servicio.detalleServicio
      ? {
          ...servicio.detalleServicio,
          totalIngreso: Number(servicio.detalleServicio.totalIngreso),
        }
      : null,
  })),
};

  return <PasajeroDetail pasajero={pasajeroData} />;
}
