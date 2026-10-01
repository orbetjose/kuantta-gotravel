"use client";

import { useRouter } from "next/navigation";

type RutaDetailProps = {
  ruta: {
    id: number;
    origen: string;
    codigoOrigen: string;
    destino: string;
    codigoDestino: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export default function RutaDetail({ ruta }: RutaDetailProps) {
  const router = useRouter();

  const fechaRegistro = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(ruta.createdAt));

  return (
    <div className="font-inter p-6 bg-fourth-gray rounded-lg w-full text-fifth-gray">
      {/* Encabezado */}
      <div className="mb-6 bg-white p-6 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-fifth-gray">Detalle de la ruta</p>

          <h1 className="text-4xl font-bold">
            {ruta.origen} - {ruta.destino}
          </h1>
        </div>
        <div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/administracion/rutas/${ruta.id}/editar`)
              }
              className="rounded-lg bg-primary-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-70"
            >
              Editar ruta
            </button>

            <button
              type="button"
              className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Eliminar ruta
            </button>
          </div>
        </div>
      </div>

      {/* Información de la ruta */}
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">
          Información de la ruta
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Origen */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Origen</p>

            <p className="font-bold">{ruta.origen}</p>
          </div>

          {/* Destino */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Destino</p>

            <p className="font-bold">{ruta.destino}</p>
          </div>

          {/* Codigo origen */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Código origen</p>

            <p className="font-bold">{ruta.codigoOrigen}</p>
          </div>

          {/* Codigo destino */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Código destino</p>

            <p className="font-bold">{ruta.codigoDestino}</p>
          </div>

          {/* Fecha de registro */}
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
