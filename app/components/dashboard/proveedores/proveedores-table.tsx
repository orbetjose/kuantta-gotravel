"use client";

import { useEffect, useState } from "react";
import BtnAdd from "@/app/components/dashboard/btn-add";
import Pagination from "../pagination";
import TableActions from "../table-actions";
import { SearchInput } from "../search";

type Proveedor = {
  id: number;
  razonSocial: string;
  ruc: string;
  correo: string;
  telefono: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function ProveedoresTable() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
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

        const response = await fetch(`/api/proveedores?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo proveedores");
        }

        const data = await response.json();

        setProveedores(data.proveedores);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        setProveedores([]);
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-inter text-sm text-fifth-gray">
            Gestión de proveedores
          </p>

          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            Proveedores
          </h1>
        </div>
        <BtnAdd
          href="/dashboard/proveedores/nuevo"
          services="Nuevo proveedor"
        />
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar proveedor..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
        <table className="w-full table-fixed 3xl:table-auto  min-w-175 border-separate border-spacing-y-3">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 pt-4 font-inter text-sm font-bold text-fifth-gray md:w-75 3xl:w-auto">
                Razón social
              </th>

              <th className="px-4 pt-4 font-inter text-sm font-bold text-fifth-gray">
                Correo
              </th>
              <th className="px-4 pt-4 font-inter text-sm font-bold text-fifth-gray md:w-30 3xl:w-auto">
                Teléfono
              </th>
              <th className="px-4 pt-4 font-inter text-sm font-bold text-fifth-gray md:w-27 3xl:w-auto">
                Fecha de registro
              </th>

              <th className="px-4 pt-4 font-inter text-sm font-bold text-fifth-gray md:w-20 3xl:w-auto">
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
                  Cargando proveedores...
                </td>
              </tr>
            ) : proveedores.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                >
                  {search
                    ? "No se encontraron proveedores."
                    : "No hay proveedores registrados."}
                </td>
              </tr>
            ) : (
              proveedores.map((proveedor) => (
                <tr
                  key={proveedor.id}
                  className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                >
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray rounded-l-lg md:max-w-55 3xl:max-w-full">
                    <span className="block md:truncate 3xl:overflow-visible 3xl:whitespace-normal">{proveedor.razonSocial}</span>
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {proveedor.correo}
                  </td>
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {proveedor.telefono}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {new Date(proveedor.createdAt).toLocaleDateString("es-CO")}
                  </td>

                  <td className="px-4 py-2 rounded-r-lg">
                    <TableActions
                      actions={[
                        {
                          label: "Revisar",
                          href: `/dashboard/proveedores/${proveedor.id}`,
                        },
                        {
                          label: "Editar",
                          href: `/dashboard/proveedores/${proveedor.id}/editar`,
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
          currentItems={proveedores.length}
          onPageChange={handlePageChange}
          itemName="proveedores"
        />
      )}
    </div>
  );
}
