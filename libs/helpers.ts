import type { TableAction } from "@/app/components/dashboard/table-actions";
import { Dispatch, SetStateAction } from "react";
import { TableFilterValues } from "@/types";

export const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const getVisiblePages = (
  currentPage: number,
  totalPages: number,
): (number | "...")[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, 3, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const getEstadoStyles = (estado: string) => {
  switch (estado) {
    case "BORRADOR":
      return "bg-[#6c757d] text-white";

    case "POR_REVISAR":
      return "bg-yellow-100 text-yellow-700";

    case "DEVUELTO":
      return "bg-orange-100 text-orange-700";

    case "POR_FACTURAR":
      return "bg-yellow-100 text-yellow-700";

    case "FACTURADO":
      return "bg-green-100 text-green-700";

    case "ANULADO":
      return "bg-red-100 text-red-700";

    case "VENCIDO":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const getTiposStyles = (tipo: string) => {
  switch (tipo) {
    case "HOTEL":
      return "bg-primary-green text-white";

    case "TIQUETE":
      return "bg-primary-blue text-white";

    case "ALQUILER_AUTO":
      return "bg-blue-400 text-white";

    case "SALON":
      return "bg-rose-400 text-white";

    case "EVENTO":
      return "bg-purple-300 text-white";

    case "SILLA":
      return "bg-orange-400 text-white";

    case "TARJETA_ASISTENCIA":
      return "bg-cyan-400 text-white";

    case "TRASLADO":
      return "bg-teal-400 text-white";

    case "VISA":
      return "bg-violet-400 text-white";

    case "WEB_CHECKIN":
      return "bg-stone-400 text-white";

    case "PLAN_VACACIONAL":
      return "bg-yellow-500 text-white";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

interface ActionData {
  tipo: string;
  id?: number;
  idTiquete?: number | null;
}

interface GetActionsOptions {
  edit?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const getServicioPath = (tipo: string) => {
  return tipo.replaceAll("_", "-").toLowerCase();
};

export const getActions = (
  data: ActionData,
  options: GetActionsOptions = {},
): TableAction[] => {
  const tipo = getServicioPath(data.tipo);

  const id = data.tipo === "TIQUETE" ? data.idTiquete : data.id;

  const actions: TableAction[] = [
    {
      label: "Revisar",
      href: `/dashboard/servicios/${tipo}/${id}`,
    },
  ];

  if (options.edit) {
    actions.push({
      label: "Editar",
      href: `/dashboard/servicios/${tipo}/${id}/editar`,
    });
  }

  if (options.action) {
    actions.push({
      label: options.action.label,
      onClick: options.action.onClick,
    });
  }

  return actions;
};

export function getDateRange(fechaDesde: string, fechaHasta: string) {
  return {
    ...(fechaDesde && {
      gte: new Date(`${fechaDesde}T00:00:00`),
    }),

    ...(fechaHasta && {
      lt: new Date(
        new Date(`${fechaHasta}T00:00:00`).getTime() + 24 * 60 * 60 * 1000,
      ),
    }),
  };
}

export function findEnumValue<T extends string>(
  values: readonly T[],
  value: string,
): T | undefined {
  return values.find((item) => item.toLowerCase() === value.toLowerCase());
}

export function handleTableFiltersChange(
  values: TableFilterValues,
  setFilters: Dispatch<SetStateAction<TableFilterValues>>,
  setPagination: Dispatch<
    SetStateAction<{
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>
  >,
) {
  setFilters(values);

  setPagination((prev) => ({
    ...prev,
    page: 1,
  }));
}

export function formatServiceType(tipo: string) {
  return tipo
    .toLowerCase()
    .split("_")
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(" ");
}

export const serviceTypeConfig: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  TIQUETE: {
    label: "Tiquete",
    color: "#1d2c4e",
  },

  HOTEL: {
    label: "Hotel",
    color: "#47b77d",
  },

  PLAN_VACACIONAL: {
    label: "Plan vacacional",
    color: "#fcc800",
  },

  TRASLADO: {
    label: "Traslado",
    color: "#ec4899",
  },

  ALQUILER_AUTO: {
    label: "Alquiler auto",
    color: "#51a2ff",
  },

  SALON: {
    label: "Salon",
    color: "#ff637e",
  },

  EVENTO: {
    label: "Evento",
    color: "#c27aff",
  },

  SILLA: {
    label: "Silla",
    color: "#ff8904",
  },

  TARJETA_ASISTENCIA: {
    label: "Tarjeta asistencia",
    color: "#00d3f2",
  },

  VISA: {
    label: "VISA",
    color: "#a684ff",
  },

  WEB_CHECKIN: {
    label: "Web Checkin",
    color: "#a6a09b",
  },
};

const fallbackColors = [
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
];

export function getServiceTypeConfig(tipo: string, index: number) {
  return (
    serviceTypeConfig[tipo] ?? {
      label: formatServiceType(tipo),
      color: fallbackColors[index % fallbackColors.length],
    }
  );
}
