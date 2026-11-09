import DashboardCard from "../../dashboard-card";
import { formatCurrency } from "@/libs/helpers";
import { NewspaperIcon, WalletIcon, TruckIcon } from "lucide-react";

interface DashboardStatsFacturadorProps {
  totalFacturadoHoy: number;
  totalCartera: number;
  pagoPendienteProveedores: number;
  clientesConCartera?: number;
  proveedoresPendientes?: number;
  loading?: boolean;
}

export default function DashboardStatsFacturador({
  totalFacturadoHoy,
  totalCartera,
  pagoPendienteProveedores,
  clientesConCartera,
  proveedoresPendientes,
  loading,
}: DashboardStatsFacturadorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <DashboardCard
        title="Total facturado hoy"
        value={formatCurrency(totalFacturadoHoy)}
        moneda="COP"
        icon={NewspaperIcon}
      />

      <DashboardCard
        title="Cartera pendiente"
        value={formatCurrency(totalCartera)}
        moneda="COP"
        icon={WalletIcon}
        clientesConCartera={clientesConCartera}
      />

      <DashboardCard
        title="Pago pendiente a proveedores"
        value={formatCurrency(pagoPendienteProveedores)}
        moneda="COP"
        icon={TruckIcon}
        proveedoresPendientes={proveedoresPendientes}
      />
    </div>
  );
}
