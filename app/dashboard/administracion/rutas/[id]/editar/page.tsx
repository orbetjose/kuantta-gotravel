import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import RouteForm from "@/app/components/dashboard/routes-form";

export default async function EditarRutaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const routeId = Number(id);

  if (Number.isNaN(routeId)) {
    notFound();
  }

  const ruta = await prisma.ruta.findUnique({
    where: {
      id: routeId,
    },
  });

  if (!ruta) {
    notFound();
  }

  return (
    <div className="font-inter">
      <RouteForm
        mode="edit"
        routeId={ruta.id}
        initialData={{
          origen: ruta.origen,
          destino: ruta.destino,
          codigoOrigen: ruta.codigoOrigen,
          codigoDestino: ruta.codigoDestino,
        }}
      />
    </div>
  );
}