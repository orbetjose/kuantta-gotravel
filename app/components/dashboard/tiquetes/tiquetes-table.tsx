"use client";

import { useEffect, useState } from "react";
import BtnAdd from "@/app/components/dashboard/btn-add";
import { formatCurrency, getEstadoStyles } from "@/libs/helpers";
import Pagination from "../pagination";
import { getActions } from "@/libs/helpers";
import TableActions from "../table-actions";
import { TableFilterValues } from "@/types";
import TableFilters from "../table-filters";
import { handleTableFiltersChange } from "@/libs/helpers";
import { SearchInput } from "../search";

type Tiquetes = {
  id: number;
  cliente: string;
  fechaEmision: string;
  numeroTiquete: string;
  totalPagar: number;
  proveedor: string;
  estado: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function TiquetesTable() {
  const [tiquetes, setTiquetes] = useState<Tiquetes[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TableFilterValues>({
    fechaDesde: "",
    fechaHasta: "",
    tipo: "",
    estado: "",
    creditoAgencia: "",
  });
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        if (search.trim()) {
          params.set("search", search.trim());
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

        const response = await fetch(`/api/tiquetes?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo tiquetes");
        }

        const data = await response.json();

        setTiquetes(data.tiquetes);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando tiquetes:", error);
        setTiquetes([]);
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

  const handleFiltersChange = (values: TableFilterValues) => {
    handleTableFiltersChange(values, setFilters, setPagination);
  };

  return (
    <div className="w-full rounded-lg bg-fourth-gray p-6">
      {/* Header */}
      <div className="mb-4 flex md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <p className="font-inter text-sm text-fifth-gray">
            Gestión de tiquetes
          </p>

          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            Tiquetes
          </h1>
        </div>

        <BtnAdd
          href="/dashboard/servicios/tiquete/nuevo"
          services="Nuevo tiquete"
        />
      </div>

      {/* Search */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative max-w-md flex-1 ">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar tiquete..."
          />
        </div>
        <TableFilters
          filters={["date", "estado"]}
          values={filters}
          onChange={handleFiltersChange}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
        <table className="w-full table-fixed 3xl:table-auto min-w-175 border-separate border-spacing-y-3">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                N° Tiquete
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Cliente
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Valor
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
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
                  Cargando tiquetes...
                </td>
              </tr>
            ) : tiquetes.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                >
                  {search
                    ? "No se encontraron tiquetes."
                    : "No hay tiquetes registrados."}
                </td>
              </tr>
            ) : (
              tiquetes.map((tiquete) => (
                <tr
                  key={tiquete.id}
                  className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                >
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray rounded-l-lg">
                    <span className="block truncate 3xl:overflow-visible 3xl:whitespace-normal">{tiquete.numeroTiquete}</span>
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {tiquete.cliente}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {formatCurrency(tiquete.totalPagar)}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {new Date(tiquete.fechaEmision).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray md:max-w-55 3xl:max-w-full">
                    <span className="block truncate 3xl:overflow-visible 3xl:whitespace-normal">{tiquete.proveedor}</span> 
                  </td>
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getEstadoStyles(
                        tiquete.estado,
                      )}`}
                    >
                      {tiquete.estado.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-2 rounded-r-lg">
                    <div className="flex gap-2">
                      <TableActions
                        actions={getActions(
                          {
                            tipo: "TIQUETE",
                            idTiquete: tiquete.id,
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

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          currentItems={tiquetes.length}
          onPageChange={handlePageChange}
          itemName="tiquetes"
        />
      )}
    </div>
  );
}
