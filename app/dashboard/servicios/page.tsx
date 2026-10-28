import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import ServiciosTable from "@/app/components/dashboard/servicios/servicios-table";

export default async function ServiciosPage() {
  let usuario;

  try {
    usuario = await requirePermission("servicios", "view");
  } catch {
    redirect("/dashboard");
  }

  return <ServiciosTable role={usuario.role} />;
}
