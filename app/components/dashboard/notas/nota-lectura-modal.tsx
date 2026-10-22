"use client";

import { useEffect } from "react";
import { Pin, Trash2, X } from "lucide-react";
import { formatDate } from "@/libs/helpers";
import { Nota } from "@/types";

type NotaLecturaModalProps = {
  nota: Nota | null;
  onCerrar: () => void;
  onAlternarFijada?: (id: string) => Promise<void>;
  onEliminar?: (id: string) => Promise<void>;
};

export default function NotaLecturaModal({
  nota,
  onCerrar,
  onAlternarFijada,
  onEliminar,
}: NotaLecturaModalProps) {
  useEffect(() => {
    if (!nota) return;

    function manejarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") onCerrar();
    }

    window.addEventListener("keydown", manejarTecla);

    return () => window.removeEventListener("keydown", manejarTecla);
  }, [nota, onCerrar]);

  if (!nota) return null;

  const fecha = formatDate(nota.createdAt);

  function manejarEliminar() {
    if (!nota) return;
    if (!onEliminar) return;
    onEliminar(nota.id);
    onCerrar();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 font-inter"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="nota-lectura-titulo"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div className="min-w-0">
            <h2
              id="nota-lectura-titulo"
              className="wrap-break-word text-xl font-semibold text-primary-blue"
            >
              {nota.titulo}
            </h2>

            <p className="mt-2 text-xs text-gray-500">{fecha}</p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar nota"
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary-blue"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-wrap wrap-break-word text-sm leading-5 text-fifth-gray">
            {nota.contenido}
          </p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4">
          {onAlternarFijada && (
            <button
              type="button"
              onClick={() => onAlternarFijada(nota.id)}
              className={`${
                nota.fijada ? "bg-primary-blue text-white" : "text-fifth-gray"
              } inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium transition hover:opacity-70`}
            >
              <Pin size={16} className={nota.fijada ? "fill-current" : ""} />
              {nota.fijada ? "Desfijar" : "Fijar nota"}
            </button>
          )}

          {onEliminar && (
            <button
              type="button"
              onClick={manejarEliminar}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-gray-100"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
