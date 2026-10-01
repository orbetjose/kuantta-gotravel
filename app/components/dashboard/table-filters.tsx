"use client";

import { TableFilter, TableFilterValues } from "@/types";
import { useState } from "react";
import { SearchInput } from "./search";

interface TableFiltersProps {
  filters: TableFilter[];
  values: TableFilterValues;
  search: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onChange: (values: TableFilterValues) => void;
    onReset: () => void;
}

export default function TableFilters({
  filters,
  values,
  onChange,
  search,
  onSearchChange,
  placeholder,
  onReset
}: TableFiltersProps) {
  const [activeFiltros, setActiveFiltros] = useState(false);

  const updateFilter = (field: keyof TableFilterValues, value: string) => {
    onChange({
      ...values,
      [field]: value,
    });
  };
  const handleSearch = (value: string) => {
    onSearchChange(value);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:gap-12 gap-4">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={`Buscar ${placeholder}...`}
          className="md:w-100"
        />
        <div className="flex gap-4">
          <button
            className="rounded-lg bg-primary-blue w-30 py-1.5 font-inter text-sm font-bold text-white hover:opacity-90 transition"
            onClick={() => setActiveFiltros(!activeFiltros)}
          >
            Filtros
          </button>
          <button className="rounded-lg bg-primary-blue w-30 py-1.5 font-inter text-sm font-bold text-white hover:opacity-90 transition " onClick={onReset}>
            Reset filtros
          </button>
        </div>
      </div>
      <div
        className={`${activeFiltros ? "max-h-100" : "max-h-0 overflow-hidden opacity-0"} flex flex-col md:flex-row md:gap-8 gap-4 mt-4 transition-all duration-300 ease-in-out`}
      >
        {filters.includes("date") && (
          <>
            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="fechaDesde"
                className="text-sm font-bold font-inter text-fifth-gray"
              >
                Fecha desde
              </label>

              <input
                id="fechaDesde"
                type="date"
                value={values.fechaDesde}
                onChange={(e) => updateFilter("fechaDesde", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 font-inter text-sm bg-inputs text-fifth-gray"
              />
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label
                htmlFor="fechaHasta"
                className="text-sm font-bold font-inter text-fifth-gray"
              >
                Fecha hasta
              </label>

              <input
                id="fechaHasta"
                type="date"
                value={values.fechaHasta}
                onChange={(e) => updateFilter("fechaHasta", e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 font-inter text-sm bg-inputs text-fifth-gray"
              />
            </div>
          </>
        )}

        {filters.includes("tipo") && (
          <div className="flex flex-col gap-1 w-full">
            <label
              htmlFor="tipo"
              className="text-sm font-bold font-inter text-fifth-gray"
            >
              Tipo
            </label>

            <select
              id="tipo"
              value={values.tipo}
              onChange={(e) => updateFilter("tipo", e.target.value)}
              className="h-10 min-w-40 rounded-lg border border-gray-300 bg-inputs px-3 font-inter text-sm text-fifth-gray"
            >
              <option value="">Todos</option>
              <option value="TIQUETE">Tiquete</option>
              <option value="HOTEL">Hotel</option>
              <option value="ALQUILER_AUTO">Alquiler auto</option>
              <option value="SALON">Salon</option>
              <option value="EVENTO">Evento</option>
              <option value="SILLA">Silla</option>
              <option value="TARJETA_ASISTENCIA">Tarjeta asistencia</option>
              <option value="TRASLADO">Traslado</option>
              <option value="VISA">Visa</option>
              <option value="WEB_CHECKIN">Web checkin</option>
              <option value="PLAN_VACACIONAL">Plan vacacional</option>
            </select>
          </div>
        )}

        {filters.includes("estado") && (
          <div className="flex flex-col gap-1 w-full">
            <label
              htmlFor="estado"
              className="text-sm font-bold font-inter text-fifth-gray"
            >
              Estado
            </label>

            <select
              id="estado"
              value={values.estado}
              onChange={(e) => updateFilter("estado", e.target.value)}
              className="h-10 min-w-40 rounded-lg border border-gray-300 bg-inputs px-3 font-inter text-sm text-fifth-gray"
            >
              <option value="">Todos</option>
              <option value="BORRADOR">Borrador</option>
              <option value="DEVUELTO">Devuelto</option>
              <option value="POR_FACTURAR">Por facturar</option>
              <option value="FACTURADO">Facturado</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>
        )}

        {filters.includes("credito") && (
          <div className="flex flex-col gap-1 w-full">
            <label
              htmlFor="credito"
              className="text-sm font-bold font-inter text-fifth-gray"
            >
              Días de crédito
            </label>

            <select
              id="credito"
              value={values.creditoAgencia}
              onChange={(e) => updateFilter("creditoAgencia", e.target.value)}
              className="h-10 min-w-40 rounded-lg border border-gray-300 bg-inputs px-3 font-inter text-sm text-fifth-gray"
            >
              <option value="">Todos</option>
              <option value="3">3</option>
              <option value="8">8</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
