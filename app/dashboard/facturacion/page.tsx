import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import FacturacionTable from "@/app/components/dashboard/facturacion/facturacion-table";

export default async function FacturacionPage() {
  let usuario;

  try {
    usuario = await requirePermission("facturacion", "view");
  } catch {
    redirect("/dashboard");
  }

  return <FacturacionTable role={usuario.role} />;
}
