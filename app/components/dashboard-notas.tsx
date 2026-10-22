"use client";

import { useState, useEffect } from "react";
import NotaLecturaModal from "./dashboard/notas/nota-lectura-modal";
import NotaModal from "./dashboard/notas/nota-creacion-modal";
import { formatDate } from "@/libs/helpers";
import { Nota } from "@/types";
import { Plus } from "lucide-react";
import { NotaFormValues } from "@/libs/schemas/notaSchema";
import { crearNota } from "@/actions/notas";

export default function DashboardNotas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [modalAbierta, setModalAbierta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/notas?limit=3`);

        if (!response.ok) {
          throw new Error("Error obteniendo notas");
        }
        const data = await response.json();
        setNotas(data.notas);
      } catch (error) {
        console.error("Error cargando notas:", error);
        setNotas([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative mt-2 font-inter text-sm text-fifth-gray">
      <div className="flex justify-between">
        <span>Últimas notas</span>
        <div className="bg-primary-blue rounded p-0.2">
          <Plus className="w-5 h-5 text-white" onClick={()=> setModalAbierta(true) } />
        </div>
      </div>

      {isLoading ? (
        <p>Cargando notas...</p>
      ) : (
        notas.map((nota) => (
          <div
            key={nota.id}
            className="border border-gray-200 rounded-lg p-2 overflow-hidden mt-2 cursor-pointer"
            onClick={() => setNotaSeleccionada(nota)}
          >
            <div className="flex justify-between pb-1">
              <span className="text-primary-blue font-semibold truncate">
                {nota.titulo}
              </span>
              <span className="text-xs">{formatDate(nota.createdAt)}</span>
            </div>
            <p className="truncate text-sm">{nota.contenido}</p>
          </div>
        ))
      )}
      <NotaLecturaModal
        nota={notaSeleccionada}
        onCerrar={() => setNotaSeleccionada(null)}
      />
      <NotaModal
        abierta={modalAbierta}
        onCerrar={() => setModalAbierta(false)}
        onCrear={handleCrearNota}
      />
    </div>
  );
}
