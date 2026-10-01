"use client";
import { createProveedor, updateProveedor } from "@/actions/providers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/form/FormInput";
import {
  providerSchema,
  type ProviderFormValues,
} from "@/libs/schemas/providerSchema";
import FormActions from "./form-actions";

type ProveedorFormProps = {
  mode?: "create" | "edit";
  proveedorId?: number;
  initialData?: {
    razonSocial: string;
    ruc: string;
    direccionFiscal: string;
    correo: string;
    telefono: string;
  };
};

export default function ProviderForm({
  mode = "create",
  proveedorId,
  initialData,
}: ProveedorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),

    defaultValues: {
      razonSocial: initialData?.razonSocial ?? "",
      ruc: initialData?.ruc ?? "",
      direccionFiscal: initialData?.direccionFiscal ?? "",
      telefono: initialData?.telefono ?? "",
      correo: initialData?.correo ?? "",
    },
  });

  async function onSubmit(data: ProviderFormValues) {
    setIsLoading(true);
    if (mode === "edit" && proveedorId) {
      const result = await updateProveedor(proveedorId, data);

      if (!result.success) {
        console.error(result.error);
        return;
      }

      router.push(`/dashboard/proveedores/${proveedorId}`);
      router.refresh();
      return;
    }

    const result = await createProveedor(data);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    router.push(`/dashboard/proveedores/`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del proveedor
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Razón social"
            name="razonSocial"
            registration={register("razonSocial")}
            placeholder="Ingresa la razón social"
            required
            error={errors.razonSocial?.message}
          />

          <FormInput
            label="RUC"
            name="ruc"
            registration={register("ruc")}
            placeholder="Ingresa el RUC"
            required
            error={errors.ruc?.message}
          />

          <FormInput
            label="Dirección Fiscal"
            name="direccionFiscal"
            registration={register("direccionFiscal")}
            placeholder="Ingresa la dirección fiscal"
            required
            error={errors.direccionFiscal?.message}
          />

          <FormInput
            label="Teléfono"
            name="telefono"
            registration={register("telefono")}
            placeholder="Ingresa el teléfono"
            required
            error={errors.telefono?.message}
          />

          <FormInput
            label="Correo"
            name="correo"
            registration={register("correo")}
            placeholder="correo@ejemplo.com"
            required
            error={errors.correo?.message}
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
