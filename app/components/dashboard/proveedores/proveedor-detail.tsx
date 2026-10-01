"use client";

import { useRouter } from "next/navigation";
import { TipoServicio, EstadoServicio } from "@/libs/generated/prisma/client";

type ProveedorDetailProps = {
  proveedor: {
    id: number;
    razonSocial: string;
    ruc: string;
    correo: string;
    direccionFiscal: string;
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
    }[];
  };
};

export default function ProveedorDetail({ proveedor }: ProveedorDetailProps) {
  const router = useRouter();

  const fechaRegistro = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(proveedor.createdAt));

  const getServicioInfo = (
    servicio: ProveedorDetailProps["proveedor"]["servicios"][number],
  ) => {
    switch (servicio.tipo) {
      case "TIQUETE":
        return {
          id: servicio.tiquete?.id,
          totalPagar: servicio.tiquete?.totalPagar,
          href: servicio.tiquete
            ? `/dashboard/servicios/tiquete/${servicio.tiquete.id}`
            : null,
        };

      // Cuando exista Hotel:
      // case "HOTEL":
      //   return {
      //     id: servicio.hotel?.id,
      //     totalPagar: servicio.hotel?.totalPagar,
      //     href: servicio.hotel
      //       ? `/dashboard/hoteles/${servicio.hotel.id}`
      //       : null,
      //   };

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
          <p className="text-sm text-fifth-gray">Detalle del proveedor</p>

          <h1 className="text-4xl font-bold">{proveedor.razonSocial}</h1>
        </div>
        <div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/proveedores/${proveedor.id}/editar`)
              }
              className="rounded-lg bg-primary-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-70"
            >
              Editar proveedor
            </button>

            <button
              type="button"
              className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Eliminar proveedor
            </button>
          </div>
        </div>
      </div>

      {/* Información del proveedor */}
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">Información del proveedor</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* razon social */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Razón social</p>

            <p className="font-bold">{proveedor.razonSocial}</p>
          </div>

          {/* ruc */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">RUC</p>

            <p className="font-bold">{proveedor.ruc}</p>
          </div>

          {/* Correo */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Correo electrónico</p>

            <p className="font-bold">{proveedor.correo}</p>
          </div>

          {/* Teléfono */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Teléfono</p>

            <p className="font-bold">{proveedor.telefono}</p>
          </div>

          {/* Fecha de registro */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Fecha de registro</p>

            <p className="font-bold">{fechaRegistro}</p>
          </div>
          {/* Dirección fiscal */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Dirección fiscal</p>

            <p className="font-bold">{proveedor.direccionFiscal}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">Servicios asociados</h2>

          <span className="text-sm text-fifth-gray">
            {proveedor.servicios.length} servicios
          </span>
        </div>

        {proveedor.servicios.length === 0 ? (
          <p className="text-sm text-fifth-gray">
            Este proveedor no tiene servicios asociados.
          </p>
        ) : (
          <div className="divide-y divide-gray-200">
            {proveedor.servicios.map((servicio) => {
              const servicioInfo = getServicioInfo(servicio);

              return (
                <div
                  key={servicio.id}
                  onClick={() => {
                    if (servicioInfo.href) {
                      router.push(servicioInfo.href);
                    }
                  }}
                  className={`flex items-center justify-between py-4 ${
                    servicioInfo.href
                      ? "cursor-pointer transition hover:bg-gray-50"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-bold text-fifth-gray">{servicio.tipo}</p>

                    <p className="mt-1 text-sm text-fifth-gray">
                      {servicio.proveedor?.razonSocial ?? "Sin proveedor"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-fifth-gray">Estado</p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          servicio.estado === "FACTURADO"
                            ? "bg-green-100 text-green-700"
                            : servicio.estado === "DEVUELTO"
                              ? "bg-orange-100 text-orange-700"
                              : servicio.estado === "POR_REVISAR"
                                ? "bg-yellow-100 text-yellow-700"
                                : servicio.estado === "ANULADO"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {servicio.estado}
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
