"use client";

export interface DashboardFilterValues {
  fechaDesde: string;
  fechaHasta: string;
  tipo: string;
  estado: string;
}

interface DashboardFiltersProps {
  values: DashboardFilterValues;
  onChange: (values: DashboardFilterValues) => void;
}

export default function DashboardFilters({
  values,
  onChange,
}: DashboardFiltersProps) {
  const handleChange = (
    field: keyof DashboardFilterValues,
    value: string,
  ) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block font-inter text-sm font-medium text-fifth-gray">
            Fecha desde
          </label>

          <input
            type="date"
            value={values.fechaDesde}
            onChange={(e) =>
              handleChange("fechaDesde", e.target.value)
            }
            className="w-full rounded-lg bg-inputs px-3 py-2 font-inter text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-inter text-sm font-medium text-fifth-gray">
            Fecha hasta
          </label>

          <input
            type="date"
            value={values.fechaHasta}
            onChange={(e) =>
              handleChange("fechaHasta", e.target.value)
            }
            className="w-full rounded-lg bg-inputs px-3 py-2 font-inter text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block font-inter text-sm font-medium text-fifth-gray">
            Tipo de servicio
          </label>

          <select
            value={values.tipo}
            onChange={(e) =>
              handleChange("tipo", e.target.value)
            }
            className="w-full rounded-lg bg-inputs px-3 py-2 font-inter text-sm outline-none"
          >
            <option value="">Todos</option>
            <option value="TIQUETE">Tiquete</option>
            <option value="HOTEL">Hotel</option>
            <option value="AUTO">Auto</option>
            <option value="TRASLADO">Traslado</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-inter text-sm font-medium text-fifth-gray">
            Estado
          </label>

          <select
            value={values.estado}
            onChange={(e) =>
              handleChange("estado", e.target.value)
            }
            className="w-full rounded-lg bg-inputs px-3 py-2 font-inter text-sm outline-none"
          >
            <option value="">Todos</option>
            <option value="BORRADOR">Borrador</option>
            <option value="DEVUELTO">Devuelto</option>
            <option value="POR_FACTURAR">Por facturar</option>
            <option value="FACTURADO">Facturado</option>
            <option value="ANULADO">Anulado</option>
          </select>
        </div>
      </div>
    </div>
  );
}