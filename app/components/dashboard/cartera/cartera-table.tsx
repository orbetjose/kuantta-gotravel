"use client";

import { useEffect, useState } from "react";
import {
  formatCurrency,
  getEstadoStyles,
  getTiposStyles,
} from "@/libs/helpers";
import { getActions } from "@/libs/helpers";
import { Servicios } from "@/types";
import { TableFilterValues } from "@/types";
import Pagination from "@/app/components/dashboard/pagination";
import PaymentModal from "@/app/components/dashboard/cartera/paymentModal";
import TableActions from "@/app/components/dashboard/table-actions";
import TableFilters from "@/app/components/dashboard/table-filters";
import { SearchInput } from "@/app/components/dashboard/search";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function CarteraTable() {
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

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalCartera, setTotalCartera] = useState(0);
  const [filters, setFilters] = useState<TableFilterValues>(initialFilters);
  const [selectedServicio, setSelectedServicio] = useState<Servicios | null>(
    null,
  );

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleAddPayment = (servicio: Servicios) => {
    setSelectedServicio(servicio);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedServicio(null);
  };

  const fetchCartera = async (
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

      if (filters.fechaDesde) {
        params.set("fechaDesde", filters.fechaDesde);
      }

      if (filters.fechaHasta) {
        params.set("fechaHasta", filters.fechaHasta);
      }

      if (filters.creditoAgencia) {
        params.set("creditoAgencia", filters.creditoAgencia);
      }

      const response = await fetch(`/api/cartera?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Error al obtener los servicios");
      }

      const data = await response.json();

      setServicios(data.servicios);
      setTotalCartera(data.totalCartera);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error cargando servicios:", error);
      setServicios([]);
      setTotalCartera(0);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setIsLoading(true);

      try {
        await fetchCartera(pagination.page, pagination.limit, search);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, pagination.page, pagination.limit, filters]);

  function handlePageChange(page: number) {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  }

  const handleFiltersChange = (values: TableFilterValues) => {
    setFilters(values);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch("");
  };

  return (
    <>
      <div className="w-full rounded-lg bg-fourth-gray p-6">
        {/* Header */}
        <div className="mb-4 flex md:items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <p className=" text-sm text-fifth-gray">Gestión de</p>

            <h1 className="font-inter text-4xl font-bold text-fifth-gray">
              Cartera
            </h1>
          </div>
          <div className="border-2 p-6 rounded-lg bg-white">
            <p className="font-poppins font-bold text-primary-blue text-lg">
              Total cartera: {formatCurrency(totalCartera)}
            </p>
          </div>
        </div>

        {/* Search */}

        <TableFilters
          filters={["date", "credito"]}
          search={search}
          onSearchChange={setSearch}
          values={filters}
          onChange={handleFiltersChange}
          placeholder="cliente"
          onReset={resetFilters}
        />

        {/* Table */}
        <div className="overflow-x-auto w-full rounded-lg p-4 bg-white shadow-sm">
          <table className="w-full md:table-fixed  md:w-250 3xl:table-auto 3xl:w-full border-separate border-spacing-y-3 ">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-28 3xl:w-auto">
                  Tipo de servicio
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-28 3xl:w-auto">
                  Nombre cliente
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-18 3xl:w-auto">
                  Crédito
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-20 3xl:w-auto">
                  Fecha de emisión
                </th>

                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-20 3xl:w-auto">
                  Fecha de vencimiento
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-22 3xl:w-auto">
                  Total del servicio
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-28 3xl:w-auto">
                  Estado
                </th>
                <th className="px-4 pt-4 pb-2 font-inter text-sm font-bold text-fifth-gray md:w-16 3xl:w-auto">
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
                servicios.map((servicio) => {
                  return (
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
                        {servicio.cliente.nombre}
                      </td>
                      <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                        {servicio.creditoAgencia} días
                      </td>
                      <td className="px-4 py-2 font-inter text-sm text-fifth-gray ">
                        {new Date(servicio.fechaEmision).toLocaleDateString(
                          "es-CO",
                        )}
                      </td>

                      <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                        {new Date(servicio.fechaVencimiento).toLocaleDateString(
                          "es-CO",
                        )}
                      </td>
                      <td className="px-4 py-2 font-inter text-sm text-fifth-gray">
                        {formatCurrency(servicio.total)}
                      </td>
                      <td className="px-4 py-2 font-inter text-sm text-fifth-gray whitespace-pre ">
                        <span
                          className={` inline-flex rounded-full px-3 py-1 font-inter text-xs font-bold ${getEstadoStyles(
                            servicio.estadoCredito,
                          )}`}
                        >
                          {servicio.estadoCredito === "VENCIDO"
                            ? `Vencido hace ${servicio.dias} días`
                            : `Vence en ${servicio.dias} días`}
                        </span>
                      </td>

                      <td className="px-4 py-2 rounded-r-lg flex justify-center items-center gap-4">
                        <TableActions
                          actions={getActions(
                            {
                              tipo: servicio.tipo,
                              id: servicio.id,
                              idTiquete: servicio.idTiquete,
                            },
                            {
                              action: {
                                label: "Adjuntar pago",
                                onClick: () => handleAddPayment(servicio),
                              },
                            },
                          )}
                        />
                      </td>
                    </tr>
                  );
                })
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
        <PaymentModal
          isOpen={isPaymentModalOpen}
          servicio={selectedServicio}
          onClose={handleClosePaymentModal}
          onSuccess={fetchCartera}
        />
      </div>
    </>
  );
}
