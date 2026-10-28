import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import PasajerosTable from "@/app/components/dashboard/pasajero/pasajero-table";

export default async function PasajerosPage() {
  
  let usuario;

  try {
    usuario = await requirePermission("pasajeros", "view");
  } catch {
    redirect("/dashboard");
  }

  return <PasajerosTable role={usuario.role} />;
}
