"use client";
import { createRuta, updateRuta } from "@/actions/routes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import {
  RouteFormData,
  RouteFormInput,
  routeSchema,
  type RouteFormValues,
} from "@/libs/schemas/routeSchema";
import FormActions from "./form-actions";
type RouteFormProps = {
  mode?: "create" | "edit";
  routeId?: number;
  initialData?: RouteFormInput;
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
  } = useForm<RouteFormInput, any, RouteFormData>({
    resolver: zodResolver(routeSchema),

    defaultValues: {
      codigoIATA: initialData?.codigoIATA ?? "",
      nombreAeropuerto: initialData?.nombreAeropuerto ?? "",
      ciudad: initialData?.ciudad ?? "",
      pais: initialData?.pais ?? "",
      region: initialData?.region ?? "",
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

    router.push(`/dashboard/rutas`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información de la ruta
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormInput
            label="Código IATA"
            name="codigoIATA"
            registration={register("codigoIATA")}
            placeholder="Ej. MDE"
            required
            error={errors.codigoIATA?.message}
          />

          <FormInput
            label="Nombre del aeropuerto"
            name="nombreAeropuerto"
            registration={register("nombreAeropuerto")}
            placeholder="Ej. Aeropuerto Internacional José María Córdova"
            required
            error={errors.nombreAeropuerto?.message}
          />

          <FormInput
            label="Ciudad"
            name="ciudad"
            registration={register("ciudad")}
            placeholder="Ej. Bogotá"
            required
            error={errors.ciudad?.message}
          />

          <FormInput
            label="País"
            name="pais"
            registration={register("pais")}
            placeholder="Ej. BOG"
            required
            error={errors.pais?.message}
          />

          <FormInput
            label="Región"
            name="region"
            registration={register("region")}
            placeholder="Ej. América del Sur"
            required
            error={errors.region?.message}
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
