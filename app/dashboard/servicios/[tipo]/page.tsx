import { notFound } from "next/navigation";

import ServiciosTable from "@/app/components/dashboard/servicios/servicios-table";

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

export default async function TipoServicios({
  params,
}: {
  params: Promise<{
    tipo: string;
  }>;
}) {
  const { tipo } = await params;

  const tipoServicio = slugToTipo[tipo as keyof typeof slugToTipo];

  if (!tipoServicio) {
    notFound();
  }

  return <ServiciosTable tipo={tipoServicio} />;
}
