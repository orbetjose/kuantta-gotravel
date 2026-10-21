"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getEstadoStyles } from "@/libs/helpers";
import type {
  CategoriaProveedor,
  RemuneracionProveedor,
  Moneda,
  CondicionPago,
  TipoServicio,
  EstadoServicio,
} from "@/libs/generated/prisma/client";
import { deleteProveedor } from "@/actions/providers";
import ModalConfirmacion from "../ui/modal-confirmacion";

type ProveedorDetailProps = {
  proveedor: {
    id: number;
    razonSocial: string;
    nombreComercial: string | null;
    nit: string;
    categoria: CategoriaProveedor;
    ciudad: string | null;
    direccion: string | null;
    telefono: string | null;
    correoComercial: string | null;
    correoFacturacion: string | null;
    contacto: string | null;
    remuneracion: RemuneracionProveedor;
    monedaBase: Moneda;
    condicionPago: CondicionPago;
    documentosPdf: string[];
    activo: boolean;
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
        totalVentaAgencia: number;
      } | null;
    }[];
  };
};

export default function ProveedorDetail({ proveedor }: ProveedorDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          totalPagar: servicio.detalleServicio?.totalVentaAgencia ?? null,
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

  async function handleEliminar(proveedorId: number) {
    const response = await deleteProveedor(proveedorId);

    if (!response) {
      console.log(response);
    }

    router.push(`/dashboard/proveedores/`);
  }

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
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Eliminar proveedor
            </button>
          </div>
        </div>
      </div>
      <ModalConfirmacion
        open={isModalOpen}
        onEliminar={handleEliminar}
        id={proveedor.id}
        onCerrar={() => setIsModalOpen(false)}
      />

      {/* Información del proveedor */}
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">Información del proveedor</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Razón social */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Razón social</p>
            <p className="font-bold">{proveedor.razonSocial}</p>
          </div>

          {/* Nombre comercial */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Nombre comercial</p>
            <p className="font-bold">{proveedor.nombreComercial ?? "—"}</p>
          </div>

          {/* NIT */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">NIT</p>
            <p className="font-bold">{proveedor.nit}</p>
          </div>

          {/* Categoría */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Categoría</p>
            <p className="font-bold">{proveedor.categoria}</p>
          </div>

          {/* Ciudad */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Ciudad</p>
            <p className="font-bold">{proveedor.ciudad ?? "—"}</p>
          </div>

          {/* Dirección */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Dirección</p>
            <p className="font-bold">{proveedor.direccion ?? "—"}</p>
          </div>

          {/* Teléfono */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Teléfono</p>
            <p className="font-bold">{proveedor.telefono ?? "—"}</p>
          </div>

          {/* Contacto */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Persona de contacto</p>
            <p className="font-bold">{proveedor.contacto ?? "—"}</p>
          </div>

          {/* Correo comercial */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Correo comercial</p>
            <p className="font-bold">{proveedor.correoComercial ?? "—"}</p>
          </div>

          {/* Correo de facturación */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">
              Correo de facturación
            </p>
            <p className="font-bold">{proveedor.correoFacturacion ?? "—"}</p>
          </div>

          {/* Remuneración */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Remuneración</p>
            <p className="font-bold">
              {proveedor.remuneracion === "COMISION"
                ? "Comisión"
                : "Neto (Mark-up)"}
            </p>
          </div>

          {/* Moneda base */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Moneda base</p>
            <p className="font-bold">{proveedor.monedaBase}</p>
          </div>

          {/* Condición de pago */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Condición de pago</p>
            <p className="font-bold">
              {proveedor.condicionPago === "INMEDIATO"
                ? "Inmediato"
                : "Crédito"}
            </p>
          </div>

          {/* Estado */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Estado</p>
            <p className="font-bold">
              {proveedor.activo ? "Activo" : "Inactivo"}
            </p>
          </div>

          {/* Fecha de registro */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Fecha de registro</p>
            <p className="font-bold">{fechaRegistro}</p>
          </div>

          {/* Última actualización */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Última actualización</p>
            <p className="font-bold">
              {new Date(proveedor.updatedAt).toLocaleDateString("es-CO")}
            </p>
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
