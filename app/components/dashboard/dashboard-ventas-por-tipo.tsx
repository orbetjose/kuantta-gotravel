"use client";

import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  LabelList,
} from "recharts";
import {
  Plane,
  Hotel,
  CarFront,
  Building2,
  PartyPopper,
  Armchair,
  ShieldCheck,
  Stamp,
  ClipboardCheck,
  Palmtree,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

interface Etiqueta {
  label: string;
  icon: LucideIcon;
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

const ETIQUETAS: Record<string, Etiqueta> = {
  TIQUETE: { label: "Tiquetes", icon: Plane },
  HOTEL: { label: "Hoteles", icon: Hotel },
  TRASLADO: { label: "Traslados", icon: CarFront },
  ALQUILER_AUTO: { label: "Alquiler de autos", icon: CarFront },
  SALON: { label: "Salones", icon: Building2 },
  EVENTO: { label: "Eventos", icon: PartyPopper },
  SILLA: { label: "Sillas", icon: Armchair },
  TARJETA_ASISTENCIA: {
    label: "Tarjetas de asistencia",
    icon: ShieldCheck,
  },
  VISA: { label: "Visas", icon: Stamp },
  WEB_CHECKIN: { label: "Web check-in", icon: ClipboardCheck },
  PLAN_VACACIONAL: { label: "Planes vacacionales", icon: Palmtree },
  OTROS: { label: "Otros", icon: Package },
};

interface PorcentajeLabelProps {
  x?: number;
  y?: number;
  value?: number | string;
}

// Etiqueta personalizada para mostrar el porcentaje en el gráfico
function PorcentajeLabel({ x, y, value }: PorcentajeLabelProps) {
  if (typeof x !== "number" || typeof y !== "number" || value === undefined) {
    return null;
  }

  const porcentaje = Number(value);

  // Evitamos etiquetas demasiado juntas en segmentos pequeños
  if (porcentaje < 4) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight={600}
      stroke="rgba(0,0,0,0.2)"
      strokeWidth={2}
      paintOrder="stroke"
    >
      {`${porcentaje.toLocaleString("es-CO", {
        maximumFractionDigits: 1,
      })}%`}
    </text>
  );
}

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
          `/api/dashboard/resumen/ventas-por-tipo?${params.toString()}`,
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
    // Evitamos duplicar la categoría OTROS si ya existe entre los primeros cinco.
    const indiceOtros = datosVisibles.findIndex(
      (item) => item.tipo === "OTROS",
    );

    if (indiceOtros >= 0) {
      datosVisibles[indiceOtros] = {
        ...datosVisibles[indiceOtros],
        total: datosVisibles[indiceOtros].total + totalOtros,
      };
    } else {
      datosVisibles.push({
        tipo: "OTROS",
        total: totalOtros,
      });
    }
  }

  const datosConPorcentaje = datosVisibles.map((item) => ({
    ...item,
    porcentaje: totalVendido > 0 ? (item.total / totalVendido) * 100 : 0,
  }));

  return (
    <section className="flex h-full md:min-h-80 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm font-inter">
      <div className="mb-5">
        <h2 className="font-inter text-sm 2xl:text-base font-semibold text-primary-blue">
          Distribución por servicio
        </h2>
        <p className="mt-1 font-inter text-xs text-gray-500">
          Acumulado del mes
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-fifth-gray">
          Cargando ventas...
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-red-600">
          No se pudieron cargar las ventas.
        </div>
      ) : datos.length === 0 || totalVendido <= 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-fifth-gray">
          No hay ventas para este período.
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 items-center gap-6 md:grid-cols-2">
          {/* Gráfico */}
          <div className="relative h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosConPorcentaje}
                  dataKey="total"
                  nameKey="tipo"
                  innerRadius="55%"
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
                >
                  <LabelList
                    dataKey="porcentaje"
                    position="inside"
                    content={(props) => (
                      <PorcentajeLabel {...(props as PorcentajeLabelProps)} />
                    )}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Total central */}
            <div className="pointer-events-none font-inter absolute inset-0 flex flex-col items-center justify-center">
              <span className="mt-1 text-center text-lg font-bold text-primary-blue">
                {formatoCOP(totalVendido)}
              </span>
              <span className="text-xs text-gray-500">Total ventas</span>
            </div>
          </div>

          {/* Leyenda */}
          <div className="flex flex-col gap-4">
            {datosConPorcentaje.map((item, index) => {
              const etiqueta = ETIQUETAS[item.tipo] ?? {
                label: item.tipo,
                icon: Package,
              };

              const Icon = etiqueta.icon;
              const color = COLORES[index % COLORES.length];

              return (
                <div key={item.tipo} className="flex items-start gap-3">
                  <div
                    className="p-1 rounded-full"
                    style={{ backgroundColor: color }}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                      className="mt-0.5 shrink-0 text-white"
                    />
                  </div>

                  <div className="min-w-0 flex-1 font-inter">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-fifth-gray">
                        {etiqueta.label}
                      </span>

                      <span className="shrink-0 text-sm font-medium text-fifth-gray">
                        {item.porcentaje.toLocaleString("es-CO", {
                          maximumFractionDigits: 1,
                        })}
                        %
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-fifth-gray">
                      {formatoCOP(item.total)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
