"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import FormInput from "@/app/components/dashboard/form/FormInput";
import FormSelect from "@/app/components/dashboard/form/FormSelect";
import FormComboBox from "@/app/components/dashboard/form/FormComboBox";
import FormDate from "@/app/components/dashboard/form/FormDate";
import FormFile from "@/app/components/dashboard/form/FormFile";
import FormTextarea from "@/app/components/dashboard/form/FormTextArea";
import FormActions from "./form-actions";

import {
  serviceSchema,
  type ServiceFormValues,
  ServiceFormInput,
  ServiceFormInitialData,
} from "@/libs/schemas/serviceSchema";
import { createServicio, updateServicio } from "@/actions/detalles-servicios";

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

type ServiceFormProps = {
  clientes: ClienteOption[];
  proveedores: ProveedorOption[];
  initialData?: ServiceFormInitialData;
  detalleServicioId?: number;
  mode?: "create" | "edit";
};

export default function ServiceForm({
  clientes,
  proveedores,
  initialData,
  detalleServicioId,
  mode = "create",
}: ServiceFormProps) {
  const { totalIngreso = 0, ...formValues } = initialData ?? {};
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceFormInput, unknown, ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData
      ? formValues
      : {
          fechaEmision: "",
          clienteId: "",
          proveedorId: "",
          pasajero: "",

          formaPago: "CASH",
          creditoAgencia: undefined,
          numeroTarjeta: "",
          numeroAprobacion: "",
          tipoCash: undefined,

          ceCos: "",
          proyectoFCDS: "",
          observaciones: "",
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
  const formaPago = watch("formaPago");

  const valorPagadoProveedor = watch("valorPagadoProveedor");
  const trm = watch("trm");
  const feePagoTarjeta = watch("feePagoTarjetaCredito");

  const valorPagadoGoTravel =
    Number(valorPagadoProveedor || 0) +
    Number(trm || 0) +
    Number(feePagoTarjeta || 0);

  const total =
    Number(valorPagadoGoTravel || 0) - Number(valorPagadoProveedor || 0);

  const pagadoProveedor = watch("pagadoProveedor");

  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true);
    try {
      if (mode === "edit") {
        if (!detalleServicioId) {
          throw new Error("No se encontró el ID del tiquete.");
        }

        const updateData = {
          ...data,
          totalIngreso,
        };

        const result = await updateServicio(detalleServicioId, updateData);

        if (!result.success) {
          throw new Error("No se pudo actualizar el tiquete.");
        }

        router.push(
          `/dashboard/servicios/${result.tipo?.replace("_", "-").toLowerCase()}/${result.servicioId}`,
        );
        router.refresh();

        return;
      }

      const result = await createServicio(data);

      if (!result.success) {
        throw new Error("No se pudo crear el tiquete.");
      }

      router.push(
        `/dashboard/servicios/${result.tipo?.replace("_", "-").toLowerCase()}/${result.servicioId}`,
      );
      router.refresh();
    } catch (error) {
      throw new Error("Ocurrió un error inesperado.");
    }
  };

  return (
    <form className="space-y-6 pt-4" onSubmit={handleSubmit(onSubmit)}>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información general
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Tipo de servicio */}
          <div className="xl:col-span-2">
            <Controller
              name="tipoServicio"
              control={control}
              render={({ field }) => (
                <FormSelect
                  label="Tipo de Servicio"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  required
                  options={[
                    { value: "HOTEL", label: "Hotel" },
                    { value: "ALQUILER_AUTO", label: "Alquiler de auto" },
                    { value: "SALON", label: "Salón" },
                    { value: "EVENTO", label: "Evento" },
                    { value: "SILLA", label: "Silla" },
                    {
                      value: "TARJETA_ASISTENCIA",
                      label: "Tarjeta de asistencia",
                    },
                    { value: "TRASLADO", label: "Traslado" },
                    { value: "VISA", label: "Visa" },
                    { value: "WEB_CHECK_IN", label: "Web check-in" },
                    { value: "PLAN_VACACIONAL", label: "Plan vacacional" },
                  ]}
                  error={errors.tipoServicio?.message}
                />
              )}
            />
          </div>
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

          {/* Fecha de emisión */}
          <div className="xl:col-span-2">
            <FormDate
              label="Fecha de emisión"
              name="fechaEmision"
              required
              registration={register("fechaEmision")}
              error={errors.fechaEmision?.message}
            />
          </div>
        </div>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del servicio
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
          {/* Codigo reserva */}
          <FormInput
            label="Código de reserva"
            name="codigoReserva"
            registration={register("codigoReserva")}
            placeholder="Ej. FE0102"
            required
            error={errors.codigoReserva?.message}
          />
          {/* Descripción del servicio */}
          <div className="xl:col-span-4">
            <FormTextarea
              label="Descripción del servicio"
              name="descripcionServicio"
              registration={register("descripcionServicio")}
              placeholder="Ingresa la descripción del servicio..."
              maxLength={240}
              rows={5}
              required
              error={errors.descripcionServicio?.message}
            />
          </div>
        </div>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del pago
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Valor pagado al proveedor */}
          <FormInput
            label="Valor pagado al proveedor"
            name="valorPagadoProveedor"
            registration={register("valorPagadoProveedor", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.valorPagadoProveedor?.message}
          />
          {/* TRM */}
          <FormInput
            label="TRM"
            name="trm"
            registration={register("trm", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.trm?.message}
          />
          {/* Fee pago con tarjeta */}
          <FormInput
            label="Fee pago con tarjeta"
            name="feePagoTarjetaCredito"
            registration={register("feePagoTarjetaCredito", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.feePagoTarjetaCredito?.message}
          />
          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Total pagado a Go Travel
            </p>
            <div className="w-full rounded-lg bg-inputs px-4 py-1">
              <p className="mt-1 font-inter text-2xl font-semibold text-fifth-gray ">
                ${valorPagadoGoTravel.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* Método de pago */}
          <Controller
            name="formaPago"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Forma de pago"
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
          {/* Total */}
          <div className="mt-2 flex justify-end md:col-span-4">
            <div className="w-full rounded-lg bg-inputs p-4 md:w-1/3">
              <p className="font-inter text-sm text-fifth-gray/70">
                Total ingreso
              </p>

              <p className="mt-1 font-inter text-2xl font-semibold text-fifth-gray">
                ${total.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      </section>
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
          {/* Fecha de pago cliente */}
          <FormDate
            label="Fecha de pago cliente"
            name="fechaPagoCliente"            
            registration={register("fechaPagoCliente")}
            error={errors.fechaPagoCliente?.message}
          />
        </div>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información proveedor
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Proveedor */}
          <div className="xl:col-span-2">
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
          {/* Pagado al proveedor */}
          <Controller
            name="pagadoProveedor"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Pagado al proveedor"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                required
                options={[
                  {
                    value: "SI",
                    label: "Si",
                  },
                  {
                    value: "NO",
                    label: "No",
                  },
                  {
                    value: "NO_APLICA",
                    label: "No aplica",
                  },
                ]}
                error={errors.pagadoProveedor?.message}
              />
            )}
          />
          {/* Fecha de pago prvoeedor */}
          {pagadoProveedor === "SI" && (
            <FormDate
              label="Fecha de pago proveedor"
              name="fechaPagoProveedor"
              registration={register("fechaPagoProveedor")}
              error={errors.fechaPagoProveedor?.message}
            />
          )}

          <div className="">
            {/* Fecha emisión FES */}
            <FormDate
              label="Vencimiento factura proveedor"
              name="vencimientoFacturaProveedor"
              registration={register("vencimientoFacturaProveedor")}
              error={errors.vencimientoFacturaProveedor?.message}
            />
          </div>
        </div>
      </section>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Documentos relacionados
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
