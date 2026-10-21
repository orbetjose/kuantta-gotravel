"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormTextarea from "@/app/components/dashboard/ui/FormTextArea";
import { notaSchema, type NotaFormValues } from "@/libs/schemas/notaSchema";
import { X } from "lucide-react";

type NotaModalProps = {
  abierta: boolean;
  onCerrar: () => void;
  onCrear: (data: NotaFormValues) => Promise<void>;
};

export default function NotaModal({
  abierta,
  onCerrar,
  onCrear,
}: NotaModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotaFormValues>({
    resolver: zodResolver(notaSchema),
    defaultValues: { titulo: "", contenido: "" },
  });

  useEffect(() => {
    if (!abierta) return;

    function manejarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") onCerrar();
    }

    window.addEventListener("keydown", manejarTecla);

    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierta, onCerrar]);

  if (!abierta) return null;

  async function onSubmit(data: NotaFormValues) {
    await onCrear(data);
    cerrarModal();
  }

  function cerrarModal() {
    reset();
    onCerrar();
  }
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cerrarModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nota-modal-titulo"
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl font-inter"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2
              id="nota-modal-titulo"
              className="text-lg font-semibold text-primary-blue"
            >
              Nueva nota
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Escribe el título y el contenido de tu nota.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarModal}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary-blue"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <FormInput
                label="Titulo"
                name="titulo"
                registration={register("titulo")}
                placeholder="Ingresa el titulo"
                required
                error={errors.titulo?.message}
              />
            </div>

            <div className="space-y-2">
              <FormTextarea
                label="Contenido"
                name="contenido"
                registration={register("contenido")}
                placeholder="Ingresa el contenido"
                required
                error={errors.contenido?.message}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={cerrarModal}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-fifth-gray transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-primary-blue px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Crear nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
