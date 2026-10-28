import { notFound, redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import { requirePermission } from "@/libs/authorization";
import RutaDetail from "@/app/components/dashboard/rutas/ruta-detail";

export default async function RutasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let usuario;

  try {
    usuario = await requirePermission("rutas", "view");
  } catch {
    redirect("/dashboard");
  }

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

  return <RutaDetail ruta={ruta} role={usuario.role} />;
}
