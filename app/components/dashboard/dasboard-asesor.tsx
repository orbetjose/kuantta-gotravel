"use client";

import { useState, useEffect } from "react";
import DashboardCalendar from "@/app/components/dashboard/dashboard-calendar";
import DashboardStats from "@/app/components/dashboard/dashboard-stats";
import DashboardNotas from "../dashboard-notas";
import DashboardVentasSemanales from "@/app/components/dashboard/dashboard-ventas-semanales";
import DashboardVentasPorTipo from "@/app/components/dashboard/dashboard-ventas-por-tipo";

import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DashboardSummary {
  totalVendido: number;
  carteraPendiente: number;
  pagoPendienteProveedores: number;
  ventasDelDia: number;
  clientesConCartera: number;
  proveedoresPendientes: number;

  ventasPorTipo: {
    tipo: string;
    total: number;
  }[];

  ventasPorPeriodo: {
    periodo: string;
    total: number;
  }[];

  periodoAgrupacion: "DIA" | "SEMANA" | "MES";

  serviciosPorCantidad: {
    tipo: string;
    cantidad: number;
  }[];
}

export default function DashboardAsesor() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalVendido: 0,
    carteraPendiente: 0,
    pagoPendienteProveedores: 0,
    ventasDelDia: 0,
    clientesConCartera: 0,
    proveedoresPendientes: 0,
    serviciosPorCantidad: [],
    ventasPorTipo: [],
    ventasPorPeriodo: [],
    periodoAgrupacion: "MES",
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (dateRange?.from) {
          params.set("fechaDesde", format(dateRange.from, "yyyy-MM-dd"));
        }

        if (dateRange?.to) {
          params.set("fechaHasta", format(dateRange.to, "yyyy-MM-dd"));
        }

        const response = await fetch(
          `/api/dashboard/asesor/resumen?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Error obteniendo el dashboard");
        }

        const data = await response.json();

        setSummary(data);
      } catch (error) {
        console.error("Error obteniendo dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dateRange]);

  return (
    <div className="w-full rounded-lg bg-fourth-gray p-4">
      <div className="mb-4">
        <h1 className="font-inter text-4xl font-bold text-fifth-gray">
          Dashboard
        </h1>
        <p className="font-inter text-sm text-fifth-gray">
          Resumen general de ventas y servicios
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <DashboardStats
            totalVendido={summary.totalVendido}
            totalCartera={summary.carteraPendiente}
            pagoPendienteProveedores={summary.pagoPendienteProveedores}
            ventasDelDia={summary.ventasDelDia}
            clientesConCartera={summary.clientesConCartera}
            proveedoresPendientes={summary.proveedoresPendientes}
            loading={loading}
          />
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 mt-4">
            <DashboardVentasPorTipo dateRange={dateRange} />
            <DashboardVentasSemanales />
          </div>
        </div>
        <aside className="w-full shrink-0 lg:w-56 3xl:w-70">
          <div className="lg:sticky lg:top-6">
            <DashboardCalendar range={dateRange} onChange={setDateRange} />
            <DashboardNotas />
          </div>
        </aside>
      </div>
    </div>
  );
}
