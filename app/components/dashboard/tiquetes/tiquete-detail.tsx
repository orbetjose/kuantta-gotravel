import { TiqueteDetailData } from "@/types/tiquete";
import ServicioActions from "../servicios/servicio-actions";
import { getEstadoStyles, formatDate } from "@/libs/helpers";
import { formatCurrency } from "@/libs/helpers";

type TiqueteDetailProps = {
  tiquete: TiqueteDetailData;
  role: "ADMINISTRADOR" | "ASESOR" | "FACTURADOR";
};

const formatEstado = (estado: string) => {
  return estado.replaceAll("_", " ");
};

export default function TiqueteDetail({ tiquete, role }: TiqueteDetailProps) {
  const cliente = tiquete.servicio.cliente;
  const proveedor = tiquete.servicio.proveedor;
  const servicio = tiquete.servicio;

  return (
    <div className="space-y-6 font-inter p-6 w-full rounded-lg bg-fourth-gray text-fifth-gray">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm text-fifth-gray">Detalle del tiquete</p>

          <h1 className="text-3xl font-bold text-fifth-gray">
            Tiquete #{tiquete.numeroTiquete}
          </h1>
          <div className="flex justify-center flex-col pt-2">
            <span
              className={`inline-flex w-fit rounded-full px-8 py-1 text-sm font-bold ${getEstadoStyles(
                servicio.estado,
              )}`}
            >
              {formatEstado(servicio.estado)}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <ServicioActions
            servicioId={servicio.id}
            tiqueteId={tiquete.id}
            estado={servicio.estado}
            role={role}
            tipoServicio="TIQUETE"
          />
        </div>
      </div>

      {/* Información general */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Información del cliente</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 ">
          <InfoItem label="Nombre" value={`${cliente.nombre}`} />
          <InfoItem
            label="Documento"
            value={`${cliente.tipoDocumento} ${cliente.documento}`}
          />
          <InfoItem label="Correo" value={`${cliente.correo}`} />
          <InfoItem label="Teléfono" value={`${cliente.telefono}`} />
        </div>
      </section>
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Información del proveedor</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Razón social" value={`${proveedor?.razonSocial}`} />
          <InfoItem label="NIT" value={`${proveedor?.nit}`} />
          <InfoItem
            label="Correo comercial"
            value={`${proveedor?.correoComercial}`}
          />
          <InfoItem label="Teléfono" value={`${proveedor?.telefono}`} />
        </div>
      </section>
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Información del pasajero</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Pasajero"
            value={`${servicio.pasajero.nombre} ${servicio.pasajero.apellido}`}
          />

          <InfoItem label="Documento" value={servicio.pasajero.documento} />

          <InfoItem label="Número de tiquete" value={tiquete.numeroTiquete} />
          <InfoItem label="Teléfono" value={`${servicio.pasajero.telefono}`} />
        </div>
      </section>

      {/* Trayecto */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Información del viaje</h2>

        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5 ">
            <InfoItem label="Número de tiquete" value={tiquete.numeroTiquete} />
            <InfoItem label="Código de reserva" value={tiquete.codigoReserva} />

            <InfoItem label="Tipo de viaje" value={tiquete.tipoViaje} />
            <InfoItem label="Tipo itinerario" value={tiquete.tipoItinerario} />

            <InfoItem
              clases="text-right"
              label="Fecha de emisión"
              value={formatDate(servicio.fechaEmision)}
            />
          </div>
          {tiquete.trayectos.map((trayecto, index) => (
            <div
              key={trayecto.id}
              className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
            >
              <p className="mb-4 text-sm font-medium text-fifth-gray">
                Trayecto {index + 1}
              </p>

              <div className="mb-6 flex items-center gap-4">
                <div className="min-w-0">
                  <p className="text-2xl font-bold">
                    {trayecto.origen.codigoIATA}
                  </p>
                  <p className="text-sm text-fifth-gray">
                    {trayecto.origen.nombreAeropuerto}
                  </p>
                  <p className="text-sm text-fifth-gray">
                    {trayecto.origen.ciudad}
                  </p>
                  <p className="text-sm text-fifth-gray">
                    {trayecto.origen.pais}
                  </p>
                </div>

                <div className="flex-1 border-t border-dashed border-gray-300" />

                <div className="min-w-0 text-right">
                  <p className="text-2xl font-bold">
                    {trayecto.destino.codigoIATA}
                  </p>

                  <p className="text-sm text-fifth-gray">
                    {trayecto.destino.nombreAeropuerto}
                  </p>
                  <p className="text-sm text-fifth-gray">
                    {trayecto.destino.ciudad}
                  </p>
                  <p className="text-sm text-fifth-gray">
                    {trayecto.destino.pais}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-center">
                <InfoItem
                  label="Fecha de salida"
                  value={formatDate(trayecto.fechaSalida)}
                />

                <InfoItem
                  clases="text-center"
                  label="Clase"
                  value={tiquete.clase}
                />

                {trayecto.fechaRegreso && (
                  <InfoItem
                    clases="text-right"
                    label="Fecha de regreso"
                    value={formatDate(trayecto.fechaRegreso)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Valores</h2>

        <div className="space-y-3">
          <AmountRow label="Tarifa neta" value={Number(tiquete.tarifaNeta)} />

          <AmountRow label="IVA tarifa" value={Number(tiquete.ivaTarifa)} />

          <AmountRow
            label="Otros impuestos"
            value={Number(tiquete.otrosImpuestos)}
          />

          <AmountRow
            label="Tarifa administrativa neta"
            value={Number(tiquete.tarifaAdministrativaNeta)}
          />

          <AmountRow
            label="IVA tarifa administrativa"
            value={Number(tiquete.ivaTarifaAdministrativa)}
          />

          <AmountRow
            label="Fee agencia neta"
            value={Number(tiquete.feeAgenciaNeta)}
          />

          <AmountRow
            label="IVA fee agencia"
            value={Number(tiquete.ivaFeeAgencia)}
          />
          <AmountRow label="Tarifa APH" value={Number(tiquete.tarifaAPH)} />
          <AmountRow
            label="IVA tarifa APH"
            value={Number(tiquete.ivaTarifaAPH)}
          />

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-bold">Total a pagar</span>

            <span className="text-xl font-bold">
              {formatCurrency(Number(tiquete.totalPagar))}
            </span>
          </div>
        </div>
      </section>

      {/* Pago */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Información de pago</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Forma de pago" value={servicio.formaPago} />

          {servicio.tipoCash && (
            <InfoItem label="Tipo de pago" value={servicio.tipoCash} />
          )}

          {servicio.creditoAgencia && (
            <InfoItem
              label="Crédito agencia"
              value={`${servicio.creditoAgencia} días`}
            />
          )}

          {servicio.numeroTarjeta && (
            <InfoItem
              label="Número de tarjeta"
              value={servicio.numeroTarjeta}
            />
          )}

          {servicio.numeroAprobacion && (
            <InfoItem
              label="Número de aprobación"
              value={servicio.numeroAprobacion}
            />
          )}
        </div>
      </section>

      {/* Información adicional */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Información adicional</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="CECO" value={servicio.ceCos} />

          <InfoItem label="Proyecto FCDS" value={servicio.proyectoFCDS} />

          <InfoItem
            label="Fecha emisión FES"
            value={formatDate(tiquete.fechaEmisionTiqueteFES)}
          />
        </div>

        {servicio.observaciones && (
          <div className="mt-6">
            <InfoItem label="Observaciones" value={servicio.observaciones} />
          </div>
        )}
      </section>

      {/* Documentos */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold">Documentos</h2>

        <div className="flex flex-wrap gap-3">
          {servicio.facturaProveedorUrl && (
            <a
              href={servicio.facturaProveedorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Factura proveedor
            </a>
          )}

          {servicio.soporteTiqueteElectronicoUrl && (
            <a
              href={servicio.soporteTiqueteElectronicoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Soporte tiquete
            </a>
          )}

          {servicio.facturaGoTravelUrl && (
            <a
              href={servicio.facturaGoTravelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Factura GoTravel
            </a>
          )}

          {servicio.facturaProveedorUrl &&
            servicio.soporteTiqueteElectronicoUrl &&
            servicio.facturaGoTravelUrl && (
              <p className="text-sm text-fifth-gray">
                No hay documentos adjuntos.
              </p>
            )}
        </div>
      </section>
    </div>
  );
}

function InfoItem({
  label,
  value,
  clases,
}: {
  label: string;
  value: string | null | undefined;
  clases?: string;
}) {
  return (
    <div className={`${clases}`}>
      <p className="mb-1 text-sm text-fifth-gray">{label}</p>
      <p className="font-medium text-fifth-gray">{value || "—"}</p>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-fifth-gray">{label}</span>

      <span className="font-medium">{formatCurrency(value)}</span>
    </div>
  );
}
