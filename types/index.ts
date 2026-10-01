export type ActionResult<T> =
  | { success: true; data: T; total: number }
  | { success: false; error: string };

export type Servicios = {
  id: number;
  tipo: string;
  total: number;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  fechaEmision: string;
  estadoCredito: string;
  fechaVencimiento: string;
  dias: string;
  creditoAgencia: number;
  pagadoCliente: boolean;
  createdAt: string;
  idTiquete: number;
  estado: string;
  proveedor: string;
};

export interface TableFilterValues {
  fechaDesde: string;
  fechaHasta: string;
  tipo: string;
  estado: string;
  creditoAgencia: string;
}

export interface DashboardFilterValues {
  fechaDesde: string;
  fechaHasta: string;
  tipo: string;
  estado: string;
}

export type TableFilter = "date" | "tipo" | "estado" | "credito";
