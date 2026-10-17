"use client";

import { createCliente, updateCliente } from "@/actions/clients";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormSelect from "@/app/components/dashboard/ui/FormSelect";
import FormTextarea from "@/app/components/dashboard/ui/FormTextArea";
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
    razonSocial?: string;
    tipoDocumento: "NIT" | "CEDULA" | "PASAPORTE";
    documento: string;
    direccion: string;
    ciudad: string;
    tipoPersona: "NATURAL" | "JURIDICA";
    correo: string;
    telefono: string;
    observaciones?: string;
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
    control,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),

    defaultValues: {
      nombre: initialData?.nombre ?? "",
      razonSocial: initialData?.razonSocial ?? "",
      tipoDocumento: initialData?.tipoDocumento ?? "CEDULA",
      documento: initialData?.documento ?? "",
      direccion: initialData?.direccion ?? "",
      ciudad: initialData?.ciudad ?? "",
      tipoPersona: initialData?.tipoPersona ?? "NATURAL",
      observaciones: initialData?.observaciones ?? "",
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

  const tipoPersona = watch("tipoPersona");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-4"
    >
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del cliente
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Controller
            name="tipoPersona"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Tipo de persona"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "NATURAL", label: "NATURAL" },
                  { value: "JURIDICA", label: "JURIDICA" },
                ]}
                error={errors.tipoPersona?.message}
              />
            )}
          />
          <Controller
            name="tipoDocumento"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Tipo de documento"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                required
                options={[
                  { value: "CEDULA", label: "CEDULA" },
                  { value: "NIT", label: "NIT" },
                  { value: "PASAPORTE", label: "PASAPORTE" },
                ]}
                error={errors.tipoDocumento?.message}
              />
            )}
          />
          <div className="flex-1">
            <FormInput
              label="Documento"
              name="documento"
              registration={register("documento")}
              placeholder="Ingresa el documento"
              required
              error={errors.documento?.message}
            />
          </div>

          {tipoPersona === "JURIDICA" && (
            <div className="xl:col-span-2 ">
              <FormInput
                label="Razón Social"
                name="razonSocial"
                registration={register("razonSocial")}
                placeholder="Ingresa la Razón Social"
                error={errors.razonSocial?.message}
              />
            </div>
          )}
          <div className="md:col-span-2">
            <FormInput
              label="Nombre"
              name="nombre"
              registration={register("nombre")}
              placeholder="Ingresa el nombre"
              required
              error={errors.nombre?.message}
            />
          </div>
          <div className="md:col-span-2">
            <FormInput
              label="Correo"
              name="correo"
              type="text"
              registration={register("correo")}
              placeholder="correo@ejemplo.com"
              required
              error={errors.correo?.message}
            />
          </div>
          <div className="xl:col-span-2">
            <FormInput
              label="Dirección"
              name="direccion"
              registration={register("direccion")}
              placeholder="Ingresa la dirección"
              required
              error={errors.direccion?.message}
            />
          </div>
          <FormInput
            label="Ciudad"
            name="ciudad"
            registration={register("ciudad")}
            placeholder="Ingresa la Ciudad"
            required
            error={errors.ciudad?.message}
          />

          <FormInput
            label="Teléfono"
            name="telefono"
            registration={register("telefono")}
            placeholder="Ingresa el teléfono"
            required
            error={errors.telefono?.message}
          />

          <div className="xl:col-span-4">
            <FormTextarea
              label="Observaciones"
              name="observaciones"
              registration={register("observaciones")}
              placeholder="Ingresa las observaciones..."
              maxLength={240}
              rows={5}
              error={errors.observaciones?.message}
            />
          </div>
        </div>
      </section>

      <FormActions
        isLoading={isLoading}
        mode={mode}
        createText="Registrar cliente"
      />
    </form>
  );
}
