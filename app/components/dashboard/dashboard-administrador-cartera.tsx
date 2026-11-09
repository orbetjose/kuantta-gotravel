
"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ClienteCartera {
  clienteId: number;
  cliente: string;
  fechaVencimiento: string;
  monto: number;
  estado: "VENCIDO" | "PENDIENTE";
}

interface CarteraResponse {
  datos: ClienteCartera[];
}

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function DashboardCarteraAdministrador() {
  const [datos, setDatos] = useState<ClienteCartera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function obtenerCartera() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          "/api/dashboard/administrador/cartera",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Error obteniendo cartera");
        }

        const data: CarteraResponse = await response.json();

        setDatos(data.datos);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Error obteniendo cartera:", err);
        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    obtenerCartera();

    return () => controller.abort();
  }, []);

  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-inter text-sm 2xl:text-2xl font-semibold text-primary-blue 2xl:text-base">
          Cartera de clientes
        </h2>

        <p className="mt-1 font-inter text-xs text-gray-500">
          Clientes con mayor saldo por cobrar
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-64 flex-1 items-center justify-center">
          <p className="font-inter text-sm text-gray-500">
            Cargando cartera...
          </p>
        </div>
      ) : error ? (
        <div className="flex min-h-64 flex-1 items-center justify-center">
          <p className="font-inter text-sm text-red-500">
            No se pudo cargar la cartera.
          </p>
        </div>
      ) : datos.length === 0 ? (
        <div className="flex min-h-64 flex-1 items-center justify-center">
          <p className="font-inter text-sm text-gray-500">
            No hay clientes con cartera pendiente.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="whitespace-nowrap px-3 py-3 font-inter text-xs font-semibold text-gray-500">
                  Cliente
                </th>

                <th className="whitespace-nowrap px-3 py-3 font-inter text-xs font-semibold text-gray-500">
                  Vencimiento
                </th>

                <th className="whitespace-nowrap px-3 py-3 text-right font-inter text-xs font-semibold text-gray-500">
                  Monto
                </th>

                <th className="whitespace-nowrap px-3 py-3 text-center font-inter text-xs font-semibold text-gray-500">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {datos.map((cliente) => (
                <tr
                  key={cliente.clienteId}
                  className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="max-w-35 truncate px-3 py-4 font-inter text-xs font-medium text-primary-blue">
                    {cliente.cliente}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 font-inter text-xs text-gray-600">
                    {format(
                      parseISO(cliente.fechaVencimiento),
                      "dd MMM yyyy",
                      { locale: es },
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-right font-inter text-xs font-semibold text-primary-blue">
                    {formatCompactCurrency(cliente.monto)}
                  </td>

                  <td className="px-3 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 font-inter text-[10px] font-semibold ${
                        cliente.estado === "VENCIDO"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {cliente.estado === "VENCIDO"
                        ? "Vencido"
                        : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
