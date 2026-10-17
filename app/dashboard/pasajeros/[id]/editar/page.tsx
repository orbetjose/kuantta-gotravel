import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import PasajeroForm from "@/app/components/dashboard/forms/pasajero-form";

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
          documento: pasajero.documento,
          nombre: pasajero.nombre,
          apellido: pasajero.apellido,
          fechaNacimiento: pasajero.fechaNacimiento.toISOString().split("T")[0],
          preferenciaSilla: pasajero.preferenciaSilla,
          correo: pasajero.correo,
          telefono: pasajero.telefono,
        }}
      />
    </div>
  );
}
