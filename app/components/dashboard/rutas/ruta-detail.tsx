"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/libs/helpers";
import ModalConfirmacion from "../ui/modal-confirmacion";
import { deleteRuta } from "@/actions/routes";
import { can, type Role } from "@/libs/permissions";

type RutaDetailProps = {
  ruta: {
    id: number;
    codigoIATA: string;
    nombreAeropuerto: string;
    ciudad: string;
    pais: string;
    region: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  role: Role;
};

export default function RutaDetail({ ruta, role }: RutaDetailProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fechaRegistro = formatDate(ruta.createdAt);

  async function handleEliminar(rutaId: number) {
    const response = await deleteRuta(rutaId);

    if (!response) {
      console.log(response);
    }

    router.push(`/dashboard/rutas/`);
  }

  return (
    <div className="font-inter p-6 bg-fourth-gray rounded-lg w-full text-fifth-gray">
      {/* Encabezado */}
      <div className="mb-6 bg-white p-6 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-fifth-gray">Detalle de la ruta</p>

          <h1 className="text-3xl font-bold">
            {ruta.codigoIATA} - {ruta.ciudad} - {ruta.pais}
          </h1>
        </div>
        <div>
          <div className="flex gap-4">
            {can(role, "rutas", "edit") && (
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/rutas/${ruta.id}/editar`)
                }
                className="rounded-lg bg-primary-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-70"
              >
                Editar ruta
              </button>
            )}
            {can(role, "rutas", "delete") && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Eliminar ruta
              </button>
            )}
          </div>
        </div>
      </div>
      <ModalConfirmacion
        open={isModalOpen}
        onEliminar={handleEliminar}
        id={ruta.id}
        onCerrar={() => setIsModalOpen(false)}
      />

      {/* Información de la ruta */}
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">Información de la ruta</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Código IATA</p>

            <p className="font-bold">{ruta.codigoIATA}</p>
          </div>

          <div>
            <p className="mb-1 text-sm text-fifth-gray">Aeropuerto</p>

            <p className="font-bold">{ruta.nombreAeropuerto}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Ciudad</p>

            <p className="font-bold">{ruta.ciudad}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-fifth-gray">País</p>

            <p className="font-bold">{ruta.pais}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Región</p>

            <p className="font-bold">{ruta.region}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Fecha de registro</p>

            <p className="font-bold">{fechaRegistro}</p>
          </div>
        </div>
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
