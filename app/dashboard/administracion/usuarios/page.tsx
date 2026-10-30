import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import UsuariosTable from "@/app/components/dashboard/usuarios/usuarios-table";

export default async function UsuariosPage() {
  let usuario;

  try {
    usuario = await requirePermission("usuarios", "view");
  } catch {
    redirect("/dashboard");
  }
  return <UsuariosTable role={usuario.role} />;
}
