import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import PasajeroForm from "@/app/components/dashboard/pasajero-form";

export default async function EditarPasajeroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pasajeroId = Number(id);

  if (Number.isNaN(pasajeroId)) {
    notFound();
  }

  const pasajero = await prisma.pasajero.findUnique({
    where: {
      id: pasajeroId,
    },
  });

  if (!pasajero) {
    notFound();
  }

  return (
    <div className="font-inter">
      <PasajeroForm
        mode="edit"
        pasajeroId={pasajero.id}
        initialData={{
          nombre: pasajero.nombre,
          apellido: pasajero.apellido,
          correo: pasajero.correo,
          telefono: pasajero.telefono,
        }}
      />
    </div>
  );
}
