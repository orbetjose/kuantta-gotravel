import { notFound } from "next/navigation";
import { auth } from "@/auth";
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
      tiquete: {
        include: {
          ruta: true,
        },
      },
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
          valorPagadoProveedor: Number(
            servicio.detalleServicio.valorPagadoProveedor,
          ),
          trm: Number(servicio.detalleServicio.trm),
          feePagoTarjetaCredito: Number(
            servicio.detalleServicio.feePagoTarjetaCredito,
          ),
          valorPagadoGoTravel: Number(
            servicio.detalleServicio.valorPagadoGoTravel,
          ),
          totalIngreso: Number(servicio.detalleServicio.totalIngreso),
        }
      : null,
  };

  if (!servicio) {
    notFound();
  }

  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  return <ServiciosDetail servicio={servicioData} role={session.user.role} />;
}
