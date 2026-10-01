"use client";

import { useEffect, useState } from "react";
import {
  formatCurrency,
  getEstadoStyles,
  getTiposStyles,
} from "@/libs/helpers";
import { facturarServicio } from "@/actions/servicios";
import Pagination from "../pagination";
import TableActions, { type TableAction } from "../table-actions";
import { getActions } from "@/libs/helpers";
import { Servicios } from "@/types";
import TableFilters from "../table-filters";
import { TableFilterValues } from "@/types";
import { handleTableFiltersChange } from "@/libs/helpers";
import { SearchInput } from "../search";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function FacturacionTable() {
  const [servicios, setServicios] = useState<Servicios[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFacturando, setIsFacturando] = useState(false);
  const [filters, setFilters] = useState<TableFilterValues>({
    fechaDesde: "",
    fechaHasta: "",
    tipo: "",
    estado: "",
    creditoAgencia: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<
    number | null
  >(null);

  const fetchServicios = async (
    page?: number,
    limit?: number,
    search?: string,
  ) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search?.trim()) {
        params.set("search", search.trim());
      }

      if (filters.tipo) {
        params.set("tipo", filters.tipo);
      }

      if (filters.fechaDesde) {
        params.set("fechaDesde", filters.fechaDesde);
      }

      if (filters.fechaHasta) {
        params.set("fechaHasta", filters.fechaHasta);
      }

      const response = await fetch(`/api/facturacion?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Error al obtener los servicios");
      }

      const data = await response.json();

      setServicios(data.servicios);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setServicios([]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setIsLoading(true);

      try {
        await fetchServicios(pagination.page, pagination.limit, search);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, pagination.page, pagination.limit, filters]);

  function handleSearch(value: string) {
    setSearch(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  }

  const handleFacturar = (servicio: Servicios) => {
    setServicioSeleccionado(servicio.id);
    setIsModalOpen(true);
  };

  const handleConfirmarFacturacion = async () => {
    if (!servicioSeleccionado) return;

    setIsFacturando(true);

    try {
      await facturarServicio(servicioSeleccionado);

      setIsModalOpen(false);
      setServicioSeleccionado(null);

      await fetchServicios();
    } catch (error) {
      console.error("Error al facturar:", error);
    } finally {
      setIsFacturando(false);
    }
  };

  const handleFiltersChange = (values: TableFilterValues) => {
    handleTableFiltersChange(values, setFilters, setPagination);
  };

  return (
    <>
      <div className="w-full rounded-lg bg-fourth-gray p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-inter text-sm text-fifth-gray">
              Gestión de servicios por facturar
            </p>

            <h1 className="font-inter text-4xl font-bold text-fifth-gray">
              Facturacion
            </h1>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative max-w-md flex-1 ">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Buscar servicio..."
            />
          </div>
          <TableFilters
            filters={["date", "tipo"]}
            values={filters}
            onChange={handleFiltersChange}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
          <table className="w-full min-w-175 border-separate border-spacing-y-3">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                  Tipo de servicio
                </th>

                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                  Nombre cliente
                </th>

                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                  Fecha de emisión
                </th>

                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                  Total del servicio
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                  Estado
                </th>

                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                  >
                    Cargando servicios...
                  </td>
                </tr>
              ) : servicios.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                  >
                    {search
                      ? "No se encontraron servicios por facturar."
                      : "No hay servicios por facturar registrados."}
                  </td>
                </tr>
              ) : (
                servicios.map((servicio) => (
                  <tr
                    key={servicio.id}
                    className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                  >
                    <td className="px-4 py-2 font-inter text-sm text-fifth-gray rounded-l-lg">
                      <span
                        className={` inline-flex rounded-full px-3 py-1 font-inter text-xs font-bold ${getTiposStyles(
                          servicio.tipo,
                        )}`}
                      >
                        {servicio.tipo.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                      {servicio.cliente.nombre}
                    </td>

                    <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                      {new Date(servicio.fechaEmision).toLocaleDateString(
                        "es-CO",
                      )}
                    </td>
                    <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                      {formatCurrency(servicio.total)}
                    </td>
                    <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getEstadoStyles(
                          servicio.estado,
                        )}`}
                      >
                        {servicio.estado.replace("_", " ")}
                      </span>
                    </td>

                    <td className="px-4 py-2 rounded-r-lg flex gap-4">
                      <TableActions
                        actions={getActions(
                          {
                            tipo: servicio.tipo,
                            id: servicio.id,
                            idTiquete: servicio.idTiquete,
                          },
                          {
                            action: {
                              label: "Facturar",
                              onClick: () => handleFacturar(servicio),
                            },
                          },
                        )}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            currentItems={servicios.length}
            onPageChange={handlePageChange}
            itemName="servicios"
          />
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 font-inter shadow-xl">
            <h2 className="text-xl font-bold text-primary-blue">
              Confirmar facturación
            </h2>

            <p className="mt-3 text-sm text-fifth-gray">
              ¿Estás seguro de que deseas facturar este servicio?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setServicioSeleccionado(null);
                }}
                className="rounded-lg border border-gray-300 px-5 py-2 font-bold text-fifth-gray transition hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarFacturacion}
                disabled={isFacturando}
                className="rounded-lg bg-primary-blue px-5 py-2 font-bold text-white transition hover:opacity-70"
              >
                {isFacturando ? "Facturando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
