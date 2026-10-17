import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import ClientForm from "@/app/components/dashboard/forms/client-form";

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
          tipoDocumento: cliente.tipoDocumento,
          documento: cliente.documento,
          direccion: cliente.direccion ?? "",
          ciudad: cliente.ciudad ?? "",
          tipoPersona: cliente.tipoPersona,
          observaciones: cliente.observaciones ?? "",
          razonSocial: cliente.razonSocial ?? "",
          correo: cliente.correo ?? "",
          telefono: cliente.telefono ?? "",
        }}
      />
    </div>
  );
}