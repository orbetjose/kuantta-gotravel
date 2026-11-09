import DashboardCard from "../../dashboard-card";
import { formatCurrency } from "@/libs/helpers";
import {
  HandCoinsIcon,
  WalletIcon,
  TruckIcon,
  CalendarDaysIcon,
} from "lucide-react";

interface DashboardStatsProps {
  totalVendido: number;
  totalCartera: number;
  pagoPendienteProveedores: number;
  ventasDelDia: number;
  clientesConCartera?: number;
  proveedoresPendientes?: number;
  loading?: boolean;
}

export default function DashboardStatsAsesor({
  totalVendido,
  totalCartera,
  pagoPendienteProveedores,
  ventasDelDia,
  clientesConCartera,
  proveedoresPendientes,
  loading,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <DashboardCard
        title="Total ventas"
        value={formatCurrency(totalVendido)}
        moneda="COP"
        icon={HandCoinsIcon}
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
      <DashboardCard
        title="Ventas del dia"
        value={formatCurrency(ventasDelDia)}
        moneda="COP"
        icon={CalendarDaysIcon}
      />
    </div>
  );
}
