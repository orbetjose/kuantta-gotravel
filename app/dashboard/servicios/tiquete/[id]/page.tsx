import { notFound, redirect } from "next/navigation";
import { prisma } from "@/libs/prisma";
import TiqueteDetail from "@/app/components/dashboard/tiquetes/tiquete-detail";
import { requirePermission } from "@/libs/authorization";
import { tiqueteDetailSelect } from "@/types/tiquete";

export default async function TiqueteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tiqueteId = Number(id);

  if (Number.isNaN(tiqueteId)) {
    notFound();
  }

  const tiquete = await prisma.tiquete.findUnique({
    where: {
      id: tiqueteId,
    },
    select: tiqueteDetailSelect,
  });

  if (!tiquete) {
    notFound();
  }

  let usuario;

  try {
    usuario = await requirePermission("servicios", "view");
  } catch {
    redirect("/dashboard");
  }

  return <TiqueteDetail tiquete={tiquete} role={usuario.role} />;
}
