"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getServiceTypeConfig } from "@/libs/helpers";

interface ServiceByQuantity {
  tipo: string;
  cantidad: number;
}

interface DashboardServicesByQuantityProps {
  data: ServiceByQuantity[];
}

export default function DashboardServicesByQuantity({
  data,
}: DashboardServicesByQuantityProps) {
  const total = data.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-inter text-base font-semibold text-gray-900">
          Top 5 servicios más vendidos
        </h2>
      </div>

      <div className="relative h-70">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="cantidad"
              nameKey="tipo"
              cx="50%"
              cy="50%"
              innerRadius={95}
              outerRadius={125}
              paddingAngle={2}
              strokeWidth={0}
              shape={(props) => {
                const {
                  cx,
                  cy,
                  innerRadius,
                  outerRadius,
                  startAngle,
                  endAngle,
                  payload,
                } = props;

                const index = data.findIndex(
                  (item) => item.tipo === payload.tipo,
                );

                const config = getServiceTypeConfig(payload.tipo, index);

                const path = [
                  `M ${cx + innerRadius * Math.cos((startAngle * Math.PI) / 180)}`,
                  `${cy + innerRadius * Math.sin((startAngle * Math.PI) / 180)}`,
                  `L ${cx + outerRadius * Math.cos((startAngle * Math.PI) / 180)}`,
                  `${cy + outerRadius * Math.sin((startAngle * Math.PI) / 180)}`,
                  `A ${outerRadius} ${outerRadius} 0 ${
                    Math.abs(endAngle - startAngle) > 180 ? 1 : 0
                  } 1`,
                  `${cx + outerRadius * Math.cos((endAngle * Math.PI) / 180)}`,
                  `${cy + outerRadius * Math.sin((endAngle * Math.PI) / 180)}`,
                  `L ${cx + innerRadius * Math.cos((endAngle * Math.PI) / 180)}`,
                  `${cy + innerRadius * Math.sin((endAngle * Math.PI) / 180)}`,
                  `A ${innerRadius} ${innerRadius} 0 ${
                    Math.abs(endAngle - startAngle) > 180 ? 1 : 0
                  } 0`,
                  `${cx + innerRadius * Math.cos((startAngle * Math.PI) / 180)}`,
                  `${cy + innerRadius * Math.sin((startAngle * Math.PI) / 180)}`,
                  "Z",
                ].join(" ");

                return <path d={path} fill={config.color} />;
              }}
            />

            <Tooltip
              formatter={(value, name) => {
                const cantidad = Number(value);

                const porcentaje =
                  total > 0 ? ((cantidad / total) * 100).toFixed(1) : "0";

                return [
                  `${cantidad} (${porcentaje}%)`,
                  getServiceTypeConfig(String(name), 0).label,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-inter text-3xl font-bold text-gray-900">
            {total}
          </span>

          <span className="font-inter text-xs text-gray-500">servicios</span>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {data.map((item, index) => {
          const config = getServiceTypeConfig(item.tipo, index);

          const porcentaje =
            total > 0 ? ((item.cantidad / total) * 100).toFixed(1) : "0";

          return (
            <div
              key={item.tipo}
              className="flex items-center justify-between font-inter text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: config.color,
                  }}
                />

                <span className="min-w-0 truncate text-gray-600">
                  {config.label}
                </span>
              </div>

              <span className="ml-4 shrink-0 font-medium text-gray-900">
                {item.cantidad}

                <span className="ml-1 text-gray-400">({porcentaje}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
