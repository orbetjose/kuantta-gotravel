import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import TiqueteDetail from "@/app/components/dashboard/tiquetes/tiquete-detail";
import { auth } from "@/auth";

export default async function TiqueteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tiqueteId = Number(id);

  if (Number.isNaN(tiqueteId)) {
    notFound();
  }

  const tiquete = await prisma.tiquete.findUnique({
    where: {
      id: tiqueteId,
    },
    select: {
      id: true,
      numeroTiquete: true,

      revision: true,
      numeroTiqueteRevision: true,

      clase: true,
      fechaIda: true,
      fechaRegreso: true,

      tarifaNeta: true,
      ivaTarifa: true,
      otrosImpuestos: true,
      tarifaAdministrativaNeta: true,
      ivaTarifaAdministrativa: true,
      feeAgenciaNeta: true,
      ivaFeeAgencia: true,
      feePagoTarjeta: true,
      totalPagar: true,

      aph: true,

      fechaEmisionTiqueteFES: true,

      createdAt: true,
      updatedAt: true,

      ruta: {
        select: {
          origen: true,
          codigoOrigen: true,
          destino: true,
          codigoDestino: true,
        },
      },

      servicio: {
        select: {
          id: true,
          uuid: true,
          estado: true,
          fechaEmision: true,

          formaPago: true,
          creditoAgencia: true,
          numeroTarjeta: true,
          numeroAprobacion: true,
          tipoCash: true,

          ceCos: true,
          proyectoFCDS: true,

          facturaProveedorUrl: true,
          soporteTiqueteElectronicoUrl: true,
          facturaGoTravelUrl: true,

          observaciones: true,

          createdAt: true,

          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true,
            },
          },

          pasajero: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              telefono: true,
            },
          },

          proveedor: {
            select: {
              id: true,
              razonSocial: true,
              ruc: true,
              correo: true,
              telefono: true,
            },
          },

          creadoPor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!tiquete) {
    notFound();
  }

  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  return <TiqueteDetail tiquete={tiquete} role={session.user.role} />;
}
