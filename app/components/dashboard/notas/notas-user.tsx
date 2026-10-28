"use client";

import { useState, useEffect } from "react";
import { Pin, Plus, Trash2, NotebookText } from "lucide-react";
import { formatDate } from "@/libs/helpers";
import NotaModal from "./nota-creacion-modal";
import NotaLecturaModal from "./nota-lectura-modal";
import Pagination from "../ui/pagination";
import { alternarNotaFijada, eliminarNota, crearNota } from "@/actions/notas";
import { NotaFormValues } from "@/libs/schemas/notaSchema";
import { Nota, PaginationType } from "@/types";

export default function NotasUser() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null);
  const [modalAbierta, setModalAbierta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        const response = await fetch(`/api/notas?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Error obteniendo notas");
        }
        const data = await response.json();
        setNotas(data.notas);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error cargando notas:", error);
        setNotas([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [pagination.page, pagination.limit]);

  function handlePageChange(page: number) {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  }

  const notasOrdenadas = [...notas].sort((a, b) => {
    if (a.fijada !== b.fijada) {
      return Number(b.fijada) - Number(a.fijada);
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function handleCrearNota(data: NotaFormValues) {
    const resultado = await crearNota(data);

    if (!resultado.success) {
      console.error(resultado.error);
      return;
    }

    setNotas((actuales) =>
      [resultado.nota, ...actuales].sort((a, b) => {
        if (a.fijada !== b.fijada) {
          return Number(b.fijada) - Number(a.fijada);
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
    );

    setModalAbierta(false);
  }

  async function handleAlternarFijada(notaId: string) {
    const resultado = await alternarNotaFijada(notaId);

    if (!resultado.success) {
      console.error(resultado.error);
      return;
    }

    setNotas((actuales) =>
      actuales
        .map((nota) =>
          nota.id === resultado.nota?.id
            ? { ...nota, fijada: resultado.nota.fijada }
            : nota,
        )
        .sort((a, b) => {
          if (a.fijada !== b.fijada) {
            return Number(b.fijada) - Number(a.fijada);
          }

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
    );
  }

  async function handleEliminarNota(notaId: string) {
    if (!window.confirm("¿Deseas eliminar esta nota?")) return;

    const resultado = await eliminarNota(notaId);

    if (!resultado.success) {
      console.error(resultado.error);
      return;
    }

    setNotas((notasActuales) =>
      notasActuales.filter((nota) => nota.id !== notaId),
    );
  }

  return (
    <div className="w-full rounded-lg bg-fourth-gray p-6">
      {/* Header */}
      <div className="mb-4 flex md:items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-inter text-4xl font-bold text-fifth-gray mb-1">
            Notas
          </h1>
          <p className="font-inter text-sm text-fifth-gray">
            Guarda recordatorios e información importante
          </p>
        </div>

        <button
          onClick={() => setModalAbierta(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-blue px-6 py-3 font-inter text-sm font-bold text-white hover:opacity-90 transition w-fit"
        >
          <Plus size={18} />
          Nueva nota
        </button>
      </div>
      {isLoading ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-gray-50 bg-white px-6 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 text-fifth-gray">
            <NotebookText size={28} />
          </div>

          <h2 className="text-base font-semibold text-primary-blue">
            Cargando notas...
          </h2>
        </div>
      ) : notasOrdenadas.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 font-inter">
          {notasOrdenadas.map((nota) => (
            <article
              key={nota.id}
              onClick={() => setNotaSeleccionada(nota)}
              className="flex h-54 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 wrap-break-word text-base font-semibold text-primary-blue">
                  {nota.titulo}
                </h2>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAlternarFijada(nota.id);
                  }}
                  title={nota.fijada ? "Desfijar nota" : "Fijar nota"}
                  aria-label={nota.fijada ? "Desfijar nota" : "Fijar nota"}
                  className={`shrink-0 rounded-lg p-2 transition ${
                    nota.fijada
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  <Pin size={17} />
                </button>
              </div>

              <p className="mt-3 flex-1 overflow-hidden whitespace-pre-wrap wrap-break-word text-sm leading-5 text-fifth-gray [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                {nota.contenido}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-fifth-gray">
                  {formatDate(nota.createdAt)}
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEliminarNota(nota.id);
                  }}
                  title="Eliminar nota"
                  aria-label={`Eliminar nota ${nota.titulo}`}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-6 text-center font-inter">
          <div className="mb-4 rounded-full bg-gray-100 p-4 text-fifth-gray">
            <NotebookText size={28} />
          </div>

          <h2 className="text-base font-bold text-primary-blue">
            Todavía no tienes notas
          </h2>

          <p className="mt-2 max-w-sm text-sm text-fifth-gray">
            Crea tu primera nota para guardar recordatorios o información
            importante.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          currentItems={notas.length}
          onPageChange={handlePageChange}
          itemName="notas"
        />
      )}
      
      <NotaLecturaModal
        nota={notaSeleccionada}
        onCerrar={() => setNotaSeleccionada(null)}
        onAlternarFijada={handleAlternarFijada}
        onEliminar={handleEliminarNota}
      />
      <NotaModal
        abierta={modalAbierta}
        onCerrar={() => setModalAbierta(false)}
        onCrear={handleCrearNota}
      />
    </div>
  );
}
