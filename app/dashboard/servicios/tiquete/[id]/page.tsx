import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import TiqueteDetail from "@/app/components/dashboard/tiquetes/tiquete-detail";
import { auth } from "@/auth";
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

  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  return <TiqueteDetail tiquete={tiquete} role={session.user.role} />;
}
