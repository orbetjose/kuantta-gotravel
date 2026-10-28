import { notFound, redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";

import { prisma } from "@/libs/prisma";
import ServiciosDetail from "@/app/components/dashboard/servicios/servicios-detail";

const slugToTipo = {
  tiquete: "TIQUETE",
  hotel: "HOTEL",
  "alquiler-auto": "ALQUILER_AUTO",
  salon: "SALON",
  evento: "EVENTO",
  silla: "SILLA",
  "tarjeta-asistencia": "TARJETA_ASISTENCIA",
  traslado: "TRASLADO",
  visa: "VISA",
  "web-checkin": "WEB_CHECKIN",
  "plan-vacacional": "PLAN_VACACIONAL",
} as const;

export default async function ServicioDetailPage({
  params,
}: {
  params: Promise<{
    tipo: string;
    id: string;
  }>;
}) {
  const { tipo, id } = await params;

  const tipoServicio = slugToTipo[tipo as keyof typeof slugToTipo];

  if (!tipoServicio) {
    notFound();
  }

  const servicioId = Number(id);

  if (Number.isNaN(servicioId)) {
    notFound();
  }

  const servicio = await prisma.servicio.findUnique({
    where: {
      id: servicioId,
    },
    include: {
      cliente: true,
      pasajero: true,
      proveedor: true,
      detalleServicio: true,
    },
  });

  if (!servicio) {
    notFound();
  }

  // Verificamos que el tipo de la URL corresponda
  // con el tipo real del servicio.
  if (servicio.tipo !== tipoServicio) {
    notFound();
  }

  const servicioData = {
    ...servicio,

    detalleServicio: servicio.detalleServicio
      ? {
          ...servicio.detalleServicio,
          totalPagado: Number(servicio.detalleServicio.totalPagado),
          feePagoTarjetaCredito: Number(
            servicio.detalleServicio.feePagoTarjetaCredito,
          ),
          totalIngreso: Number(servicio.detalleServicio.totalVentaAgencia),
        }
      : null,
  };

  if (!servicio) {
    notFound();
  }

  let usuario;

  try {
    usuario = await requirePermission("pasajeros", "view");
  } catch {
    redirect("/dashboard");
  }

  return <ServiciosDetail servicio={servicioData} role={usuario.role} />;
}
