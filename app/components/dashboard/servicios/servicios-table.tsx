"use client";

import { useEffect, useState } from "react";
import BtnAdd from "@/app/components/dashboard/btn-add";
import {
  formatCurrency,
  getEstadoStyles,
  getTiposStyles,
} from "@/libs/helpers";
import { TipoServicio } from "@/libs/generated/prisma/client";
import Pagination from "../pagination";
import TableActions from "../table-actions";
import { getActions } from "@/libs/helpers";
import { Servicios } from "@/types";
import { TableFilterValues, TableFilter } from "@/types";
import TableFilters from "../table-filters";
import { handleTableFiltersChange } from "@/libs/helpers";
import { SearchInput } from "../search";

type ServiciosTableProps = {
  tipo?: TipoServicio;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ServiciosTable({ tipo }: ServiciosTableProps) {
  const initialFilters: TableFilterValues = {
    fechaDesde: "",
    fechaHasta: "",
    tipo: "",
    estado: "",
    creditoAgencia: "",
  };
  const [servicios, setServicios] = useState<Servicios[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<TableFilterValues>(initialFilters);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const availableFilters: TableFilter[] = tipo
    ? ["date", "estado"]
    : ["date", "tipo", "estado"];

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        if (tipo) {
          params.set("tipo", tipo);
        } else if (filters.tipo) {
          params.set("tipo", filters.tipo);
        }

        if (filters.estado) {
          params.set("estado", filters.estado);
        }

        if (filters.fechaDesde) {
          params.set("fechaDesde", filters.fechaDesde);
        }

        if (filters.fechaHasta) {
          params.set("fechaHasta", filters.fechaHasta);
        }

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(`/api/servicios?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo servicios");
        }

        const data = await response.json();

        setServicios(data.servicios);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando servicios:", error);
        setServicios([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

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

  const handleFiltersChange = (values: TableFilterValues) => {
    handleTableFiltersChange(values, setFilters, setPagination);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch("");
  };

  return (
    <div className="w-full rounded-lg bg-fourth-gray p-6">
      {/* Header */}
      <div className="mb-4 flex md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <p className="font-inter text-sm text-fifth-gray">
            Gestión de servicios
          </p>

          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            {tipo ? tipo.replace("_", " ") : "Servicios"}
          </h1>
        </div>

        <BtnAdd href="/dashboard/servicios/nuevo" services="Nuevo servicio" />
      </div>

      {/* Search */}
      <TableFilters
        filters={availableFilters}
        values={filters}
        search={search}
        onSearchChange={setSearch}
        placeholder="servicio"
        onChange={handleFiltersChange}
        onReset={resetFilters}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
        <table className="w-full table-fixed 3xl:table-auto min-w-175 border-separate border-spacing-y-3">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Tipo de servicio
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Cliente
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-26 3xl:w-auto">
                Valor
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-26 3xl:w-auto">
                Fecha emisión
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Proveedor
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-24 3xl:w-auto">
                Estado
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-20 3xl:w-auto">
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
                    ? "No se encontraron servicios."
                    : "No hay servicios registrados."}
                </td>
              </tr>
            ) : (
              servicios.map((servicio) => (
                <tr
                  key={servicio.id}
                  className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                >
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    <span
                      className={` inline-flex rounded-full px-3 py-1 font-inter text-xs font-bold ${getTiposStyles(
                        servicio.tipo,
                      )}`}
                    >
                      {servicio.tipo.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {servicio.cliente.nombre} {servicio.cliente.apellido}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {formatCurrency(servicio.total)}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {new Date(servicio.fechaEmision).toLocaleDateString(
                      "es-CO",
                    )}
                  </td>
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray md:max-w-55 3xl:max-w-full">
                    <span className="block truncate 3xl:overflow-visible 3xl:whitespace-normal">
                      {servicio.proveedor}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getEstadoStyles(
                        servicio.estado,
                      )}`}
                    >
                      {servicio.estado.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-2 rounded-r-lg">
                    <div className="flex justify-center gap-2">
                      <TableActions
                        actions={getActions(
                          {
                            tipo: servicio.tipo,
                            id: servicio.id,
                            idTiquete: servicio.idTiquete,
                          },
                          {
                            edit: true,
                          },
                        )}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
  );
}
