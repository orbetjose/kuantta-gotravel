"use client";

import { useState, useEffect } from "react";
import DashboardCalendar from "@/app/components/dashboard/dashboard-calendar";
import DashboardStats from "@/app/components/dashboard/dashboard-stats";
import DashboardSalesByType from "@/app/components/dashboard/dahsboard-sales-by-type";
import DashboardSalesByPeriod from "@/app/components/dashboard/dashboard-sales-by-period";
import DashboardServicesByQuantity from "../components/dashboard/dashboard-services-by-quantity";
import { DashboardFilterValues } from "@/types";

import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DashboardSummary {
  totalVendido: number;
  totalCartera: number;
  pendientePorFacturar: number;

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

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalVendido: 0,
    totalCartera: 0,
    pendientePorFacturar: 0,
    serviciosPorCantidad: [],
    ventasPorTipo: [],
    ventasPorPeriodo: [],
    periodoAgrupacion: "MES",
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [filters, setFilters] = useState<DashboardFilterValues>({
    fechaDesde: "",
    fechaHasta: "",
    tipo: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);

  const handleFiltersChange = (values: DashboardFilterValues) => {
    setFilters(values);
  };

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
          `/api/dashboard/resumen?${params.toString()}`,
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
    <>
      <div className="w-full rounded-lg bg-fourth-gray md:p-6 p-2">
        <div className="mb-4">
          <p className="font-inter text-sm text-fifth-gray">
            Resumen general de ventas y servicios
          </p>
          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="min-w-0 flex-1">
            <DashboardStats
              totalVendido={summary.totalVendido}
              totalCartera={summary.totalCartera}
              pendientePorFacturar={summary.pendientePorFacturar}
              loading={loading}
            />
            <div className="mt-4 flex flex-col-reverse gap-4 2xl:flex-row">
              <div className="flex-1">
                <DashboardServicesByQuantity
                  data={summary.serviciosPorCantidad}
                />
              </div>
              <div className="flex-1">
                <DashboardSalesByType data={summary.ventasPorTipo} />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 ">
              <DashboardSalesByPeriod
                data={summary.ventasPorPeriodo}
                periodoAgrupacion={summary.periodoAgrupacion}
              />
            </div>
          </div>

          <aside className="w-full shrink-0 lg:w-65 3xl:w-80">
            <div className="lg:sticky lg:top-6">
              <DashboardCalendar range={dateRange} onChange={setDateRange} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
