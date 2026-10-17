import {
  ClienteOption,
  PasajeroOption,
  ProveedorOption,
  RutaOption,
} from "@/types";

export const getClientesOptions = (clientes: ClienteOption[]) =>
  clientes.map((cliente) => ({
    value: String(cliente.id),
    label: cliente.nombre,
    razonSocial: cliente.razonSocial,
    tipoDocumento: cliente.tipoDocumento,
    documento: cliente.documento,
    correo: cliente.correo,
    telefono: cliente.telefono,
  }));

export const getPasajerosOptions = (pasajeros: PasajeroOption[]) =>
  pasajeros.map((pasajero) => ({
    value: String(pasajero.id),
    label: `${pasajero.nombre} ${pasajero.apellido}`,
    documento: pasajero.documento,
    telefono: pasajero.telefono,
    correo: pasajero.correo,
  }));

export const getProveedoresOptions = (proveedores: ProveedorOption[]) =>
  proveedores.map((proveedor) => ({
    value: String(proveedor.id),
    label: proveedor.razonSocial,
    nit: proveedor.nit,
    nombreComercial: proveedor.nombreComercial,
    correoComercial: proveedor.correoComercial,
    telefono: proveedor.telefono,
  }));

export const getRutasOptions = (rutas: RutaOption[]) =>
  rutas.map((ruta) => ({
    value: String(ruta.id),
    label: `${ruta.codigoIATA} — ${ruta.ciudad}, ${ruta.pais}`,
  }));
