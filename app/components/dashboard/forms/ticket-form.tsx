"use client";

import { Controller, useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTiquete, updateTiquete } from "@/actions/tiquete";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelectedEntity } from "@/libs/use-selected-entity";
import { TiqueteData } from "@/types/tiquete";
import {
  ticketSchema,
  type TicketFormValues,
  TicketFormInput,
  TicketFormInitialData,
} from "@/libs/schemas/ticketSchema";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormSelect from "@/app/components/dashboard/ui/FormSelect";
import FormComboBox from "@/app/components/dashboard/ui/FormComboBox";
import FormDate from "@/app/components/dashboard/ui/FormDate";
import FormFile from "@/app/components/dashboard/ui/FormFile";
import FormTextarea from "@/app/components/dashboard/ui/FormTextArea";
import FormActions from "./form-actions";
import {
  ClienteOption,
  PasajeroOption,
  RutaOption,
  ProveedorOption,
} from "@/types";
import {
  getClientesOptions,
  getPasajerosOptions,
  getProveedoresOptions,
  getRutasOptions,
} from "@/libs/form-options";

type TicketFormProps = {
  clientes: ClienteOption[];
  pasajeros: PasajeroOption[];
  proveedores: ProveedorOption[];
  rutas: RutaOption[];
  initialData?: TicketFormInitialData;
  tiqueteId?: number;
  mode?: "create" | "edit";
};

export default function TicketForm({
  clientes,
  pasajeros,
  proveedores,
  rutas,
  tiqueteId,
  initialData,
  mode = "create",
}: TicketFormProps) {
  const { totalPagar = 0, ...formValues } = initialData ?? {};
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const trayectoVacio = {
    origenId: "",
    destinoId: "",
    fechaSalida: "",
    fechaRegreso: "",
  };

  const defaultValues: TicketFormInput = initialData
    ? {
        ...initialData,
        proveedorId: initialData.proveedorId ?? "",
        revision: initialData.revision ?? false,
        numeroTiqueteRevision: initialData.numeroTiqueteRevision ?? "",
        trayectos: initialData.trayectos.map((trayecto) => ({
          origenId: String(trayecto.origenId),
          destinoId: String(trayecto.destinoId),
          fechaSalida: trayecto.fechaSalida,
          fechaRegreso: trayecto.fechaRegreso ?? "",
        })),
      }
    : {
        fechaEmision: "",
        fechaSolicitud: "",
        clienteId: "",
        estado: "BORRADOR",
        proveedorId: "",
        pasajeroId: "",
        numeroTiquete: "",
        codigoReserva: "",
        tipoViaje: "NACIONAL",
        tipoItinerario: "IDA_VUELTA",
        canalVenta: "AMADEUS",
        revision: false,
        numeroTiqueteRevision: "",
        clase: "",
        trayectos: [{ ...trayectoVacio }],
        tarifaNeta: 0,
        ivaTarifa: 0,
        otrosImpuestos: 0,
        tarifaAdministrativaNeta: 0,
        ivaTarifaAdministrativa: 0,
        feeAgenciaNeta: 0,
        ivaFeeAgencia: 0,
        tarifaAPH: 0,
        ivaTarifaAPH: 0,
        formaPago: "CASH",
        creditoAgencia: undefined,
        numeroTarjeta: "",
        numeroAprobacion: "",
        tipoCash: undefined,
        ceCos: "",
        proyectoFCDS: "",
        observaciones: "",
        fechaEmisionTiqueteFES: "",
      };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TicketFormInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues,
  });

  const {
    fields: trayectoFields,
    append: agregarTrayecto,
    remove: eliminarTrayecto,
  } = useFieldArray({
    control,
    name: "trayectos",
  });

  const clientesOptions = getClientesOptions(clientes);
  const pasajerosOptions = getPasajerosOptions(pasajeros);
  const proveedoresOptions = getProveedoresOptions(proveedores);
  const rutasOptions = getRutasOptions(rutas);

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

  const cambiarTipoItinerario = (
    tipo: "SOLO_IDA" | "IDA_VUELTA" | "MULTIDESTINO",
  ) => {
    setValue("tipoItinerario", tipo, {
      shouldValidate: true,
    });

    if (tipo === "MULTIDESTINO") {
      if (trayectoFields.length < 2) {
        agregarTrayecto({ ...trayectoVacio });
      }
      return;
    }

    // Solo ida e ida y vuelta usan un único bloque.
    if (trayectoFields.length > 1) {
      eliminarTrayecto(trayectoFields.slice(1).map((_, index) => index + 1));
    }

    if (trayectoFields.length === 0) {
      agregarTrayecto({ ...trayectoVacio });
    }

    if (tipo === "SOLO_IDA") {
      setValue("trayectos.0.fechaRegreso", "");
    }
  };

  const rutasIniciales =
    initialData?.trayectos.flatMap((trayecto) => [
      {
        value: trayecto.origenId,
        label: trayecto.origenLabel,
      },
      {
        value: trayecto.destinoId,
        label: trayecto.destinoLabel,
      },
    ]) ?? [];

  const rutasOptionsCompletas = [...rutasIniciales, ...rutasOptions].filter(
    (option, index, options) =>
      options.findIndex((item) => item.value === option.value) === index,
  );

  const revision = watch("revision");
  const formaPago = watch("formaPago");
  const tipoViaje = watch("tipoViaje");
  const tipoCash = watch("tipoCash");

  const tarifaNeta = watch("tarifaNeta");
  const ivaTarifa = Number((tarifaNeta * 0.19).toFixed(2));
  const otrosImpuestos = watch("otrosImpuestos");
  const tarifaAdministrativaNeta = watch("tarifaAdministrativaNeta");
  const ivaTarifaAdministrativa = Number(
    (tarifaAdministrativaNeta * 0.19).toFixed(2),
  );
  const feeAgenciaNeta = watch("feeAgenciaNeta");
  const ivaFeeAgencia = Number((feeAgenciaNeta * 0.19).toFixed(2));
  const tarifaAPH = watch("tarifaAPH");
  const ivaTarifaAPH = Number((tarifaAPH * 0.19).toFixed(2));

  const totalTiquete =
    Number(tarifaNeta || 0) +
    Number(ivaTarifa || 0) +
    Number(otrosImpuestos || 0) +
    Number(tarifaAdministrativaNeta || 0) +
    Number(ivaTarifaAdministrativa || 0) +
    Number(feeAgenciaNeta || 0) +
    Number(ivaFeeAgencia || 0) +
    Number(tarifaAPH || 0) +
    Number(ivaTarifaAPH || 0);

  const mostrarDatosTarjeta =
    formaPago === "TARJETA_CREDITO" || formaPago === "OTROS";

  const mostrarTipoCash = formaPago === "CASH" || formaPago === "OTROS";

  const mostrarComprobante =
    (formaPago === "CASH" && tipoCash === "TRANSFERENCIA") ||
    (formaPago === "OTROS" && tipoCash === "TRANSFERENCIA");

  const onSubmit = async (
    values: TicketFormValues,
    event?: React.BaseSyntheticEvent,
  ) => {
    setIsLoading(true);

    try {
      const data = {
        ...values,
        clienteId: Number(values.clienteId),
        pasajeroId: Number(values.pasajeroId),
        proveedorId: values.proveedorId
          ? Number(values.proveedorId)
          : undefined,
        trayectos: values.trayectos.map((trayecto) => ({
          origenId: Number(trayecto.origenId),
          destinoId: Number(trayecto.destinoId),
          fechaSalida: trayecto.fechaSalida,
          fechaRegreso: trayecto.fechaRegreso || undefined,
        })),
      };

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
        if (!tiqueteId) {
          throw new Error("No se encontró el ID del tiquete.");
        }

        const updateData: TiqueteData = {
          ...data,
          ...(estado !== undefined && { estado }),
        };

        const result = await updateTiquete(tiqueteId, updateData);

        if (!result.success) {
          throw new Error(result.error || "No se pudo actualizar el tiquete.");
        }

        router.push(`/dashboard/servicios/tiquete/${tiqueteId}`);
      } else {
        const createData: TiqueteData = {
          ...data,
          estado: estado ?? "BORRADOR",
        };

        const result = await createTiquete(createData);

        if (!result.success) {
          throw new Error(result.error || "No se pudo crear el tiquete.");
        }

        router.push(`/dashboard/servicios/tiquete/${result.tiqueteId}`);
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6 pt-4" onSubmit={handleSubmit(onSubmit)}>
      {/* =====================================================
          INFORMACIÓN GENERAL
      ===================================================== */}
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

      {/* =====================================================
          INFORMACIÓN DEL VIAJE
      ===================================================== */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del viaje
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* tipoViaje */}
          <Controller
            name="tipoViaje"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Tipo de viaje"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "NACIONAL", label: "Nacional" },
                  { value: "INTERNACIONAL", label: "Internacional" },
                ]}
                error={errors.tipoViaje?.message}
              />
            )}
          />
          {/* tipoItinerario */}
          <Controller
            name="tipoItinerario"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Tipo de itinerario"
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  cambiarTipoItinerario(
                    value as "SOLO_IDA" | "IDA_VUELTA" | "MULTIDESTINO",
                  );
                }}
                options={[
                  { value: "IDA_VUELTA", label: "Ida y vuelta" },
                  { value: "SOLO_IDA", label: "Solo Ida" },
                  { value: "MULTIDESTINO", label: "Multidestino" },
                ]}
                error={errors.tipoItinerario?.message}
              />
            )}
          />

          {/* Fecha de emisión */}
          <FormDate
            label="Fecha de emisión"
            name="fechaEmision"
            required
            registration={register("fechaEmision")}
            error={errors.fechaEmision?.message}
          />

          {/* Fecha de solicitud */}
          <FormDate
            label="Fecha de solicitud"
            name="fechaSolicitud"
            required
            registration={register("fechaSolicitud")}
            error={errors.fechaSolicitud?.message}
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

          {/* Canal de venta */}
          <Controller
            name="canalVenta"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Canal de venta"
                name={field.name}
                value={field.value}
                required
                onChange={field.onChange}
                options={[
                  { value: "AMADEUS", label: "Amadeus" },
                  { value: "SABRE", label: "Sabre" },
                  { value: "KONTROL_TRAVEL", label: "Kontrol Travel" },
                  { value: "KIU_TRAVEL", label: "Kiu Travel" },
                  { value: "NDC", label: "NDC" },
                  { value: "OTROS", label: "Otros" },
                ]}
                error={errors.canalVenta?.message}
              />
            )}
          />

          {/* Clase */}
          <FormInput
            label="Código de reserva"
            name="codigoReserva"
            registration={register("codigoReserva")}
            placeholder="Ej. XXXX"
            required
            error={errors.codigoReserva?.message}
          />

          {/* Clase */}
          <FormInput
            label="Clase"
            name="clase"
            registration={register("clase")}
            placeholder="Ej. Económica"
            required
            error={errors.clase?.message}
          />

          {/* Revisión */}
          <Controller
            name="revision"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Revisión"
                name={field.name}
                value={field.value ? "SI" : "NO"}
                onChange={(value) => field.onChange(value === "SI")}
                options={[
                  { value: "SI", label: "Sí" },
                  { value: "NO", label: "No" },
                ]}
                error={errors.revision?.message}
              />
            )}
          />

          {/* Número de tiquete de revisión */}
          {revision === true && (
            <FormInput
              label="Número de tiquete de revisión"
              name="numeroTiqueteRevision"
              registration={register("numeroTiqueteRevision")}
              placeholder="Ingresa el número de tiquete"
              required
              error={errors.numeroTiqueteRevision?.message}
            />
          )}

          {/* Ruta */}
          <div className="xl:col-span-4">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                {watch("tipoItinerario") === "MULTIDESTINO" && (
                  <button
                    type="button"
                    onClick={() =>
                      agregarTrayecto({
                        origenId: "",
                        destinoId: "",
                        fechaSalida: "",
                        fechaRegreso: "",
                      })
                    }
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    Agregar trayecto
                  </button>
                )}
              </div>

              {trayectoFields.map((trayecto, index) => (
                <div key={trayecto.id} className="space-y-4 ">
                  {watch("tipoItinerario") === "MULTIDESTINO" && (
                    <div className="flex items-center justify-between">
                      <h3 className="font-inter font-medium text-fifth-gray">
                        Trayecto {index + 1}
                      </h3>

                      {trayectoFields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => eliminarTrayecto(index)}
                          className="text-sm text-red-500"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Controller
                      name={`trayectos.${index}.origenId`}
                      control={control}
                      render={({ field }) => (
                        <FormComboBox
                          label="Origen"
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          options={rutasOptionsCompletas}
                          searchEndpoint="/api/rutas/buscar"
                          searchPlaceholder="Buscar aeropuerto o ciudad..."
                          error={errors.trayectos?.[index]?.origenId?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`trayectos.${index}.destinoId`}
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Destino"
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          options={rutasOptionsCompletas}
                          error={errors.trayectos?.[index]?.destinoId?.message}
                        />
                      )}
                    />

                    <FormDate
                      label="Fecha de salida"
                      name={`trayectos.${index}.fechaSalida`}
                      registration={register(`trayectos.${index}.fechaSalida`)}
                      error={errors.trayectos?.[index]?.fechaSalida?.message}
                    />

                    {watch("tipoItinerario") === "IDA_VUELTA" && (
                      <FormDate
                        label="Fecha de regreso"
                        name={`trayectos.${index}.fechaRegreso`}
                        registration={register(
                          `trayectos.${index}.fechaRegreso`,
                        )}
                        error={errors.trayectos?.[index]?.fechaRegreso?.message}
                      />
                    )}
                  </div>
                </div>
              ))}

              {watch("tipoItinerario") === "MULTIDESTINO" && (
                <button
                  type="button"
                  onClick={() => agregarTrayecto({ ...trayectoVacio })}
                  className="text-sm font-medium text-primary-blue"
                >
                  + Agregar trayecto
                </button>
              )}
            </section>
          </div>
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

          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Iva tarifa neta
            </p>
            <div className="w-full rounded-lg bg-inputs ">
              <p className="font-inter text-sm text-fifth-gray px-4 py-3">
                {ivaTarifa.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

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

          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Iva tarifa administrativa
            </p>
            <div className="w-full rounded-lg bg-inputs ">
              <p className="font-inter text-sm text-fifth-gray px-4 py-3">
                {ivaTarifaAdministrativa.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

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

          <div className="">
            <p className="font-inter text-sm text-fifth-gray/70 mb-2">
              Iva fee agencia
            </p>
            <div className="w-full rounded-lg bg-inputs ">
              <p className="font-inter text-sm text-fifth-gray px-4 py-3">
                {ivaFeeAgencia.toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          {/* Tarifa APH */}
          <FormInput
            label="Tarifa APH"
            name="tarifaAPH"
            registration={register("tarifaAPH", {
              valueAsNumber: true,
            })}
            type="number"
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.tarifaAPH?.message}
          />
          {/* IVA tarifa aph */}
          {tipoViaje === "NACIONAL" && (
            <div className="">
              <p className="font-inter text-sm text-fifth-gray/70 mb-2">
                Iva tarifa APH
              </p>
              <div className="w-full rounded-lg bg-inputs ">
                <p className="font-inter text-sm text-fifth-gray px-4 py-3">
                  {ivaTarifaAPH.toLocaleString("es-CO")}
                </p>
              </div>
            </div>
          )}
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
                name="comprobanteTransferencia"
                control={control}
                render={({ field }) => (
                  <FormFile
                    label="Comprobante de pago"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    error={errors.comprobanteTransferencia?.message}
                  />
                )}
              />
            </div>
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
        createText="Registrar tiquete"
        facturarText="Enviar a facturar"
      />
    </form>
  );
}
