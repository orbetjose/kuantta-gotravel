"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/libs/helpers";
import { useMediaQuery } from "@/libs/hooks";

type PeriodoAgrupacion = "DIA" | "SEMANA" | "MES";

interface DashboardSalesByPeriodProps {
  data: {
    periodo: string;
    total: number;
  }[];
  periodoAgrupacion: PeriodoAgrupacion;
}

function formatPeriodo(periodo: string, agrupacion: PeriodoAgrupacion) {
  if (agrupacion === "MES") {
    const [year, month] = periodo.split("-");

    const fecha = new Date(Number(year), Number(month) - 1, 1);

    return fecha.toLocaleDateString("es-CO", {
      month: "short",
      year: "numeric",
    });
  }

  if (agrupacion === "SEMANA") {
    const [year, month, day] = periodo.split("-").map(Number);

    const fecha = new Date(year, month - 1, day);

    return fecha.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    });
  }

  // DIA
  const [year, month, day] = periodo.split("-").map(Number);

  const fecha = new Date(year, month - 1, day);

  return fecha.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardSalesByPeriod({
  data,
  periodoAgrupacion,
}: DashboardSalesByPeriodProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatPeriodo(item.periodo, periodoAgrupacion),
  }));

  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h3 className="font-inter text-base font-semibold text-gray-900">
          Ventas por período
        </h3>

        <p className="mt-1 font-inter text-sm text-gray-500">
          Evolución de las ventas según el rango seleccionado
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={isMobile ? 3 : 1}
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={isMobile ? 20 : 45}
              tick={{
                fontSize: isMobile ? 12 : 16,
              }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("es-CO", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(Number(value))
              }
            />

            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
              labelFormatter={(label) => label}
            />

            <Line
              type="monotone"
              dataKey="total"
              name="Ventas"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
