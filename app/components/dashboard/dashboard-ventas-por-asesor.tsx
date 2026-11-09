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
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface VentaAsesor {
  asesorId: string;
  asesor: string;
  total: number;
}

interface DashboardVentasPorTipoProps {
  dateRange?: DateRange;
}

interface VentasPorAsesorResponse {
  datos: VentaAsesor[];
  totalVendido: number;
  rango: {
    fechaDesde: string;
    fechaHasta: string;
  };
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

export default function DashboardVentasPorAsesor({
  dateRange,
}: DashboardVentasPorTipoProps) {
  const [datos, setDatos] = useState<VentaAsesor[]>([]);
  const [totalVendido, setTotalVendido] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function obtenerVentasPorAsesor() {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams();

        if (dateRange?.from) {
          params.set("fechaDesde", format(dateRange.from, "yyyy-MM-dd"));
        }

        if (dateRange?.to) {
          params.set("fechaHasta", format(dateRange.to, "yyyy-MM-dd"));
        }

        const response = await fetch(
          `/api/dashboard/administrador/ventas-por-asesor?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Error obteniendo ventas por asesor");
        }

        const data: VentasPorAsesorResponse = await response.json();

        setDatos(data.datos);
        setTotalVendido(data.totalVendido);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    obtenerVentasPorAsesor();
    return () => controller.abort();
  }, [dateRange?.from, dateRange?.to]);



  return (
    <section className="flex h-full min-h-80 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-inter text-sm 2xl:text-base font-semibold text-primary-blue">
          Ventas por asesor
        </h2>
        <p className="mt-1 font-inter text-xs text-gray-500">
          Acumulado del mes
        </p>
        {!loading && !error && (
          <p className="mt-1 font-inter text-xs text-gray-500">
            Total vendido: {formatCurrency(totalVendido)}
          </p>
        )}
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
            No se pudieron cargar las ventas.
          </p>
        </div>
      ) : datos.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
          <p className="font-inter text-sm text-gray-500">
            No hay asesores registrados.
          </p>
        </div>
      ) : (
        <div
          className="w-full flex-1 text-primary-blue"
          style={{
            height: Math.max(288, datos.length * 55),
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datos}
              layout="vertical"
              margin={{ top: 8, right: 20, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#E5E7EB"
              />

              <XAxis
                type="number"
                tickFormatter={formatCompactCurrency}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                type="category"
                dataKey="asesor"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={110}
              />

              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Ventas"]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                  fontFamily: "inherit",
                  fontSize: "13px",
                }}
              />

              <Bar
                dataKey="total"
                name="Ventas"
                fill="currentColor"
                radius={[0, 5, 5, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
