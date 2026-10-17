"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "../ui/pagination";
import TableActions from "../ui/table-actions";
import { SearchInput } from "../ui/search";
import { getEstadoStyles } from "@/libs/helpers";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function UsuariosTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
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

        const response = await fetch(`/api/usuarios?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo usuarios");
        }

        const data = await response.json();

        setUsuarios(data.usuarios);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        setUsuarios([]);
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
            Gestión de usuarios
          </p>

          <h1 className="font-inter text-4xl font-bold text-fifth-gray">
            Usuarios
          </h1>
        </div>

        <Link
          href="/dashboard/administracion/usuarios/nuevo"
          className="rounded-lg bg-primary-blue px-6 py-3 font-inter text-sm font-bold text-white hover:opacity-90 transition w-fit"
        >
          + Nuevo usuario
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar usuario..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-sm">
        <table className="w-full min-w-175 border-separate border-spacing-y-3">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Nombre
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Correo
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Role
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray">
                Fecha de registro
              </th>

              <th className="px-4 pb-2 font-inter text-sm font-bold text-fifth-gray text-center">
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
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center font-inter text-sm text-fifth-gray"
                >
                  {search
                    ? "No se encontraron usuarios."
                    : "No hay usuarios registrados."}
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="bg-fifth-gray/11 border-b border-gray-100 last:border-0 rounded-lg"
                >
                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray rounded-l-lg">
                    {usuario.name}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    {usuario.email}
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getEstadoStyles(
                        usuario.role,
                      )}`}
                    >
                      {usuario.role}
                    </span>
                  </td>

                  <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                    {new Date(usuario.createdAt).toLocaleDateString("es-CO")}
                  </td>

                  <td className="px-4 py-2 rounded-r-lg">
                    <TableActions
                      actions={[
                        {
                          label: "Revisar",
                          href: `/dashboard/administracion/usuarios/${usuario.id}`,
                        },
                        {
                          label: "Editar",
                          href: `/dashboard/administracion/usuarios/${usuario.id}/editar`,
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
          currentItems={usuarios.length}
          onPageChange={handlePageChange}
          itemName="Usuarios"
        />
      )}
    </div>
  );
}
