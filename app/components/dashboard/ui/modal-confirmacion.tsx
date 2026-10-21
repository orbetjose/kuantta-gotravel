"use client";

import { useState } from "react";

type ModalConfirmacionProps = {
  onEliminar: (id: number) => Promise<void>;
  id: number;
  open: boolean;
  onCerrar: () => void;
};

export default function ModalConfirmacion({
  onEliminar,
  id,
  open,
  onCerrar,
}: ModalConfirmacionProps) {
  if (!open) return null;

  function handleDelete() {
    onEliminar(id);
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 font-inter shadow-xl">
        <h2 className="text-lg font-bold text-primary-blue">
          Confirmar eliminación
        </h2>

        <p className="mt-3 text-sm text-fifth-gray">
          ¿Estás seguro de que deseas eliminar?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-gray-300 px-5 py-2 font-bold text-fifth-gray transition hover:bg-gray-100 text-sm"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-primary-blue px-5 py-2 font-bold text-white transition hover:opacity-70 text-sm"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
