"use client";

import { useRouter } from "next/navigation";
import { TipoServicio, EstadoServicio } from "@/libs/generated/prisma/client";
import { getEstadoStyles } from "@/libs/helpers";

type ClienteDetailProps = {
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    createdAt: Date;
    updatedAt: Date;

    servicios: {
      id: number;
      uuid: string;
      tipo: TipoServicio;
      estado: EstadoServicio;
      createdAt: Date;

      proveedor: {
        id: number;
        razonSocial: string;
      } | null;

      tiquete: {
        id: number;
        totalPagar: number;
      } | null;
      detalleServicio: {
        id: number;
        totalIngreso: number;
      } | null;
    }[];
  };
};

export default function ClienteDetail({ cliente }: ClienteDetailProps) {
  const router = useRouter();

  const fechaRegistro = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(cliente.createdAt));

  const getServicioInfo = (
    servicio: ClienteDetailProps["cliente"]["servicios"][number],
  ) => {
    switch (servicio.tipo) {
      case "TIQUETE":
        return {
          id: servicio.tiquete?.id ?? null,
          totalPagar: servicio.tiquete?.totalPagar ?? null,
          href: servicio.tiquete
            ? `/dashboard/servicios/tiquete/${servicio.tiquete.id}`
            : null,
        };

      case "HOTEL":
      case "ALQUILER_AUTO":
      case "SALON":
      case "EVENTO":
      case "SILLA":
      case "TARJETA_ASISTENCIA":
      case "TRASLADO":
      case "VISA":
      case "WEB_CHECKIN":
      case "PLAN_VACACIONAL":
        return {
          id: servicio.detalleServicio?.id ?? null,
          totalPagar: servicio.detalleServicio?.totalIngreso ?? null,
          href: servicio.detalleServicio
            ? `/dashboard/servicios/${servicio.tipo.toLowerCase().replace("_", "-")}/${servicio.detalleServicio.id}`
            : null,
        };

      default:
        return {
          id: null,
          totalPagar: null,
          href: null,
        };
    }
  };

  return (
    <div className="font-inter p-6 bg-fourth-gray rounded-lg w-full text-fifth-gray">
      {/* Encabezado */}
      <div className="mb-6 bg-white p-6 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-fifth-gray">Detalle del cliente</p>

          <h1 className="text-4xl font-bold">
            {cliente.nombre} {cliente.apellido}
          </h1>
        </div>
        <div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/clientes/${cliente.id}/editar`)
              }
              className="rounded-lg bg-primary-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-70"
            >
              Editar cliente
            </button>

            <button
              type="button"
              className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Eliminar cliente
            </button>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">Información del cliente</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nombre */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Nombre</p>

            <p className="font-bold">{cliente.nombre}</p>
          </div>

          {/* Apellido */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Apellido</p>

            <p className="font-bold">{cliente.apellido}</p>
          </div>

          {/* Correo */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Correo electrónico</p>

            <p className="font-bold">{cliente.correo}</p>
          </div>

          {/* Teléfono */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Teléfono</p>

            <p className="font-bold">{cliente.telefono}</p>
          </div>

          {/* Fecha de registro */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Fecha de registro</p>

            <p className="font-bold">{fechaRegistro}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-fifth-gray">
            Servicios asociados
          </h2>

          <span className="text-sm text-fifth-gray">
            {cliente.servicios.length} servicios
          </span>
        </div>

        {cliente.servicios.length === 0 ? (
          <p className="text-sm text-fifth-gray">
            Este cliente no tiene servicios asociados.
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {cliente.servicios.map((servicio) => {
              const servicioInfo = getServicioInfo(servicio);

              return (
                <div
                  key={servicio.id}
                  onClick={() => {
                    if (servicioInfo.href) {
                      router.push(servicioInfo.href);
                    }
                  }}
                  className={`flex items-center justify-between p-4 ${
                    servicioInfo.href
                      ? "cursor-pointer transition hover:bg-gray-50"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-bold text-fifth-gray">
                      {servicio.tipo.replace("_", " ")}
                    </p>

                    <p className="mt-1 text-sm text-fifth-gray">
                      {servicio.proveedor?.razonSocial ?? "Sin proveedor"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-fifth-gray">Estado</p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getEstadoStyles(
                          servicio.estado,
                        )}`}
                      >
                        {servicio.estado.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-fifth-gray">Total</p>
                      <p className="font-bold text-fifth-gray">
                        {servicioInfo.totalPagar
                          ? new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            }).format(Number(servicioInfo.totalPagar))
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-primary-green px-4 py-2 text-sm font-bold text-white transition hover:opacity-70"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
