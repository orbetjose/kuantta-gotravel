import { requirePermission } from "@/libs/authorization";
import DashboardAdministrador from "../components/dashboard/dashboard-administrador";
import DashboardAsesor from "../components/dashboard/dasboard-asesor";
import DashboardFacturador from "../components/dashboard/dashboard-facturador";

export default async function DashboardPage() {
  const usuario = await requirePermission("dashboard", "view");

  switch (usuario.role) {
    case "ADMINISTRADOR":
      return <DashboardAdministrador />;

    case "ASESOR":
      return <DashboardAsesor />;

    case "FACTURADOR":
      return <DashboardFacturador />;

    default:
      return null;
  }
}
