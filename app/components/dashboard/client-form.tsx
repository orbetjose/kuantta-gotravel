"use client";

import { createCliente, updateCliente } from "@/actions/clients";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/form/FormInput";
import {
  clientSchema,
  type ClientFormValues,
} from "@/libs/schemas/clientSchema";
import FormActions from "./form-actions";

type ClienteFormProps = {
  mode?: "create" | "edit";
  clienteId?: number;
  initialData?: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
  };
};

export default function ClientForm({
  mode = "create",
  clienteId,
  initialData,
}: ClienteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),

    defaultValues: {
      nombre: initialData?.nombre ?? "",
      apellido: initialData?.apellido ?? "",
      correo: initialData?.correo ?? "",
      telefono: initialData?.telefono ?? "",
    },
  });

  async function onSubmit(data: ClientFormValues) {
    setIsLoading(true);
    if (mode === "edit" && clienteId) {
      const result = await updateCliente(clienteId, data);

      if (!result.success) {
        console.error(result.error);
        return;
      }

      router.push(`/dashboard/clientes/${clienteId}`);
      router.refresh();
      return;
    }

    const result = await createCliente(data);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    router.push(`/dashboard/clientes/`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del cliente
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Nombre"
            name="nombre"
            registration={register("nombre")}
            placeholder="Ingresa el nombre"
            required
            error={errors.nombre?.message}
          />

          <FormInput
            label="Apellido"
            name="apellido"
            registration={register("apellido")}
            placeholder="Ingresa el apellido"
            required
            error={errors.apellido?.message}
          />

          <FormInput
            label="Correo"
            name="correo"
            type="text"
            registration={register("correo")}
            placeholder="correo@ejemplo.com"
            required
            error={errors.correo?.message}
          />

          <FormInput
            label="Teléfono"
            name="telefono"
            registration={register("telefono")}
            placeholder="Ingresa el teléfono"
            required
            error={errors.telefono?.message}
          />
        </div>
      </section>

      <FormActions
        isLoading={isLoading}
        mode={mode}
        createText="Registrar proveedor"
      />
    </form>
  );
}
