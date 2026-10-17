import { notFound } from "next/navigation";

import { prisma } from "@/libs/prisma";
import UsuarioDetail from "@/app/components/dashboard/usuarios/usuarios-detail";

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuarioId = id;

  if (!usuarioId) {
    notFound();
  }

  const usuario = await prisma.user.findUnique({
    where: {
      id: usuarioId,
    }
  });


  if (!usuario) {
    notFound();
  }

 

  return <UsuarioDetail usuario={usuario} />;
}
