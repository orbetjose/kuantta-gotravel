import { notFound, redirect } from "next/navigation";

import { prisma } from "@/libs/prisma";
import { getClientes, getPasajeros, getProveedores } from "@/actions/catalogos";
import { ServiceFormInitialData } from "@/libs/schemas/serviceSchema";
import ServiceForm from "@/app/components/dashboard/service-form";

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
    tipoServicio: servicio.tipo
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
    clienteId: servicio.cliente.id,
    proveedorId: servicio.proveedor?.id,
    pasajeroId: servicio.pasajero.id,
    fechaEmision: servicio.fechaEmision.toISOString().split("T")[0],
    descripcionServicio: servicio.detalleServicio?.descripcionServicio ?? "",
    codigoReserva: servicio.detalleServicio?.codigoReserva ?? "",
    valorPagadoProveedor: Number(
      servicio.detalleServicio?.valorPagadoProveedor,
    ),
    trm: Number(servicio.detalleServicio?.trm),
    feePagoTarjetaCredito: Number(
      servicio.detalleServicio?.feePagoTarjetaCredito,
    ),
    formaPago: servicio.formaPago,
    creditoAgencia: servicio.creditoAgencia
      ? (String(servicio.creditoAgencia) as "3" | "8" | "15" | "30")
      : undefined,
    numeroTarjeta: servicio.numeroTarjeta ?? "",
    numeroAprobacion: servicio.numeroAprobacion ?? "",
    tipoCash: servicio.tipoCash
      ? (String(servicio.tipoCash) as "EFECTIVO" | "TRANSFERENCIA")
      : undefined,
    ceCos: servicio.ceCos ?? "",
    proyectoFCDS: servicio.proyectoFCDS ?? "",
    vencimientoFacturaProveedor:
      servicio.vencimientoFacturaProveedor?.toISOString().split("T")[0] ?? "",
    pagadoProveedor: servicio.pagadoProveedor
      ? (String(servicio.pagadoProveedor) as "SI" | "NO" | "NO_APLICA")
      : "NO_APLICA",
    fechaPagoProveedor:
      servicio.fechaPagoProveedor?.toISOString().split("T")[0] ?? "",
    fechaPagoCliente:
      servicio.fechaPagoCliente?.toISOString().split("T")[0] ?? "",
    observaciones: servicio.observaciones ?? "",
    totalIngreso: Number(servicio.detalleServicio?.totalIngreso),
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
