"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "../ui/pagination";
import TableActions from "../ui/table-actions";
import { SearchInput } from "../ui/search";
import { PaginationType } from "@/types";
import { can, type Role } from "@/libs/permissions";
import BtnAdd from "@/app/components/dashboard/ui/btn-add";

type Pasajero = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  documento: string;
  telefono: string;
  createdAt: string;
};

type Props = {
  role: Role;
};

export default function PasajerosTable({ role }: Props) {
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
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

        const response = await fetch(`/api/pasajeros?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo pasajeros");
        }

        const data = await response.json();

        setPasajeros(data.pasajeros);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando pasajeros:", error);
        setPasajeros([]);
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
          <p className="font-inter text-sm text-fifth-gray">
            Gestión de pasajeros
          </p>

          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            Pasajeros
          </h1>
        </div>
        {can(role, "pasajeros", "create") && (
          <BtnAdd href="/dashboard/pasajeros/nuevo" services="Nuevo pasajero" />
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar pasajero..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
        <table className="w-full min-w-175 border-separate border-spacing-y-3">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                # Documento
              </th>
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Nombre
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Correo
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Teléfono
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Fecha de registro
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
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
                  Cargando pasajeros...
                </td>
              </tr>
            ) : pasajeros.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                >
                  {search
                    ? "No se encontraron pasajeros."
                    : "No hay pasajeros registrados."}
                </td>
              </tr>
            ) : (
              pasajeros.map((pasajero) => (
                <tr
                  key={pasajero.id}
                  className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                >
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray rounded-l-lg">
                    {pasajero.documento}
                  </td>
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {pasajero.nombre} {pasajero.apellido}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {pasajero.correo}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {pasajero.telefono}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {new Date(pasajero.createdAt).toLocaleDateString("es-CO")}
                  </td>

                  <td className="px-4 py-2 rounded-r-lg">
                    <TableActions
                      actions={[
                        {
                          label: "Revisar",
                          href: `/dashboard/pasajeros/${pasajero.id}`,
                          permission: {
                            resource: "pasajeros",
                            action: "view",
                          },
                        },
                        {
                          label: "Editar",
                          href: `/dashboard/pasajeros/${pasajero.id}/editar`,
                          permission: {
                            resource: "pasajeros",
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
          currentItems={pasajeros.length}
          onPageChange={handlePageChange}
          itemName="pasajeros"
        />
      )}
    </div>
  );
}
