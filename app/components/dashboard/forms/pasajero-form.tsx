"use client";

import { createPasajero, updatePasajero } from "@/actions/pasajeros";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormDate from "@/app/components/dashboard/ui/FormDate";
import FormSelect from "@/app/components/dashboard/ui/FormSelect";
import {
  PasajeroFormData,
  PasajeroFormInput,
  pasajeroSchema,
} from "@/libs/schemas/pasajeroSchema";
import FormActions from "./form-actions";

type PasajeroFormProps = {
  mode?: "create" | "edit";
  pasajeroId?: number;
  initialData?: PasajeroFormInput;
};

export default function PasajeroForm({
  mode = "create",
  pasajeroId,
  initialData,
}: PasajeroFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PasajeroFormInput, any, PasajeroFormData>({
    resolver: zodResolver(pasajeroSchema),

    defaultValues: {
      nombre: initialData?.nombre ?? "",
      apellido: initialData?.apellido ?? "",
      correo: initialData?.correo ?? "",
      telefono: initialData?.telefono ?? "",
      documento: initialData?.documento ?? "",
      fechaNacimiento: initialData?.fechaNacimiento ?? undefined,
      preferenciaSilla: initialData?.preferenciaSilla ?? "VENTANA",
    },
  });

  async function onSubmit(data: PasajeroFormData) {
    setIsLoading(true);
    if (mode === "edit" && pasajeroId) {
      const result = await updatePasajero(pasajeroId, data);

      if (!result.success) {
        console.error(result.error);
        return;
      }

      router.push(`/dashboard/pasajeros/${pasajeroId}`);
      router.refresh();
      return;
    }

    const result = await createPasajero(data);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    router.push(`/dashboard/pasajeros/`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del pasajero
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <FormInput
            label="Documento"
            name="documento"
            registration={register("documento")}
            placeholder="Ingresa el documento"
            required
            error={errors.documento?.message}
          />
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

          <FormDate
            label="Fecha de nacimiento"
            name="fechaNacimiento"
            required
            registration={register("fechaNacimiento")}
            error={errors.fechaNacimiento?.message}
          />
          <Controller
            name="preferenciaSilla"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Silla de preferencia"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "VENTANA", label: "Ventana" },
                  { value: "PASILLO", label: "Pasillo" },
                ]}
                error={errors.preferenciaSilla?.message}
              />
            )}
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
        createText="Registrar cliente"
      />
    </form>
  );
}
