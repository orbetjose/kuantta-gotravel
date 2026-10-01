import { notFound, redirect } from "next/navigation";

import { prisma } from "@/libs/prisma";
import TicketForm from "@/app/components/dashboard/ticket-form";
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
        ruta: true,
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
    redirect(`/dashboard/tiquetes/${tiqueteId}`);
  }

  const initialData: TicketFormInitialData = {
    // -----------------------------
    // Servicio
    // -----------------------------

    clienteId: tiquete.servicio.cliente.id,

    proveedorId: tiquete.servicio.proveedor?.id,

    pasajeroId: tiquete.servicio.pasajero.id,

    fechaEmision: tiquete.servicio.fechaEmision.toISOString().split("T")[0],

    formaPago: tiquete.servicio.formaPago,

    creditoAgencia: tiquete.servicio.creditoAgencia
      ? (String(tiquete.servicio.creditoAgencia) as "3" | "8" | "15" | "30")
      : undefined,

    numeroTarjeta: tiquete.servicio.numeroTarjeta ?? "",

    numeroAprobacion: tiquete.servicio.numeroAprobacion ?? "",

    tipoCash: tiquete.servicio.tipoCash ?? undefined,

    ceCos: tiquete.servicio.ceCos ?? "",

    proyectoFCDS: tiquete.servicio.proyectoFCDS ?? "",

    observaciones: tiquete.servicio.observaciones ?? "",

    // -----------------------------
    // Tiquete
    // -----------------------------

    numeroTiquete: tiquete.numeroTiquete,

    revision: tiquete.revision ? "SI" : "NO",

    numeroTiqueteRevision: tiquete.numeroTiqueteRevision ?? "",

    rutaId: tiquete.rutaId,

    clase: tiquete.clase,

    fechaIda: tiquete.fechaIda.toISOString().split("T")[0],

    fechaRegreso: tiquete.fechaRegreso
      ? tiquete.fechaRegreso.toISOString().split("T")[0]
      : "",

    tarifaNeta: Number(tiquete.tarifaNeta),

    ivaTarifa: Number(tiquete.ivaTarifa),

    otrosImpuestos: Number(tiquete.otrosImpuestos),

    tarifaAdministrativaNeta: Number(tiquete.tarifaAdministrativaNeta),

    ivaTarifaAdministrativa: Number(tiquete.ivaTarifaAdministrativa),

    feeAgenciaNeta: Number(tiquete.feeAgenciaNeta),

    ivaFeeAgencia: Number(tiquete.ivaFeeAgencia),

    feePagoTarjeta: Number(tiquete.feePagoTarjeta),

    totalPagar: Number(tiquete.totalPagar),

    aph: tiquete.aph,

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
