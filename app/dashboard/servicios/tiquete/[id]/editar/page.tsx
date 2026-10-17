import { notFound, redirect } from "next/navigation";

import { prisma } from "@/libs/prisma";
import TicketForm from "@/app/components/dashboard/forms/ticket-form";
import { TicketFormInitialData } from "@/libs/schemas/ticketSchema";
import {
  getClientes,
  getPasajeros,
  getProveedores,
  getRutas,
} from "@/actions/catalogos";

export default async function EditarTiquetePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tiqueteId = Number(id);

  if (Number.isNaN(tiqueteId)) {
    notFound();
  }

  const [tiquete, clientes, proveedores, rutas, pasajeros] = await Promise.all([
    prisma.tiquete.findUnique({
      where: {
        id: tiqueteId,
      },
      include: {
        servicio: {
          include: {
            cliente: true,
            proveedor: true,
            pasajero: true,
          },
        },
        trayectos: {
          include: {
            origen: true,
            destino: true,
          },
        },
      },
    }),

    getClientes(),
    getProveedores(),
    getRutas(),
    getPasajeros(),
  ]);

  if (!tiquete) {
    notFound();
  }

  if (
    tiquete.servicio.estado === "FACTURADO" ||
    tiquete.servicio.estado === "ANULADO"
  ) {
    redirect(`/dashboard/servicios/tiquete/${tiqueteId}`);
  }

  const initialData: TicketFormInitialData = {
    // -----------------------------
    // Servicio
    // -----------------------------

    clienteId: String(tiquete.servicio.cliente.id),

    proveedorId: String(tiquete.servicio.proveedor?.id),

    pasajeroId: String(tiquete.servicio.pasajero.id),

    fechaEmision: tiquete.servicio.fechaEmision.toISOString().split("T")[0],
    fechaSolicitud: tiquete.servicio.fechaSolicitud.toISOString().split("T")[0],

    formaPago: tiquete.servicio.formaPago,

    creditoAgencia: tiquete.servicio.creditoAgencia
      ? (String(tiquete.servicio.creditoAgencia) as "3" | "8" | "15" | "30")
      : undefined,

    numeroTarjeta: tiquete.servicio.numeroTarjeta ?? "",

    codigoReserva: tiquete.codigoReserva,

    canalVenta: tiquete.canalVenta,

    tipoViaje: tiquete.tipoViaje,

    tipoItinerario: tiquete.tipoItinerario,

    numeroAprobacion: tiquete.servicio.numeroAprobacion ?? "",

    tipoCash: tiquete.servicio.tipoCash ?? undefined,

    ceCos: tiquete.servicio.ceCos ?? "",

    proyectoFCDS: tiquete.servicio.proyectoFCDS ?? "",

    observaciones: tiquete.servicio.observaciones ?? "",

    trayectos: tiquete.trayectos.map((trayecto) => ({
      origenId: String(trayecto.origenId),
      destinoId: String(trayecto.destinoId),
      origenLabel: `${trayecto.origen.codigoIATA} — ${trayecto.origen.ciudad}, ${trayecto.origen.pais}`,
      destinoLabel: `${trayecto.destino.codigoIATA} — ${trayecto.destino.ciudad}, ${trayecto.destino.pais}`,
      fechaSalida: trayecto.fechaSalida.toISOString().split("T")[0],
      fechaRegreso: trayecto.fechaRegreso
        ? trayecto.fechaRegreso.toISOString().split("T")[0]
        : "",
    })),

    // -----------------------------
    // Tiquete
    // -----------------------------

    numeroTiquete: tiquete.numeroTiquete,

    revision: tiquete.revision,

    numeroTiqueteRevision: tiquete.numeroTiqueteRevision ?? "",

    clase: tiquete.clase,

    tarifaNeta: Number(tiquete.tarifaNeta),

    ivaTarifa: Number(tiquete.ivaTarifa),

    otrosImpuestos: Number(tiquete.otrosImpuestos),

    tarifaAdministrativaNeta: Number(tiquete.tarifaAdministrativaNeta),

    ivaTarifaAdministrativa: Number(tiquete.ivaTarifaAdministrativa),

    feeAgenciaNeta: Number(tiquete.feeAgenciaNeta),

    ivaFeeAgencia: Number(tiquete.ivaFeeAgencia),
    tarifaAPH: Number(tiquete.tarifaAPH),
    ivaTarifaAPH: Number(tiquete.ivaTarifaAPH),

    totalPagar: Number(tiquete.totalPagar),

    fechaEmisionTiqueteFES: tiquete.fechaEmisionTiqueteFES
      .toISOString()
      .split("T")[0],
  };

  return (
    <TicketForm
      mode="edit"
      tiqueteId={tiquete.id}
      initialData={initialData}
      clientes={clientes}
      proveedores={proveedores}
      pasajeros={pasajeros}
      rutas={rutas}
    />
  );
}
