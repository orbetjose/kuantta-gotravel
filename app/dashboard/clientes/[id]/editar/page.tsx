import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import ClientForm from "@/app/components/dashboard/client-form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const clienteId = Number(id);

  if (Number.isNaN(clienteId)) {
    notFound();
  }

  const cliente = await prisma.cliente.findUnique({
    where: {
      id: clienteId,
    },
  });

  if (!cliente) {
    notFound();
  }

  return (
    <div className="font-inter">
      <ClientForm
        mode="edit"
        clienteId={cliente.id}
        initialData={{
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          correo: cliente.correo,
          telefono: cliente.telefono,
        }}
      />
    </div>
  );
}