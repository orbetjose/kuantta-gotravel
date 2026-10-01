"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getServiceTypeConfig } from "@/libs/helpers";
import { formatCurrency, formatServiceType } from "@/libs/helpers";
import { useMediaQuery } from "@/libs/hooks";

interface SalesByType {
  tipo: string;
  total: number;
}

interface DashboardSalesByTypeProps {
  data: SalesByType[];
}

export default function DashboardSalesByType({
  data,
}: DashboardSalesByTypeProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm overflow-x-auto">
      <div className="mb-5">
        <h2 className="font-inter text-base font-semibold text-gray-900">
          Ventas por tipo de servicio
        </h2>
      </div>

      <div className="md:h-98 h-70">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="tipo"
              axisLine={false}
              tickLine={false}
              interval={isMobile ? 1 : 0}
              height={isMobile ? 45 : 30}
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={y}
                  dy={12}
                  textAnchor="middle"
                  className="font-inter text-xs fill-gray-600"
                >
                  {formatServiceType(payload.value)}
                </text>
              )}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={isMobile ? 35 : 45}
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
              labelFormatter={(label) => formatServiceType(String(label))}
            />

            <Bar
              dataKey="total"
              name="Ventas"
              barSize={isMobile ? 28 : undefined}
              shape={(props) => {
                const { x, y, width, height, payload } = props;

                const index = data.findIndex(
                  (item) => item.tipo === payload.tipo,
                );

                const config = getServiceTypeConfig(payload.tipo, index);

                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={6}
                    ry={6}
                    fill={config.color}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
