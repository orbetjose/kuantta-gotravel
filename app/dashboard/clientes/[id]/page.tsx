import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import { prisma } from "@/libs/prisma";
import ClienteDetail from "@/app/components/dashboard/clientes/cliente-detail";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let usuario;

  try {
    usuario = await requirePermission("clientes", "view");
  } catch {
    redirect("/dashboard");
  }

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
        take: 5,
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
              totalVentaAgencia: true,
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
            totalVentaAgencia: Number(
              servicio.detalleServicio.totalVentaAgencia,
            ),
          }
        : null,
    })),
  };

  return <ClienteDetail cliente={clienteData} role={usuario.role} />;
}
