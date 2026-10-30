"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface VentaPorTipo {
  tipo: string;
  total: number;
}

interface DashboardVentasPorTipoProps {
  dateRange?: DateRange;
}

interface RespuestaVentasPorTipo {
  datos: VentaPorTipo[];
  totalVendido: number;
}

const COLORES = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#e11d48",
  "#0891b2",
  "#ea580c",
  "#64748b",
];

const formatoCOP = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

const ETIQUETAS: Record<string, string> = {
  TIQUETE: "Tiquetes",
  HOTEL: "Hoteles",
  TRASLADO: "Traslados",
  ALQUILER_AUTO: "Alquiler de autos",
  SALON: "Salones",
  EVENTO: "Eventos",
  SILLA: "Sillas",
  TARJETA_ASISTENCIA: "Tarjetas de asistencia",
  VISA: "Visas",
  WEB_CHECKIN: "Web check-in",
  PLAN_VACACIONAL: "Planes vacacionales",
  OTROS: "Otros",
};

export default function DashboardVentasPorTipo({
  dateRange,
}: DashboardVentasPorTipoProps) {
  const [datos, setDatos] = useState<VentaPorTipo[]>([]);
  const [totalVendido, setTotalVendido] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function obtenerVentas() {
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
          `/api/dashboard/asesor/ventas-por-tipo?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("No se pudieron obtener las ventas");
        }

        const data: RespuestaVentasPorTipo = await response.json();

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

    obtenerVentas();

    return () => controller.abort();
  }, [dateRange?.from, dateRange?.to]);

  const datosOrdenados = [...datos].sort((a, b) => b.total - a.total);

  const TOP_LIMITE = 5;

  const datosVisibles = datosOrdenados.slice(0, TOP_LIMITE);

  const totalOtros = datosOrdenados
    .slice(TOP_LIMITE)
    .reduce((acumulado, item) => acumulado + item.total, 0);

  if (totalOtros > 0) {
    datosVisibles.push({
      tipo: "OTROS",
      total: totalOtros,
    });
  }

  const datosConPorcentaje = datosVisibles.map((item) => ({
    ...item,
    porcentaje: totalVendido > 0 ? (item.total / totalVendido) * 100 : 0,
  }));

  return (
    <section className="flex h-full md:min-h-80 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-inter text-sm font-semibold text-primary-blue">
          Distribución por servicio
        </h2>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          Cargando ventas...
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-red-600">
          No se pudieron cargar las ventas.
        </div>
      ) : datos.length === 0 || totalVendido <= 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-500">
          No hay ventas para este período.
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 items-center gap-6 md:grid-cols-2">
          <div className="relative h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosConPorcentaje}
                  dataKey="total"
                  nameKey="tipo"
                  innerRadius="66%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="none"
                  shape={(props) => {
                    const index = datosConPorcentaje.findIndex(
                      (item) => item.tipo === props.payload.tipo,
                    );

                    return (
                      <Sector
                        {...props}
                        fill={COLORES[index % COLORES.length]}
                      />
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="mt-1 text-center text-lg font-semibold text-primary-blue">
                {formatoCOP(totalVendido)}
              </span>
              <span className="text-xs text-gray-500">Total ventas</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {datosConPorcentaje.map((item, index) => (
              <div key={item.tipo} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-3 w-3 shrink-0 rounded-sm"
                  style={{
                    backgroundColor: COLORES[index % COLORES.length],
                  }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-fifth-gray">
                      {ETIQUETAS[item.tipo] ?? item.tipo}
                    </span>
                    <span className="shrink-0 text-sm font-medium text-fifth-gray">
                      {item.porcentaje.toLocaleString("es-CO", {
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatoCOP(item.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
