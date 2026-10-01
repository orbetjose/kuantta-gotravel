import { notFound } from "next/navigation";

import { prisma } from "@/libs/prisma";
import ClienteDetail from "@/app/components/dashboard/clientes/cliente-detail";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const clienteId = Number(id);

  if (Number.isNaN(clienteId)) {
    notFound();
  }

  const cliente = await prisma.cliente.findUnique({
    where: {
      id: clienteId,
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

  if (!cliente) {
    notFound();
  }

const clienteData = {
  ...cliente,
  servicios: cliente.servicios.map((servicio) => ({
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

  return <ClienteDetail cliente={clienteData} />;
}
