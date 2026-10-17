import type { TableAction } from "@/app/components/dashboard/ui/table-actions";
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

    case "ASESOR":
      return "bg-amber-400 text-white";

    case "FACTURADOR":
      return "bg-green-400 text-white";

    case "ADMINISTRADOR":
      return "bg-indigo-400 text-white";

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

export const formatDate = (date: Date | string | null) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};


const titleRules = [
  // Administración > Usuarios
  {
    pattern: /^\/dashboard\/administracion\/usuarios\/nuevo$/,
    title: "Crear usuario",
  },
  {
    pattern: /^\/dashboard\/administracion\/usuarios\/[^/]+\/editar$/,
    title: "Editar usuario",
  },
  {
    pattern: /^\/dashboard\/administracion\/usuarios\/[^/]+$/,
    title: "Detalle del usuario",
  },
  {
    pattern: /^\/dashboard\/administracion\/usuarios$/,
    title: "Usuarios",
  },

  // Servicios > Hotel
  {
    pattern: /^\/dashboard\/servicios\/hotel\/nuevo$/,
    title: "Crear hotel",
  },
  {
    pattern: /^\/dashboard\/servicios\/hotel\/[^/]+\/editar$/,
    title: "Editar hotel",
  },
  {
    pattern: /^\/dashboard\/servicios\/hotel\/[^/]+$/,
    title: "Detalle del hotel",
  },
  {
    pattern: /^\/dashboard\/servicios\/hotel$/,
    title: "Hoteles",
  },

  // Servicios > Alquiler de auto
  {
    pattern: /^\/dashboard\/servicios\/alquiler-auto\/nuevo$/,
    title: "Crear alquiler de auto",
  },
  {
    pattern: /^\/dashboard\/servicios\/alquiler-auto\/[^/]+\/editar$/,
    title: "Editar alquiler de auto",
  },
  {
    pattern: /^\/dashboard\/servicios\/alquiler-auto\/[^/]+$/,
    title: "Detalle del alquiler de auto",
  },
  {
    pattern: /^\/dashboard\/servicios\/alquiler-auto$/,
    title: "Alquiler de autos",
  },

  // Servicios > Salón
  {
    pattern: /^\/dashboard\/servicios\/salon\/nuevo$/,
    title: "Crear salón",
  },
  {
    pattern: /^\/dashboard\/servicios\/salon\/[^/]+\/editar$/,
    title: "Editar salón",
  },
  {
    pattern: /^\/dashboard\/servicios\/salon\/[^/]+$/,
    title: "Detalle del salón",
  },
  {
    pattern: /^\/dashboard\/servicios\/salon$/,
    title: "Salones",
  },

  // Servicios > Evento
  {
    pattern: /^\/dashboard\/servicios\/evento\/nuevo$/,
    title: "Crear evento",
  },
  {
    pattern: /^\/dashboard\/servicios\/evento\/[^/]+\/editar$/,
    title: "Editar evento",
  },
  {
    pattern: /^\/dashboard\/servicios\/evento\/[^/]+$/,
    title: "Detalle del evento",
  },
  {
    pattern: /^\/dashboard\/servicios\/evento$/,
    title: "Eventos",
  },

  // Servicios > Silla
  {
    pattern: /^\/dashboard\/servicios\/silla\/nuevo$/,
    title: "Crear silla",
  },
  {
    pattern: /^\/dashboard\/servicios\/silla\/[^/]+\/editar$/,
    title: "Editar silla",
  },
  {
    pattern: /^\/dashboard\/servicios\/silla\/[^/]+$/,
    title: "Detalle de la silla",
  },
  {
    pattern: /^\/dashboard\/servicios\/silla$/,
    title: "Sillas",
  },

  // Servicios > Tarjeta de asistencia
  {
    pattern: /^\/dashboard\/servicios\/tarjeta-asistencia\/nuevo$/,
    title: "Crear tarjeta de asistencia",
  },
  {
    pattern: /^\/dashboard\/servicios\/tarjeta-asistencia\/[^/]+\/editar$/,
    title: "Editar tarjeta de asistencia",
  },
  {
    pattern: /^\/dashboard\/servicios\/tarjeta-asistencia\/[^/]+$/,
    title: "Detalle de la tarjeta de asistencia",
  },
  {
    pattern: /^\/dashboard\/servicios\/tarjeta-asistencia$/,
    title: "Tarjetas de asistencia",
  },

  // Servicios > Traslado
  {
    pattern: /^\/dashboard\/servicios\/traslado\/nuevo$/,
    title: "Crear traslado",
  },
  {
    pattern: /^\/dashboard\/servicios\/traslado\/[^/]+\/editar$/,
    title: "Editar traslado",
  },
  {
    pattern: /^\/dashboard\/servicios\/traslado\/[^/]+$/,
    title: "Detalle del traslado",
  },
  {
    pattern: /^\/dashboard\/servicios\/traslado$/,
    title: "Traslados",
  },

  // Servicios > Visa
  {
    pattern: /^\/dashboard\/servicios\/visa\/nuevo$/,
    title: "Crear visa",
  },
  {
    pattern: /^\/dashboard\/servicios\/visa\/[^/]+\/editar$/,
    title: "Editar visa",
  },
  {
    pattern: /^\/dashboard\/servicios\/visa\/[^/]+$/,
    title: "Detalle de la visa",
  },
  {
    pattern: /^\/dashboard\/servicios\/visa$/,
    title: "Visas",
  },

  // Servicios > Web check-in
  {
    pattern: /^\/dashboard\/servicios\/web-checkin\/nuevo$/,
    title: "Crear web check-in",
  },
  {
    pattern: /^\/dashboard\/servicios\/web-checkin\/[^/]+\/editar$/,
    title: "Editar web check-in",
  },
  {
    pattern: /^\/dashboard\/servicios\/web-checkin\/[^/]+$/,
    title: "Detalle del web check-in",
  },
  {
    pattern: /^\/dashboard\/servicios\/web-checkin$/,
    title: "Web check-in",
  },

  // Servicios > Plan vacacional
  {
    pattern: /^\/dashboard\/servicios\/plan-vacacional\/nuevo$/,
    title: "Crear plan vacacional",
  },
  {
    pattern: /^\/dashboard\/servicios\/plan-vacacional\/[^/]+\/editar$/,
    title: "Editar plan vacacional",
  },
  {
    pattern: /^\/dashboard\/servicios\/plan-vacacional\/[^/]+$/,
    title: "Detalle del plan vacacional",
  },
  {
    pattern: /^\/dashboard\/servicios\/plan-vacacional$/,
    title: "Planes vacacionales",
  },

  // Clientes
  {
    pattern: /^\/dashboard\/clientes\/nuevo$/,
    title: "Crear cliente",
  },
  {
    pattern: /^\/dashboard\/clientes\/[^/]+\/editar$/,
    title: "Editar cliente",
  },
  {
    pattern: /^\/dashboard\/clientes\/[^/]+$/,
    title: "Detalle del cliente",
  },
  {
    pattern: /^\/dashboard\/clientes$/,
    title: "Clientes",
  },

  // Proveedores
  {
    pattern: /^\/dashboard\/proveedores\/nuevo$/,
    title: "Crear proveedor",
  },
  {
    pattern: /^\/dashboard\/proveedores\/[^/]+\/editar$/,
    title: "Editar proveedor",
  },
  {
    pattern: /^\/dashboard\/proveedores\/[^/]+$/,
    title: "Detalle del proveedor",
  },
  {
    pattern: /^\/dashboard\/proveedores$/,
    title: "Proveedores",
  },

  // Pasajeros
  {
    pattern: /^\/dashboard\/pasajeros\/nuevo$/,
    title: "Crear pasajero",
  },
  {
    pattern: /^\/dashboard\/pasajeros\/[^/]+\/editar$/,
    title: "Editar pasajero",
  },
  {
    pattern: /^\/dashboard\/pasajeros\/[^/]+$/,
    title: "Detalle del pasajero",
  },
  {
    pattern: /^\/dashboard\/pasajeros$/,
    title: "Pasajeros",
  },

  // Rutas
  {
    pattern: /^\/dashboard\/rutas\/nuevo$/,
    title: "Crear ruta",
  },
  {
    pattern: /^\/dashboard\/rutas\/[^/]+\/editar$/,
    title: "Editar ruta",
  },
  {
    pattern: /^\/dashboard\/rutas\/[^/]+$/,
    title: "Detalle de la ruta",
  },
  {
    pattern: /^\/dashboard\/rutas$/,
    title: "Rutas",
  },

  // Secciones principales
  {
    pattern: /^\/dashboard\/cartera$/,
    title: "Cartera",
  },
  {
    pattern: /^\/dashboard\/facturacion$/,
    title: "Facturación",
  },
  {
    pattern: /^\/dashboard\/reportes$/,
    title: "Reportes",
  },
  {
    pattern: /^\/dashboard\/ajustes$/,
    title: "Ajustes",
  },
  {
    pattern: /^\/dashboard\/administracion$/,
    title: "Administración",
  },
  {
    pattern: /^\/dashboard\/servicios$/,
    title: "Servicios",
  },
  {
    pattern: /^\/dashboard$/,
    title: "Dashboard",
  },
];

export function getDashboardTitle(pathname: string) {
  return (
    titleRules.find((rule) => rule.pattern.test(pathname))?.title ??
    "Kuantta"
  );
}