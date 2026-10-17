"use client";
import { createProveedor, updateProveedor } from "@/actions/providers";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormFile from "@/app/components/dashboard/ui/FormFile";
import FormSelect from "@/app/components/dashboard/ui/FormSelect";
import {
  providerSchema,
  type ProviderFormData,
  ProviderFormInput,
} from "@/libs/schemas/providerSchema";
import FormActions from "./form-actions";

type ProveedorFormProps = {
  mode?: "create" | "edit";
  proveedorId?: number;
  initialData?: ProviderFormInput; 
};

export default function ProviderForm({
  mode = "create",
  proveedorId,
  initialData,
}: ProveedorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProviderFormInput, any, ProviderFormData>({
    resolver: zodResolver(providerSchema),

    defaultValues: {
      razonSocial: initialData?.razonSocial ?? "",
      nombreComercial: initialData?.nombreComercial ?? "",
      nit: initialData?.nit ?? "",
      categoria: initialData?.categoria ?? "HOTEL_CADENA",
      ciudad: initialData?.ciudad ?? "",
      direccion: initialData?.direccion ?? "",
      telefono: initialData?.telefono ?? "",
      correoComercial: initialData?.correoComercial ?? "",
      correoFacturacion: initialData?.correoFacturacion ?? "",
      contacto: initialData?.contacto ?? "",
      remuneracion: initialData?.remuneracion ?? "COMISION",
      monedaBase: initialData?.monedaBase ?? "COP",
      condicionPago: initialData?.condicionPago ?? "INMEDIATO",
      documentosPdf: initialData?.documentosPdf ?? [],
    },
  });

  async function onSubmit(data: ProviderFormData) {
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <FormInput
            label="NIT"
            name="nit"
            registration={register("nit")}
            placeholder="Ingresa el NIT"
            required
            error={errors.nit?.message}
          />
          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Categoría"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "HOTEL_CADENA", label: "Hotel/Cadena" },
                  { value: "ASISTENCIA_MEDICA", label: "Asistencia médica" },
                  { value: "TECNOLOGIA_GDS", label: "Tecnología / GDS" },
                  { value: "CONSOLIDADOR", label: "Consolidador" },
                  { value: "MAYORISTA", label: "Mayorista" },
                  { value: "AEROLINEA", label: "Aerolínea" },
                  { value: "HOTEL_PLATAFORMA", label: "Hotel / Plataforma" },
                  {
                    value: "TRANSPORTE_TERRESTRE",
                    label: "Transporte terrestre",
                  },
                ]}
                error={errors.categoria?.message}
              />
            )}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Razón social"
              name="razonSocial"
              registration={register("razonSocial")}
              placeholder="Ingresa la razón social"
              required
              error={errors.razonSocial?.message}
            />
          </div>
          <div className="md:col-span-2">
            <FormInput
              label="Nombre comercial"
              name="nombreComercial"
              registration={register("nombreComercial")}
              placeholder="Ingresa el nombre comercial"
              error={errors.nombreComercial?.message}
            />
          </div>

          <FormInput
            label="Ciudad"
            name="ciudad"
            registration={register("ciudad")}
            placeholder="Ingresa la ciudad"
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
          <div className="md:col-span-2">
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
            label="Correo comercial"
            name="correoComercial"
            registration={register("correoComercial")}
            placeholder="correo@ejemplo.com"
            error={errors.correoComercial?.message}
          />

          <FormInput
            label="Correo para facturas"
            name="correoFacturacion"
            registration={register("correoFacturacion")}
            placeholder="facturacion@ejemplo.com"
            error={errors.correoFacturacion?.message}
          />

          <FormInput
            label="Contacto"
            name="contacto"
            registration={register("contacto")}
            placeholder="Nombre de la persona de contacto"
            error={errors.contacto?.message}
          />

          <Controller
            name="remuneracion"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Remuneración"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "COMISION", label: "Comisión" },
                  { value: "NETO_MARKUP", label: "Neto (Mark-up)" },
                ]}
                error={errors.remuneracion?.message}
              />
            )}
          />

          <Controller
            name="monedaBase"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Moneda base"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "COP", label: "COP" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                ]}
                error={errors.monedaBase?.message}
              />
            )}
          />

          <Controller
            name="condicionPago"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Condición de pago"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "INMEDIATO", label: "Inmediato" },
                  { value: "CREDITO", label: "Crédito" },
                ]}
                error={errors.condicionPago?.message}
              />
            )}
          />

          <div className="md:col-span-2">
            <Controller
              name="documentosPdf"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Documentos PDF"
                  name={field.name}
                  value={archivosNuevos}
                  onChange={(value) => {
                    setArchivosNuevos(
                      Array.isArray(value) ? value : value ? [value] : [],
                    );
                  }}
                  accept=".pdf,application/pdf"
                  multiple
                  maxFiles={4}
                  error={errors.documentosPdf?.message}
                />
              )}
            />
          </div>
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
