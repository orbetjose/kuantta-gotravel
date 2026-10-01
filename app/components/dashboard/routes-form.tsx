"use client";
import { createRuta, updateRuta } from "@/actions/routes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/form/FormInput";
import { routeSchema, type RouteFormValues } from "@/libs/schemas/routeSchema";
import FormActions from "./form-actions";

type RouteFormProps = {
  mode?: "create" | "edit";
  routeId?: number;
  initialData?: {
    origen: string;
    destino: string;
    codigoOrigen: string;
    codigoDestino: string;
  };
};

export default function RouteForm({
  mode = "create",
  routeId,
  initialData,
}: RouteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),

    defaultValues: {
      origen: initialData?.origen ?? "",
      codigoOrigen: initialData?.codigoOrigen ?? "",
      destino: initialData?.destino ?? "",
      codigoDestino: initialData?.codigoDestino ?? "",
    },
  });

  async function onSubmit(data: RouteFormValues) {
    setIsLoading(true);
    if (mode === "edit" && routeId) {
      const result = await updateRuta(routeId, data);

      if (!result.success) {
        console.error(result.error);
        return;
      }

      router.push(`/dashboard/administracion/rutas`);
      router.refresh();
      return;
    }

    const result = await createRuta(data);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    router.push(`/dashboard/administracion/rutas`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información de la ruta
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Origen"
            name="origen"
            registration={register("origen")}
            placeholder="Ej. Medellín"
            required
            error={errors.origen?.message}
          />

          <FormInput
            label="Código de origen"
            name="codigoOrigen"
            registration={register("codigoOrigen")}
            placeholder="Ej. MDE"
            required
            error={errors.codigoOrigen?.message}
          />

          <FormInput
            label="Destino"
            name="destino"
            registration={register("destino")}
            placeholder="Ej. Bogotá"
            required
            error={errors.destino?.message}
          />

          <FormInput
            label="Código de destino"
            name="codigoDestino"
            registration={register("codigoDestino")}
            placeholder="Ej. BOG"
            required
            error={errors.codigoDestino?.message}
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
