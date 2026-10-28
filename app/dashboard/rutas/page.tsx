import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import RutasTable from "@/app/components/dashboard/rutas/rutas-table";

export default async function RutasPage() {
  let usuario;

  try {
    usuario = await requirePermission("rutas", "view");
  } catch {
    redirect("/dashboard");
  }

  return <RutasTable role={usuario.role} />;
}
