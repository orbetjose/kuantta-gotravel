import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import TiquetesTable from "@/app/components/dashboard/tiquetes/tiquetes-table";

export default async function TiquetesPage() {
  let usuario;

  try {
    usuario = await requirePermission("servicios", "view");
  } catch {
    redirect("/dashboard");
  }
  return <TiquetesTable role={usuario.role} />;
}
