"use client";

import { useEffect, useState } from "react";
import BtnAdd from "@/app/components/dashboard/ui/btn-add";
import Pagination from "../ui/pagination";
import TableActions from "../ui/table-actions";
import { SearchInput } from "../ui/search";
import { PaginationType } from "@/types";
import { can, type Role } from "@/libs/permissions";

type Ruta = {
  id: number;
  codigoIATA: string;
  nombreAeropuerto: string;
  ciudad: string;
  pais: string;
  createdAt: string;
};

type Props = {
  role: Role;
};

export default function RutasTable({ role }: Props) {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
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
        {can(role, "rutas", "create") && (
          <BtnAdd href="/dashboard/rutas/nuevo" services="Nueva ruta" />
        )}
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
                Código IATA
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Aeropuerto
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Ciudad
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                País
              </th>

              <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray text-center">
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
                    {ruta.codigoIATA}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {ruta.nombreAeropuerto}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {ruta.ciudad}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {ruta.pais}
                  </td>

                  <td className="px-4 py-2 rounded-r-lg ">
                    <TableActions
                      actions={[
                        {
                          label: "Revisar",
                          href: `/dashboard/rutas/${ruta.id}`,
                          permission: {
                            resource: "rutas",
                            action: "view",
                          },
                        },
                        {
                          label: "Editar",
                          href: `/dashboard/rutas/${ruta.id}/editar`,
                          permission: {
                            resource: "rutas",
                            action: "edit",
                          },
                        },
                      ]}
                      role={role}
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
