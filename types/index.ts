export type ActionResult<T> =
  | { success: true; data: T; total: number }
  | { success: false; error: string };

export type PaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

export type ClienteOption = {
  id: number;
  nombre: string;
  tipoDocumento: string;
  documento: string;
  razonSocial?: string | null;
  correo: string;
  telefono: string;
};
export type PasajeroOption = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  documento: string;
};
export type ProveedorOption = {
  id: number;
  razonSocial: string;
  nit: string;
  telefono: string | null;
  nombreComercial: string | null;
  correoComercial: string | null;
};
export type RutaOption = {
  id: number;
  codigoIATA: string;
  nombreAeropuerto: string;
  ciudad: string;
  pais: string;
};

export type Nota = {
  id: string;
  titulo: string;
  contenido: string;
  fijada: boolean;
  createdAt: Date;
};
