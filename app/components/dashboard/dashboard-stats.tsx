import DashboardCard from "../dashboard-card";
import { formatCurrency } from "@/libs/helpers";

interface DashboardStatsProps {
  totalVendido: number;
  totalCartera: number;
  pendientePorFacturar: number;
  loading?: boolean;
}

export default function DashboardStats({
  totalVendido,
  totalCartera,
  pendientePorFacturar,
  loading,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <DashboardCard
        title="Total vendido"
        value={formatCurrency(totalVendido)}
        description="Total registrado"
      />

      <DashboardCard
        title="Total en cartera"
        value={formatCurrency(totalCartera)}
        description="Pendiente de pago"
      />

      <DashboardCard
        title="Pendiente por facturar"
        value={formatCurrency(pendientePorFacturar)}
        description="Servicios por facturar"
      />
    </div>
  );
}
