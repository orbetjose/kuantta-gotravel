import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import ProviderForm from "@/app/components/dashboard/forms/provider-form";

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

  try {
    await requirePermission("proveedores", "edit");
  } catch {
    redirect("/dashboard/proveedores");
  }

  return (
    <div className="font-inter">
      <ProviderForm
        mode="edit"
        proveedorId={proveedor.id}
        initialData={{
          razonSocial: proveedor.razonSocial,
          nombreComercial: proveedor.nombreComercial ?? "",
          nit: proveedor.nit,
          categoria: proveedor.categoria,
          ciudad: proveedor.ciudad ?? "",
          direccion: proveedor.direccion ?? "",
          telefono: proveedor.telefono ?? "",
          correoComercial: proveedor.correoComercial ?? "",
          correoFacturacion: proveedor.correoFacturacion ?? "",
          contacto: proveedor.contacto ?? "",
          remuneracion: proveedor.remuneracion,
          monedaBase: proveedor.monedaBase,
          condicionPago: proveedor.condicionPago,
          documentosPdf: proveedor.documentosPdf ?? [],
        }}
      />
    </div>
  );
}
