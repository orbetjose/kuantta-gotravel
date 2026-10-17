"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormSelect from "@/app/components/dashboard/ui/FormSelect";
import FormComboBox from "@/app/components/dashboard/ui/FormComboBox";
import FormDate from "@/app/components/dashboard/ui/FormDate";
import FormFile from "@/app/components/dashboard/ui/FormFile";
import FormTextarea from "@/app/components/dashboard/ui/FormTextArea";
import FormActions from "./form-actions";
import {
  serviceSchema,
  type ServiceFormValues,
  ServiceFormInput,
  ServiceFormInitialData,
} from "@/libs/schemas/serviceSchema";
import { createServicio, updateServicio } from "@/actions/detalles-servicios";
import { useSelectedEntity } from "@/libs/use-selected-entity";
import { ClienteOption, PasajeroOption, ProveedorOption } from "@/types";
import {
  getClientesOptions,
  getPasajerosOptions,
  getProveedoresOptions,
} from "@/libs/form-options";

type ServiceFormProps = {
  clientes: ClienteOption[];
  pasajeros: PasajeroOption[];
  proveedores: ProveedorOption[];
  initialData?: ServiceFormInitialData;
  detalleServicioId?: number;
  mode?: "create" | "edit";
};

export default function ServiceForm({
  clientes,
  proveedores,
  pasajeros,
  initialData,
  detalleServicioId,
  mode = "create",
}: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const defaultValues: ServiceFormInput = initialData
    ? {
        ...initialData,
        proveedorId: initialData.proveedorId ?? "",
      }
    : {
        // Relaciones
        clienteId: "",
        proveedorId: "",
        pasajeroId: "",
        estado: "BORRADOR",

        // Datos generales
        tipo: "HOTEL",
        fechaEmision: "",
        fechaSolicitud: "",

        // Forma de pago
        formaPago: "CASH",
        tipoCash: undefined,
        creditoAgencia: undefined,
        numeroTarjeta: "",
        numeroAprobacion: "",

        // Información administrativa
        ceCos: "",
        proyectoFCDS: "",
        vencimientoFacturaProveedor: "",
        pagadoProveedor: "NO",
        fechaPagoProveedor: "",
        fechaPagoCliente: "",
        pagadoCliente: false,

        // Observaciones
        observaciones: "",

        // Detalle del servicio
        descripcionServicio: "",
        codigoReserva: "",
        ciudad: "",
        pais: "",
        fechaIngreso: "",
        fechaSalida: "",

        // Valores financieros
        tarifaNeta: 0,
        ivaTarifa: 0,
        feePagoTarjetaCredito: 0,
        totalVentaAgencia: 0,
        tarifaNetaProveedor: 0,
        ivaTarifaProveedor: 0,
        comisionAgencia: 0,
        totalPagado: 0,
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  const clientesOptions = getClientesOptions(clientes);
  const pasajerosOptions = getPasajerosOptions(pasajeros);
  const proveedoresOptions = getProveedoresOptions(proveedores);

  const clienteId = useWatch({
    control,
    name: "clienteId",
  });

  const proveedorId = useWatch({
    control,
    name: "proveedorId",
  });

  const pasajeroId = useWatch({
    control,
    name: "pasajeroId",
  });

  const clienteSeleccionado = useSelectedEntity(
    clienteId,
    clientes,
    "/api/clientes/search",
    "cliente",
  );

  const proveedorSeleccionado = useSelectedEntity(
    proveedorId,
    proveedores,
    "/api/proveedores/search",
    "proveedor",
  );

  const pasajeroSeleccionado = useSelectedEntity(
    pasajeroId,
    pasajeros,
    "/api/pasajeros/search",
    "pasajero",
  );

  const formaPago = watch("formaPago");
  const tipo = watch("tipo");
  const tipoCash = watch("tipoCash");

  const tarifaNeta = watch("tarifaNeta");
  const ivaTarifa = Number(tarifaNeta) * 0.19;
  const feePagoTarjeta = watch("feePagoTarjetaCredito");

  const pagadoProveedor = watch("pagadoProveedor");
  const tarifaNetaProveedor = watch("tarifaNetaProveedor");
  const ivaTarifaProveedor = Number(tarifaNetaProveedor) * 0.19;
  const comisionAgencia = watch("comisionAgencia");

  const totalVentaAgencia =
    Number(tarifaNeta || 0) +
    Number(ivaTarifa || 0) +
    Number(feePagoTarjeta || 0);

  const totalPagado =
    Number(tarifaNetaProveedor || 0) +
    Number(ivaTarifaProveedor || 0) +
    Number(comisionAgencia || 0);

  const totalIngreso =
    Number(totalVentaAgencia || 0) - Number(totalPagado || 0);

  const mostrarDatosTarjeta =
    formaPago === "TARJETA_CREDITO" || formaPago === "OTROS";

  const mostrarTipoCash = formaPago === "CASH" || formaPago === "OTROS";

  const mostrarComprobante =
    (formaPago === "CASH" && tipoCash === "TRANSFERENCIA") ||
    (formaPago === "OTROS" && tipoCash === "TRANSFERENCIA");

  const onSubmit = async (
    data: ServiceFormValues,
    event?: React.BaseSyntheticEvent,
  ) => {
    setIsLoading(true);

    try {
      const submitter = (event?.nativeEvent as SubmitEvent | undefined)
        ?.submitter as HTMLButtonElement | null;

      const accion = submitter?.value;

      const estado =
        accion === "POR_FACTURAR"
          ? "POR_FACTURAR"
          : accion === "BORRADOR"
            ? "BORRADOR"
            : undefined;
            
      if (mode === "edit") {
        if (!detalleServicioId) {
          throw new Error("No se encontró el ID del tiquete.");
        }

        const updateData: ServiceFormValues = {
          ...data,
          ...(estado !== undefined && { estado }),
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

      const createData: ServiceFormValues = {
        ...data,
        estado: estado ?? "BORRADOR",
      };

      const result = await createServicio(createData);

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
          Información general del cliente
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 xl:grid-cols-5">
          {/* Cliente */}
          <div className="xl:col-span-3">
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
          {clienteSeleccionado && (
            <>
              <div className="xl:col-span-2">
                <FormInput
                  label="Razón social"
                  name="clienteRazonSocial"
                  value={clienteSeleccionado.razonSocial || "No registrado"}
                  readOnly
                />
              </div>
              <div className="xl:col-span-2">
                <FormInput
                  label="Documento"
                  name="clienteDocumento"
                  value={`${clienteSeleccionado.tipoDocumento ?? ""} ${clienteSeleccionado.documento ?? ""}`.trim()}
                  readOnly
                />
              </div>
              <div className="xl:col-span-2">
                <FormInput
                  label="Correo electrónico"
                  name="clienteCorreo"
                  value={clienteSeleccionado.correo || "No registrado"}
                  readOnly
                />
              </div>
              <FormInput
                label="Teléfono"
                name="clienteTelefono"
                value={clienteSeleccionado.telefono || "No registrado"}
                readOnly
              />
            </>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información general del proveedor
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-3">
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

          {proveedorSeleccionado && (
            <>
              <div className="xl:col-span-2">
                <FormInput
                  label="Nombre comercial"
                  name="proveedorNombreComercial"
                  value={
                    proveedorSeleccionado.nombreComercial ?? "No registrado"
                  }
                  readOnly
                />
              </div>

              <FormInput
                label="NIT"
                name="proveedorDocumento"
                value={proveedorSeleccionado.nit}
                readOnly
              />
              <div className="xl:col-span-2">
                <FormInput
                  label="Correo comercial"
                  name="proveedorCorreo"
                  value={
                    proveedorSeleccionado.correoComercial || "No registrado"
                  }
                  readOnly
                />
              </div>
              <FormInput
                label="Teléfono"
                name="proveedorTelefono"
                value={proveedorSeleccionado.telefono || "No registrado"}
                readOnly
              />
            </>
          )}

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
          Información general del pasajero
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
          {/* Pasajero */}
          <div className="xl:col-span-3">
            <Controller
              name="pasajeroId"
              control={control}
              render={({ field }) => (
                <FormComboBox
                  label="Pasajero"
                  name={field.name}
                  value={String(field.value ?? "")}
                  onChange={field.onChange}
                  searchEndpoint="/api/pasajeros/search"
                  required
                  placeholder="Seleccionar pasajero"
                  searchPlaceholder="Buscar pasajero..."
                  options={pasajerosOptions}
                  error={errors.pasajeroId?.message}
                />
              )}
            />
          </div>

          {pasajeroSeleccionado && (
            <>
              <FormInput
                label="Documento de pasajero"
                name="documento"
                value={pasajeroSeleccionado.documento}
                readOnly
              />
              <FormInput
                label="Teléfono"
                name="proveedorTelefono"
                value={pasajeroSeleccionado.telefono || "No registrado"}
                readOnly
              />
              <div className="xl:col-span-2">
                <FormInput
                  label="Correo de pasajero"
                  name="correoPasajero"
                  value={pasajeroSeleccionado.correo || "No registrado"}
                  readOnly
                />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del servicio
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Tipo de servicio */}
          <div className="md:col-span-2">
            <Controller
              name="tipo"
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
                  error={errors.tipo?.message}
                />
              )}
            />
          </div>
          {/* Fecha de ingreso y salida */}
          {tipo === "HOTEL" && (
            <>
              <FormDate
                label="Fecha de ingreso"
                name="fechaIngreso"
                required
                registration={register("fechaIngreso")}
                error={errors.fechaIngreso?.message}
              />

              <FormDate
                label="Fecha de salida"
                name="fechaSalida"
                required
                registration={register("fechaSalida")}
                error={errors.fechaSalida?.message}
              />
            </>
          )}

          {/* Fecha de solicitud */}
          <FormDate
            label="Fecha de solicitud"
            name="fechaSolicitud"
            required
            registration={register("fechaSolicitud")}
            error={errors.fechaSolicitud?.message}
          />
          {/* Fecha de emisión */}
          <FormDate
            label="Fecha de emisión"
            name="fechaEmision"
            required
            registration={register("fechaEmision")}
            error={errors.fechaEmision?.message}
          />

          {/* Codigo reserva */}
          <FormInput
            label="Código de reserva"
            name="codigoReserva"
            registration={register("codigoReserva")}
            placeholder="Ej. FE0102"
            required
            error={errors.codigoReserva?.message}
          />
          {/* Ciudad */}
          <FormInput
            label="Ciudad"
            name="ciudad"
            registration={register("ciudad")}
            placeholder="Ej. Medellin"
            required
            error={errors.ciudad?.message}
          />
          {/* Pais */}
          <FormInput
            label="País"
            name="pais"
            registration={register("pais")}
            placeholder="Ej. España"
            required
            error={errors.pais?.message}
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
          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Iva tarifa
            </p>
            <div className="w-full rounded-lg bg-inputs ">
              <p className="font-inter text-sm text-fifth-gray px-4 py-3">
                {ivaTarifa.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

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
              Total venta agencia
            </p>
            <div className="w-full rounded-lg bg-inputs px-4 py-1">
              <p className="mt-1 font-inter text-2xl font-semibold text-fifth-gray ">
                ${totalVentaAgencia.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          {/* Tarifa neta proveedor */}
          <FormInput
            label="Tarifa neta proveedor"
            name="tarifaNetaProveedor"
            registration={register("tarifaNetaProveedor", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.tarifaNetaProveedor?.message}
          />
          {/* iva Tarifa proveedor */}
          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Iva tarifa proveedor
            </p>
            <div className="w-full rounded-lg bg-inputs ">
              <p className="font-inter text-sm text-fifth-gray px-4 py-3">
                {ivaTarifaProveedor.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* Comision agencia */}
          <FormInput
            label="Comisión agencia"
            name="comisionAgencia"
            registration={register("comisionAgencia", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.comisionAgencia?.message}
          />
          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Total pagado
            </p>
            <div className="w-full rounded-lg bg-inputs px-4 py-1">
              <p className="mt-1 font-inter text-2xl font-semibold text-fifth-gray ">
                ${totalPagado.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="mt-2 flex justify-end md:col-span-4">
            <div className="w-full rounded-lg bg-inputs p-4 md:w-1/3">
              <p className="font-inter text-sm text-fifth-gray/70">
                Total ingreso
              </p>

              <p className="mt-1 font-inter text-2xl font-semibold text-fifth-gray">
                ${totalIngreso.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
        </div>
      </section>

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
                  {
                    value: "OTROS",
                    label: "Otros (TC + Cash)",
                  },
                ]}
                error={errors.formaPago?.message}
              />
            )}
          />

          {/* Crédito agencia */}
          {formaPago === "CREDITO_AGENCIA" && (
            <FormInput
              label="Credito agencia (días)"
              name="creditoAgencia"
              registration={register("creditoAgencia", {
                valueAsNumber: true,
              })}
              type="number"
              required
              error={errors.creditoAgencia?.message}
            />
          )}

          {/* Número de tarjeta y aprobación */}
          {mostrarDatosTarjeta && (
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
          {mostrarTipoCash && (
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
                    { value: "EFECTIVO", label: "Efectivo" },
                    { value: "TRANSFERENCIA", label: "Transferencia" },
                  ]}
                  error={errors.tipoCash?.message}
                />
              )}
            />
          )}

          {/* Comprobante de pago */}
          {mostrarComprobante && (
            <div className="xl:col-span-2">
              <Controller
                name="comprobantePagoUrl"
                control={control}
                render={({ field }) => (
                  <FormFile
                    label="Comprobante de pago"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    error={errors.comprobantePagoUrl?.message}
                  />
                )}
              />
            </div>
          )}
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
          Documentos relacionados
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Factura proveedor */}
          <div className="xl:col-span-2">
            <Controller
              name="facturaProveedorUrl"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Factura proveedor"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  accept=".pdf"
                  error={errors.facturaProveedorUrl?.message}
                />
              )}
            />
          </div>

          {/* Soporte tiquete */}
          <div className="xl:col-span-2">
            <Controller
              name="soporteTiqueteElectronicoUrl"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Voucher servicio"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  accept=".pdf"
                  error={errors.soporteTiqueteElectronicoUrl?.message}
                />
              )}
            />
          </div>
          {/* Factura Go Travel */}
          <div className="xl:col-span-2">
            <Controller
              name="facturaGoTravelUrl"
              control={control}
              render={({ field }) => (
                <FormFile
                  label="Factura Go Travel"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  accept=".pdf"
                  error={errors.facturaGoTravelUrl?.message}
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
        createText="Guardar borrador"
        facturarText="Enviar a facturar"
      />
    </form>
  );
}
