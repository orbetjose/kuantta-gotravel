import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import ProviderForm from "@/app/components/dashboard/provider-form";

export default async function EditarProveedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const proveedorId = Number(id);

  if (Number.isNaN(proveedorId)) {
    notFound();
  }

  const proveedor = await prisma.proveedor.findUnique({
    where: {
      id: proveedorId,
    },
  });

  if (!proveedor) {
    notFound();
  }

  return (
    <div className="font-inter">
      <ProviderForm
        mode="edit"
        proveedorId={proveedor.id}
        initialData={{
          razonSocial: proveedor.razonSocial,
          ruc: proveedor.ruc,
          direccionFiscal: proveedor.direccionFiscal,
          correo: proveedor.correo,
          telefono: proveedor.telefono,
        }}
      />
    </div>
  );
}