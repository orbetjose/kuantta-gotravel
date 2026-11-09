"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface FacturadoDiario {
  fecha: string;
  dia: string;
  facturados: number;
}

interface FacturadosSemanalesResponse {
  datos: FacturadoDiario[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function DashboardFacturadosSemanales() {
  const [datos, setDatos] = useState<FacturadoDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function obtenerFacturados() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          "/api/dashboard/facturador/facturados-semanales",
        );

        if (!response.ok) {
          throw new Error("Error obteniendo facturados semanales");
        }

        const data: FacturadosSemanalesResponse = await response.json();
        setDatos(data.datos);
      } catch (error) {
        console.error("Error obteniendo facturados semanales:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    obtenerFacturados();
  }, []);


  return (
    <section className="flex h-full md:min-h-80 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-inter text-sm 2xl:text-base font-semibold text-primary-blue">
          Facturación diaria (últimos 7 días)
        </h2>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <p className="font-inter text-sm text-gray-500">
            Cargando gráfico...
          </p>
        </div>
      ) : error ? (
        <div className="flex h-72 items-center justify-center">
          <p className="font-inter text-sm text-red-500">
            No se pudieron cargar los servicios facturados.
          </p>
        </div>
      ) : (
        <div className="h-72 flex-1 w-full text-primary-blue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datos}
              margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="dia"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />

              <YAxis
                tickFormatter={formatCompactCurrency}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={65}
              />

              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Facturados"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fecha ?? ""
                }
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  fontFamily: "inherit",
                  fontSize: "13px",
                }}
              />

              <Bar
                dataKey="facturados"
                name="Facturados"
                fill="currentColor"
                radius={[5, 5, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
