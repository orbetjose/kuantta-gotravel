"use client";

import { useEffect, useState } from "react";
import BtnAdd from "@/app/components/dashboard/btn-add";
import Pagination from "../pagination";
import TableActions from "../table-actions";
import { SearchInput } from "../search";

type Ruta = {
  id: number;
  origen: string;
  destino: string;
  codigoOrigen: string;
  codigoDestino: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function RutasTable() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
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

        const response = await fetch(`/api/rutas?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo rutas");
        }

        const data = await response.json();

        setRutas(data.rutas);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando rutas:", error);
        setRutas([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, pagination.page, pagination.limit]);

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

  return (
    <div className="w-full rounded-lg bg-fourth-gray p-6">
      {/* Header */}
      <div className="mb-4 flex md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <p className="font-inter text-sm text-fifth-gray">Gestión de Rutas</p>

          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            Rutas
          </h1>
        </div>
        <BtnAdd
          href="/dashboard/administracion/rutas/nuevo"
          services="Nueva ruta"
        />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar ruta..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
        <table className="w-full min-w-175 border-separate border-spacing-y-3">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Origen
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Destino
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Código origen
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Código destino
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
                  Cargando rutas...
                </td>
              </tr>
            ) : rutas.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                >
                  {search
                    ? "No se encontraron rutas."
                    : "No hay rutas registrados."}
                </td>
              </tr>
            ) : (
              rutas.map((ruta) => (
                <tr
                  key={ruta.id}
                  className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                >
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray rounded-l-lg">
                    {ruta.origen}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {ruta.destino}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {ruta.codigoOrigen}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {ruta.codigoDestino}
                  </td>

                  <td className="px-4 py-2 rounded-r-lg">
                    <TableActions
                      actions={[
                        {
                          label: "Revisar",
                          href: `/dashboard/administracion/rutas/${ruta.id}`,
                        },
                        {
                          label: "Editar",
                          href: `/dashboard/administracion/rutas/${ruta.id}/editar`,
                        },
                      ]}
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
          currentItems={rutas.length}
          onPageChange={handlePageChange}
          itemName="rutas"
        />
      )}
    </div>
  );
}
