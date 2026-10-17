"use client";

import { useRouter } from "next/navigation";
import { Role } from "@/libs/generated/prisma/enums";
import { getEstadoStyles } from "@/libs/helpers";

type UsuarioDetailProps = {
  usuario: {
    id: string;
    role: Role;
    name: string | null;
    email: string;
    password: string | null;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export default function UsuarioDetail({ usuario }: UsuarioDetailProps) {
  const router = useRouter();

  const fechaRegistro = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
  }).format(new Date(usuario.createdAt));

  return (
    <div className="font-inter p-6 bg-fourth-gray rounded-lg w-full text-fifth-gray">
      {/* Encabezado */}
      <div className="mb-6 bg-white p-6 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-fifth-gray">Detalle del usuario</p>

          <h1 className="text-4xl font-bold">{usuario.name}</h1>
        </div>
        <div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/administracion/usuarios/${usuario.id}/editar`,
                )
              }
              className="rounded-lg bg-primary-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-70"
            >
              Editar usuario
            </button>

            <button
              type="button"
              className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              Eliminar usuario
            </button>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="rounded-lg bg-white p-6">
        <h2 className="mb-6 text-xl font-bold">Información del usuario</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nombre */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Nombre</p>

            <p className="font-bold">{usuario.name}</p>
          </div>

          {/* Correo */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Correo electrónico</p>

            <p className="font-bold">{usuario.email}</p>
          </div>

          {/* Teléfono */}
          <div>
            <p className="mb-1 text-sm text-fifth-gray">Role</p>

            <p className="font-bold">{usuario.role}</p>
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
