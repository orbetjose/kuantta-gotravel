"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  anularServicio,
  devolverServicio,
  facturarServicio,
  porFacturarServicio,
} from "@/actions/servicios";

type Role = "ADMINISTRADOR" | "ASESOR" | "FACTURADOR";

type ServicioActionsProps = {
  servicioId: number;
  tiqueteId?: number;
  estado: "BORRADOR" | "POR_FACTURAR" | "DEVUELTO" | "FACTURADO" | "ANULADO";
  role: Role;
  tipoServicio: string
};

export default function ServicioActions({
  servicioId,
  estado,
  role,
  tipoServicio,
  tiqueteId
}: ServicioActionsProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [showMenu, setShowMenu] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canEdit = estado !== "FACTURADO" && estado !== "ANULADO";

  const canSubmit =
    (role === "ASESOR" || role === "ADMINISTRADOR") &&
    (estado === "BORRADOR" || estado === "DEVUELTO");

  const canReview =
    (role === "FACTURADOR" || role === "ADMINISTRADOR") &&
    estado === "POR_FACTURAR";

  const canCancel = role === "ADMINISTRADOR" && estado !== "ANULADO";

  const hasActions = canSubmit || canReview || canCancel;

  const handleSubmit = () => {
    setError(null);

    startTransition(async () => {
      try {
        await porFacturarServicio(servicioId);

        setShowMenu(false);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo enviar el tiquete a revisión.",
        );
      }
    });
  };

  const handleFacturar = () => {
    setError(null);

    startTransition(async () => {
      try {
        await facturarServicio(servicioId);

        setShowMenu(false);
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo facturar el tiquete.",
        );
      }
    });
  };

  const handleDevolver = () => {
    if (!motivo.trim()) {
      setError("Debes indicar el motivo de la devolución.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await devolverServicio(servicioId, motivo);

        setMotivo("");
        setShowReturnModal(false);
        setShowMenu(false);

        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo devolver el servicio.",
        );
      }
    });
  };

  const handleCancelar = () => {
    setError(null);

    startTransition(async () => {
      try {
        await anularServicio(servicioId);

        setShowCancelModal(false);
        setShowMenu(false);

        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo cancelar el servicio.",
        );
      }
    });
  };

  return (
    <>
      <div className="relative flex items-center gap-3 font-inter">
        {canEdit && (
          <button
            type="button"
            className="rounded-lg bg-primary-green px-4 py-2 text-sm font-medium text-white transition hover:opacity-70"
            onClick={() => {
              tipoServicio === "TIQUETE" ? router.push(`/dashboard/servicios/${tipoServicio.replace("_","-").toLocaleLowerCase()}/${tiqueteId}/editar`) : 
              router.push(`/dashboard/servicios/${tipoServicio.replace("_","-").toLocaleLowerCase()}/${servicioId}/editar`);
            }}
          >
            Editar
            
          </button>
        )}

        {hasActions && (
          <div className="relative">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setShowMenu((current) => !current);
                setError(null);
              }}
              className="rounded-lg bg-primary-blue px-4 py-2 text-sm font-medium text-white transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Acciones
            </button>

            {showMenu && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                {canSubmit && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSubmit}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Enviar a facturar
                  </button>
                )}

                {canReview && (
                  <>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleFacturar}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Facturar
                    </button>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setShowReturnModal(true);
                        setError(null);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Devolver
                    </button>
                  </>
                )}

                {canCancel && (
                  <>
                    <div className="my-1 border-t border-gray-100" />

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setShowCancelModal(true);
                        setError(null);
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancelar tiquete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {/* Modal devolver */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Devolver tiquete
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Indica el motivo por el cual el tiquete debe ser corregido.
            </p>

            <textarea
              value={motivo}
              onChange={(event) => {
                setMotivo(event.target.value);
                setError(null);
              }}
              rows={4}
              placeholder="Ej. Falta adjuntar la factura del proveedor..."
              className="mt-4 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-gray-400"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowReturnModal(false);
                  setMotivo("");
                  setError(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDevolver}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isPending ? "Devolviendo..." : "Devolver"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelar */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Cancelar tiquete
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              ¿Estás seguro de que deseas cancelar este tiquete? Esta acción
              cambiará su estado a CANCELADO.
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setShowCancelModal(false);
                  setError(null);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Volver
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleCancelar}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
