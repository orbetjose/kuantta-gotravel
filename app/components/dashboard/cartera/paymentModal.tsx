"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrarPagoCliente } from "@/actions/servicios";
import { formatCurrency } from "@/libs/helpers";

import {
  paymentSchema,
  type PaymentFormData,
} from "@/libs/schemas/pagoServicesSchema";

interface ServicioCartera {
  id: number;
  tipo: string;
  total: number;
  cliente: {
    id: string;
    nombre: string;
  };
  fechaEmision: string;
  estadoCredito: string;
  fechaVencimiento: string;
  dias: string;
  creditoAgencia: number;
  pagadoCliente: boolean;
  createdAt: string;
  idTiquete: number;
  estado: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  servicio: ServicioCartera | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  servicio,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];

      reset({
        fechaPagoCliente: today,
      });
    }
  }, [isOpen, reset]);

  if (!isOpen || !servicio) {
    return null;
  }

  const handlePayment = async (data: PaymentFormData) => {
    try {
      const result = await registrarPagoCliente(
        servicio.id,
        new Date(data.fechaPagoCliente),
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };



  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("es-CO").format(new Date(date));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 font-inter">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl ">Registrar pago</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-fifth-gray hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-sm font-bold text-fifth-gray">Cliente</p>
            <p className="font-medium">{servicio.cliente.nombre}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-fifth-gray">Servicio</p>
              <p className="font-medium">{servicio.tipo.replace("_"," ")}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-fifth-gray">Valor</p>
              <p className="font-medium">{formatCurrency(servicio.total)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-fifth-gray">Fecha de emisión</p>
              <p className="font-medium">{formatDate(servicio.fechaEmision)}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-fifth-gray">Fecha de vencimiento</p>
              <p className="font-medium">
                {formatDate(servicio.fechaVencimiento)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handlePayment)}>
          <div className="mb-6">
            <label
              htmlFor="fechaPagoCliente"
              className="mb-2 block text-sm font-bold"
            >
              Fecha de pago
            </label>

            <input
              id="fechaPagoCliente"
              type="date"
              {...register("fechaPagoCliente")}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />

            {errors.fechaPagoCliente && (
              <p className="mt-1 text-sm font-bold text-red-500">
                {errors.fechaPagoCliente.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 bg-primary-blue text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Registrando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
