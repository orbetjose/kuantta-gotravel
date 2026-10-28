import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import CarteraTable from "@/app/components/dashboard/cartera/cartera-table";

export default async function CarteraPage() {
  let usuario;

  try {
    usuario = await requirePermission("cartera", "view");
  } catch {
    redirect("/dashboard");
  }

  return <CarteraTable role={usuario.role} />;
}
