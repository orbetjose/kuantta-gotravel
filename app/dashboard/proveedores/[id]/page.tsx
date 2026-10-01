import { notFound } from "next/navigation";

import { prisma } from "@/libs/prisma";
import ProveedorDetail from "@/app/components/dashboard/proveedores/proveedor-detail";

export default async function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const proveedorId = Number(id);

  if (Number.isNaN(proveedorId)) {
    notFound();
  }

  const proveedor = await prisma.proveedor.findUnique({
    where: {
      id: proveedorId,
    },
    include: {
      servicios: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          proveedor: true,
          tiquete: {
            select: {
              id: true,
              totalPagar: true,
            },
          },
          // Cuando existan:
          // hotel: {
          //   select: {
          //     id: true,
          //     totalPagar: true,
          //   },
          // },
          // transporte: {
          //   select: {
          //     id: true,
          //     totalPagar: true,
          //   },
          // },
        },
      },
    },
  });

  if (!proveedor) {
    notFound();
  }
  const proveedorData = {
    ...proveedor,
    servicios: proveedor.servicios.map((servicio) => ({
      ...servicio,
      tiquete: servicio.tiquete
        ? {
            ...servicio.tiquete,
            totalPagar: Number(servicio.tiquete.totalPagar),
          }
        : null,
    })),
  };

  return <ProveedorDetail proveedor={proveedorData} />;
}
