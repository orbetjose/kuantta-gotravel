import { notFound, redirect } from "next/navigation";

import { prisma } from "@/libs/prisma";
import { getClientes, getPasajeros, getProveedores } from "@/actions/catalogos";
import { ServiceFormInitialData } from "@/libs/schemas/serviceSchema";
import ServiceForm from "@/app/components/dashboard/forms/service-form";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const serviceId = Number(id);

  if (Number.isNaN(serviceId)) {
    notFound();
  }

  const [servicio, clientes, proveedores, pasajeros] = await Promise.all([
    prisma.servicio.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        cliente: true,
        proveedor: true,
        pasajero: true,
        detalleServicio: true,
      },
    }),

    getClientes(),
    getProveedores(),
    getPasajeros(),
  ]);

  if (!servicio) {
    notFound();
  }

  if (servicio.estado === "FACTURADO" || servicio.estado === "ANULADO") {
    redirect(
      `/dashboard/servicios/${servicio.tipo.replace("_", "-").toLowerCase()}/${serviceId}`,
    );
  }

  const initialData: ServiceFormInitialData = {
    tipo: servicio.tipo
      ? (String(servicio.tipo) as
          | "HOTEL"
          | "ALQUILER_AUTO"
          | "SALON"
          | "EVENTO"
          | "SILLA"
          | "TARJETA_ASISTENCIA"
          | "TRASLADO"
          | "VISA"
          | "WEB_CHECKIN"
          | "PLAN_VACACIONAL")
      : "HOTEL",
    clienteId: String(servicio.cliente.id),
    proveedorId: String(servicio.proveedor?.id),
    pasajeroId: String(servicio.pasajero.id),
    estado: servicio.estado,
    fechaEmision: servicio.fechaEmision.toISOString().split("T")[0],
    fechaSolicitud: servicio.fechaSolicitud.toISOString().split("T")[0],
    descripcionServicio: servicio.detalleServicio?.descripcionServicio ?? "",
    codigoReserva: servicio.detalleServicio?.codigoReserva ?? "",
    ciudad: servicio.detalleServicio?.ciudad ?? "",
    pais: servicio.detalleServicio?.pais ?? "",
    formaPago: servicio.formaPago,
    creditoAgencia: servicio.creditoAgencia ?? undefined,
    numeroTarjeta: servicio.numeroTarjeta ?? "",
    numeroAprobacion: servicio.numeroAprobacion ?? "",
    tipoCash: servicio.tipoCash
      ? (String(servicio.tipoCash) as "EFECTIVO" | "TRANSFERENCIA")
      : undefined,
    ceCos: servicio.ceCos ?? "",
    proyectoFCDS: servicio.proyectoFCDS ?? "",
    vencimientoFacturaProveedor:
      servicio.vencimientoFacturaProveedor?.toISOString().split("T")[0] ?? "",
    pagadoCliente: servicio.pagadoCliente,
    pagadoProveedor: servicio.pagadoProveedor
      ? (String(servicio.pagadoProveedor) as "SI" | "NO" | "NO_APLICA")
      : "NO_APLICA",
    fechaPagoProveedor:
      servicio.fechaPagoProveedor?.toISOString().split("T")[0] ?? "",
    fechaPagoCliente:
      servicio.fechaPagoCliente?.toISOString().split("T")[0] ?? "",
    observaciones: servicio.observaciones ?? "",
    tarifaNeta: Number(servicio.detalleServicio?.tarifaNeta),
    ivaTarifa: Number(servicio.detalleServicio?.ivaTarifa),
    feePagoTarjetaCredito: Number(
      servicio.detalleServicio?.feePagoTarjetaCredito,
    ),
    tarifaNetaProveedor: Number(servicio.detalleServicio?.tarifaNetaProveedor),
    ivaTarifaProveedor: Number(servicio.detalleServicio?.ivaTarifaProveedor),
    comisionAgencia: Number(servicio.detalleServicio?.comisionAgencia),
    totalPagado: Number(servicio.detalleServicio?.totalPagado),
    totalVentaAgencia: Number(servicio.detalleServicio?.totalVentaAgencia),
    totalIngreso:
      Number(servicio.detalleServicio?.totalVentaAgencia) -
      Number(servicio.detalleServicio?.totalPagado),
  };

  return (
    <ServiceForm
      mode="edit"
      detalleServicioId={servicio.detalleServicio?.id}
      initialData={initialData}
      clientes={clientes}
      proveedores={proveedores}
      pasajeros={pasajeros}
    />
  );
}
