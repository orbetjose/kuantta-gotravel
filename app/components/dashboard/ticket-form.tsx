"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTiquete, updateTiquete } from "@/actions/tiquete";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ticketSchema,
  type TicketFormValues,
  TicketFormInput,
  TicketFormInitialData,
} from "@/libs/schemas/ticketSchema";

import FormInput from "@/app/components/dashboard/form/FormInput";
import FormSelect from "@/app/components/dashboard/form/FormSelect";
import FormComboBox from "@/app/components/dashboard/form/FormComboBox";
import FormDate from "@/app/components/dashboard/form/FormDate";
import FormFile from "@/app/components/dashboard/form/FormFile";
import FormTextarea from "@/app/components/dashboard/form/FormTextArea";
import FormActions from "./form-actions";

type ClienteOption = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
};
type ProveedorOption = {
  id: number;
  razonSocial: string;
  ruc: string;
};
type RutaOption = {
  id: number;
  origen: string;
  codigoOrigen: string;
  destino: string;
  codigoDestino: string;
};

type TicketFormProps = {
  clientes: ClienteOption[];
  proveedores: ProveedorOption[];
  rutas: RutaOption[];
  initialData?: TicketFormInitialData;
  tiqueteId?: number;
  mode?: "create" | "edit";
};

export default function TicketForm({
  clientes,
  proveedores,
  rutas,
  tiqueteId,
  initialData,
  mode = "create",
}: TicketFormProps) {
  const { totalPagar = 0, ...formValues } = initialData ?? {};
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TicketFormInput, unknown, TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: initialData
      ? formValues
      : {
          fechaEmision: "",
          clienteId: "",
          proveedorId: "",
          rutaId: "",
          numeroTiquete: "",
          revision: "NO",
          numeroTiqueteRevision: "",
          clase: "",
          pasajero: "",
          fechaIda: "",
          fechaRegreso: "",
          aph: "NACIONAL",
          tarifaNeta: 0,
          ivaTarifa: 0,
          otrosImpuestos: 0,
          tarifaAdministrativaNeta: 0,
          ivaTarifaAdministrativa: 0,
          feeAgenciaNeta: 0,
          ivaFeeAgencia: 0,
          feePagoTarjeta: 0,

          formaPago: "CASH",
          creditoAgencia: undefined,
          numeroTarjeta: "",
          numeroAprobacion: "",
          tipoCash: undefined,

          ceCos: "",
          proyectoFCDS: "",
          observaciones: "",
          fechaEmisionTiqueteFES: "",
        },
  });

  const clientesOptions = clientes.map((cliente) => ({
    value: String(cliente.id),
    label: `${cliente.nombre} ${cliente.apellido}`,
  }));
  const proveedoresOptions = proveedores.map((proveedor) => ({
    value: String(proveedor.id),
    label: proveedor.razonSocial,
  }));
  const rutasOptions = rutas.map((ruta) => ({
    value: String(ruta.id),
    label: `${ruta.origen} (${ruta.codigoOrigen}) → ${ruta.destino} (${ruta.codigoDestino})`,
  }));

  const revision = watch("revision");
  const formaPago = watch("formaPago");

  const tarifaNeta = watch("tarifaNeta");
  const ivaTarifa = watch("ivaTarifa");
  const otrosImpuestos = watch("otrosImpuestos");
  const tarifaAdministrativaNeta = watch("tarifaAdministrativaNeta");
  const ivaTarifaAdministrativa = watch("ivaTarifaAdministrativa");
  const feeAgenciaNeta = watch("feeAgenciaNeta");
  const ivaFeeAgencia = watch("ivaFeeAgencia");
  const feePagoTarjeta = watch("feePagoTarjeta");

  const totalTiquete =
    Number(tarifaNeta || 0) +
    Number(ivaTarifa || 0) +
    Number(otrosImpuestos || 0) +
    Number(tarifaAdministrativaNeta || 0) +
    Number(ivaTarifaAdministrativa || 0) +
    Number(feeAgenciaNeta || 0) +
    Number(ivaFeeAgencia || 0) +
    Number(feePagoTarjeta || 0);

  const onSubmit = async (data: TicketFormValues) => {
    setIsLoading(true);
    try {
      if (mode === "edit") {
        if (!tiqueteId) {
          throw new Error("No se encontró el ID del tiquete.");
        }

        const updateData = {
          ...data,
          totalPagar,
        };

        const result = await updateTiquete(tiqueteId, updateData);

        if (!result.success) {
          throw new Error("No se pudo actualizar el tiquete.");
        }

        router.push(`/dashboard/servicios/tiquete/${tiqueteId}`);
        router.refresh();

        return;
      }

      const result = await createTiquete(data);

      if (!result.success) {
        throw new Error("No se pudo crear el tiquete.");
      }

      router.push(`/dashboard/servicios/tiquete/${result.tiqueteId}`);
      router.refresh();
    } catch (error) {
      throw new Error("Ocurrió un error inesperado.");
    }
  };

  return (
    <form className="space-y-6 pt-4" onSubmit={handleSubmit(onSubmit)}>
      {/* =====================================================
          INFORMACIÓN GENERAL
      ===================================================== */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información general
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Cliente */}
          <div className="xl:col-span-2">
            <Controller
              name="clienteId"
              control={control}
              render={({ field }) => (
                <FormComboBox
                  label="Cliente"
                  name={field.name}
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  searchEndpoint="/api/clientes/search"
                  required
                  placeholder="Seleccionar cliente"
                  searchPlaceholder="Buscar cliente..."
                  options={clientesOptions}
                  error={errors.clienteId?.message}
                />
              )}
            />
          </div>

          <div className="xl:col-span-2">
            {/* Proveedor */}
            <Controller
              name="proveedorId"
              control={control}
              render={({ field }) => (
                <FormComboBox
                  label="Proveedor"
                  name={field.name}
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  searchEndpoint="/api/proveedores/search"
                  required
                  placeholder="Seleccionar proveedor"
                  searchPlaceholder="Buscar proveedor..."
                  options={proveedoresOptions}
                  error={errors.proveedorId?.message}
                />
              )}
            />
          </div>
          {/* Fecha de emisión */}
          <FormDate
            label="Fecha de emisión"
            name="fechaEmision"
            required
            registration={register("fechaEmision")}
            error={errors.fechaEmision?.message}
          />

          {/* Número de tiquete */}
          <FormInput
            label="Número de tiquete"
            name="numeroTiquete"
            registration={register("numeroTiquete")}
            placeholder="Ingresa el número de tiquete"
            required
            error={errors.numeroTiquete?.message}
          />

          {/* Revisión */}
          <Controller
            name="revision"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Revisión"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "SI", label: "Sí" },
                  { value: "NO", label: "No" },
                ]}
                error={errors.revision?.message}
              />
            )}
          />

          {/* Número de tiquete de revisión */}
          {revision === "SI" && (
            <div className="xl:col-span-2">
              <FormInput
                label="Número de tiquete de revisión"
                name="numeroTiqueteRevision"
                registration={register("numeroTiqueteRevision")}
                placeholder="Ingresa el número de tiquete"
                required
                error={errors.numeroTiqueteRevision?.message}
              />
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          INFORMACIÓN DEL VIAJE
      ===================================================== */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del viaje
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Ruta */}
          <div className="xl:col-span-2">
            <Controller
              name="rutaId"
              control={control}
              render={({ field }) => (
                <FormComboBox
                  label="Ruta"
                  name={field.name}
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  searchEndpoint="/api/rutas/search"
                  required
                  placeholder="Seleccionar ruta"
                  searchPlaceholder="Buscar ruta..."
                  options={rutasOptions}
                  error={errors.rutaId?.message}
                />
              )}
            />
          </div>

          {/* Pasajero */}
          <div className="xl:col-span-2">
            <FormInput
              label="Pasajero"
              name="pasajero"
              registration={register("pasajero")}
              placeholder="Nombre completo del pasajero"
              required
              error={errors.pasajero?.message}
            />
          </div>

          {/* Clase */}
          <FormInput
            label="Clase"
            name="clase"
            registration={register("clase")}
            placeholder="Ej. Económica"
            required
            error={errors.clase?.message}
          />

          {/* Fecha ida */}
          <FormDate
            label="Fecha de ida"
            name="fechaIda"
            required
            registration={register("fechaIda")}
            error={errors.fechaIda?.message}
          />

          {/* Fecha regreso */}
          <FormDate
            label="Fecha de regreso"
            name="fechaRegreso"
            registration={register("fechaRegreso")}
            error={errors.fechaRegreso?.message}
          />

          {/* APH */}
          <Controller
            name="aph"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="APH"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                required
                options={[
                  {
                    value: "NACIONAL",
                    label: "Nacional",
                  },
                  {
                    value: "INTERNACIONAL",
                    label: "Internacional",
                  },
                ]}
                error={errors.aph?.message}
              />
            )}
          />
        </div>
      </section>

      {/* =====================================================
          VALORES DEL TIQUETE
      ===================================================== */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Valores del tiquete
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Tarifa neta */}
          <FormInput
            label="Tarifa neta"
            name="tarifaNeta"
            registration={register("tarifaNeta", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.tarifaNeta?.message}
          />

          {/* IVA tarifa - CALCULADO */}
          <FormInput
            label="IVA tarifa"
            name="ivaTarifa"
            type="number"
            registration={register("ivaTarifa", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
            min={0}
            step={0.01}
          />

          {/* Tasa aeroportuaria */}
          <FormInput
            label="Otros impuestos"
            name="otrosImpuestos"
            registration={register("otrosImpuestos", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.otrosImpuestos?.message}
          />

          {/* Tarifa administrativa */}
          <FormInput
            label="Tarifa administrativa neta"
            name="tarifaAdministrativaNeta"
            registration={register("tarifaAdministrativaNeta", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.tarifaAdministrativaNeta?.message}
          />

          {/* IVA tarifa administrativa - CALCULADO */}
          <FormInput
            label="IVA tarifa administrativa"
            name="ivaTarifaAdministrativa"
            type="number"
            registration={register("ivaTarifaAdministrativa", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
            min={0}
            step={0.01}
          />

          {/* Fee agencia */}
          <FormInput
            label="Fee agencia neta"
            name="feeAgenciaNeta"
            registration={register("feeAgenciaNeta", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.feeAgenciaNeta?.message}
          />

          {/* IVA fee agencia - CALCULADO */}
          <FormInput
            label="IVA fee agencia"
            name="ivaFeeAgencia"
            type="number"
            registration={register("ivaFeeAgencia", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
            min={0}
            step={0.01}
          />

          {/* Fee tarjeta */}
          <FormInput
            label="Fee pago con tarjeta"
            name="feePagoTarjeta"
            registration={register("feePagoTarjeta", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.feePagoTarjeta?.message}
          />
        </div>

        {/* Total */}
        <div className="mt-8 flex justify-end">
          <div className="w-full rounded-lg bg-inputs p-4 md:w-1/2 xl:w-1/4">
            <p className="font-inter text-sm text-fifth-gray/70">
              Total a pagar tiquete
            </p>

            <p className="mt-1 font-inter text-2xl font-semibold text-fifth-gray">
              ${totalTiquete.toLocaleString("es-CO")}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          INFORMACIÓN DEL PAGO
      ===================================================== */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del pago
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Método de pago */}
          <Controller
            name="formaPago"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Pago"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                required
                options={[
                  {
                    value: "CASH",
                    label: "Cash",
                  },
                  {
                    value: "TARJETA_CREDITO",
                    label: "Tarjeta crédito",
                  },
                  {
                    value: "CREDITO_AGENCIA",
                    label: "Crédito agencia",
                  },
                ]}
                error={errors.formaPago?.message}
              />
            )}
          />

          {/* Crédito agencia */}
          {formaPago === "CREDITO_AGENCIA" && (
            <Controller
              name="creditoAgencia"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Crédito agencia"
                  name={field.name}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  required
                  placeholder="Seleccionar plazo"
                  options={[
                    { value: "3", label: "3 días" },
                    { value: "8", label: "8 días" },
                    { value: "15", label: "15 días" },
                    { value: "30", label: "30 días" },
                  ]}
                  error={errors.creditoAgencia?.message}
                />
              )}
            />
          )}

          {/* Número tarjeta */}
          {formaPago === "TARJETA_CREDITO" && (
            <>
              <FormInput
                label="Número de tarjeta"
                name="numeroTarjeta"
                registration={register("numeroTarjeta")}
                placeholder="Número de tarjeta"
                required
                error={errors.numeroTarjeta?.message}
              />

              <FormInput
                label="Número de aprobación"
                name="numeroAprobacion"
                registration={register("numeroAprobacion")}
                placeholder="Número de aprobación"
                required
                error={errors.numeroAprobacion?.message}
              />
            </>
          )}

          {/* Tipo Cash */}
          {formaPago === "CASH" && (
            <Controller
              name="tipoCash"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Tipo de pago"
                  name={field.name}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  required
                  placeholder="Seleccionar"
                  options={[
                    {
                      value: "EFECTIVO",
                      label: "Efectivo",
                    },
                    {
                      value: "TRANSFERENCIA",
                      label: "Transferencia",
                    },
                  ]}
                  error={errors.tipoCash?.message}
                />
              )}
            />
          )}
        </div>
      </section>

      {/* =====================================================
          INFORMACIÓN ADICIONAL
      ===================================================== */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información adicional
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* CeCos */}
          <FormInput
            label="CeCos"
            name="ceCos"
            registration={register("ceCos")}
            error={errors.ceCos?.message}
            placeholder="Ingresa el CeCos"
          />

          {/* Proyecto FCDS */}
          <FormInput
            label="Proyecto FCDS"
            name="proyectoFCDS"
            registration={register("proyectoFCDS")}
            error={errors.proyectoFCDS?.message}
            placeholder="Ingresa el proyecto"
          />

          {/* Fecha emisión FES */}
          <div className="xl:col-span-2">
            <FormDate
              label="Fecha de emisión del tiquete (FES)"
              name="fechaEmisionTiqueteFES"
              required
              registration={register("fechaEmisionTiqueteFES")}
              error={errors.fechaEmisionTiqueteFES?.message}
            />
          </div>
          {/* Factura proveedor */}
          <div className="xl:col-span-2">
            <Controller
              name="facturaProveedor"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Factura proveedor"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  accept=".pdf"
                  error={errors.facturaProveedor?.message}
                />
              )}
            />
          </div>

          {/* Soporte tiquete */}
          <div className="xl:col-span-2">
            <Controller
              name="soporteTiquete"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Soporte tiquete"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  accept=".pdf"
                  error={errors.soporteTiquete?.message}
                />
              )}
            />
          </div>

          {/* Factura Go Travel */}
          <div className="xl:col-span-2">
            <Controller
              name="facturaGoTravel"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Factura Go Travel"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  accept=".pdf"
                  error={errors.facturaGoTravel?.message}
                />
              )}
            />
          </div>

          {/* Observaciones */}
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
        createText="Registrar proveedor"
      />
    </form>
  );
}
