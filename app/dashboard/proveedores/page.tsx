import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import ProveedoresTable from "@/app/components/dashboard/proveedores/proveedores-table";

export default async function ProveedoresPage() {

  let usuario;

  try {
    usuario = await requirePermission("proveedores", "view");
  } catch {
    redirect("/dashboard");
  }
  
  return <ProveedoresTable role={usuario.role} />;
}
