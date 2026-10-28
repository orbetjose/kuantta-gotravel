import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import ClientesTable from "@/app/components/dashboard/clientes/clientes-table";

export default async function ClientesPage() {
  let usuario;

  try {
    usuario = await requirePermission("clientes", "view");
  } catch {
    redirect("/dashboard");
  }

  return <ClientesTable role={usuario.role} />;
}
