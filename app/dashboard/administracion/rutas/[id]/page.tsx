import { notFound } from "next/navigation";

import { prisma } from "@/libs/prisma";
import RutaDetail from "@/app/components/dashboard/rutas/ruta-detail";

export default async function RutasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rutaId = Number(id);

  if (Number.isNaN(rutaId)) {
    notFound();
  }

  const ruta = await prisma.ruta.findUnique({
    where: {
      id: rutaId,
    },
  });

  if (!ruta) {
    notFound();
  }

  return <RutaDetail ruta={ruta} />;
}