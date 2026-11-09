"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type EstadoCartera = "VENCIDO" | "PENDIENTE" | "SIN_FECHA";

interface ProveedorCartera {
  proveedorId: number;
  proveedor: string;
  fechaVencimiento: string | null;
  monto: number;
  estado: EstadoCartera;
}

interface ProveedoresResponse {
  datos: ProveedorCartera[];
}

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const estados: Record<
  EstadoCartera,
  { label: string; className: string }
> = {
  VENCIDO: {
    label: "Vencido",
    className: "bg-red-50 text-red-600",
  },
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-600",
  },
  SIN_FECHA: {
    label: "Sin fecha",
    className: "bg-gray-100 text-gray-600",
  },
};

export default function DashboardAdministradorProveedores() {
  const [proveedores, setProveedores] = useState<ProveedorCartera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const obtenerProveedores = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/dashboard/administrador/proveedores", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Error al obtener los proveedores");
        }

        const data: ProveedoresResponse = await response.json();

        setProveedores(data.datos);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        console.error("Error cargando cartera de proveedores:", error);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    obtenerProveedores();

    return () => controller.abort();
  }, []);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-inter text-base font-semibold text-gray-800">
          Proveedores con mayor deuda
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Proveedores con pagos pendientes por realizar
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-primary-blue" />
        </div>
      ) : error ? (
        <div className="flex h-48 items-center justify-center text-sm text-red-500">
          No fue posible cargar la información.
        </div>
      ) : proveedores.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-500">
          No hay proveedores con pagos pendientes.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="pb-3 font-medium">Proveedor</th>
                <th className="px-3 pb-3 font-medium">Vencimiento</th>
                <th className="px-3 pb-3 text-right font-medium">Monto</th>
                <th className="pb-3 pl-3 text-right font-medium">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {proveedores.map((proveedor) => {
                const estado = estados[proveedor.estado];

                return (
                  <tr key={proveedor.proveedorId}>
                    <td className="py-3 pr-3">
                      <p
                        className="max-w-35 truncate font-medium text-gray-700"
                        title={proveedor.proveedor}
                      >
                        {proveedor.proveedor}
                      </p>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-gray-500">
                      {proveedor.fechaVencimiento
                        ? format(
                            parseISO(proveedor.fechaVencimiento),
                            "dd MMM yyyy",
                            { locale: es }
                          )
                        : "—"}
                    </td>

                    <td className="px-3 py-3 text-right font-medium whitespace-nowrap text-gray-800">
                      {formatCompactCurrency(proveedor.monto)}
                    </td>

                    <td className="py-3 pl-3 text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${estado.className}`}
                      >
                        {estado.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}