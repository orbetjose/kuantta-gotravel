import ServicioActions from "../servicios/servicio-actions";
import { getEstadoStyles } from "@/libs/helpers";

type TiqueteDetailProps = {
  tiquete: any;
  role: "ADMINISTRADOR" | "ASESOR" | "FACTURADOR";
};

const formatCurrency = (value: unknown) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

const formatEstado = (estado: string) => {
  return estado.replaceAll("_", " ");
};

export default function TiqueteDetail({ tiquete, role }: TiqueteDetailProps) {
  const cliente = tiquete.servicio.cliente;
  const pasajero = tiquete.servicio.pasajero;
  const proveedor = tiquete.servicio.proveedor;
  const ruta = tiquete.ruta;
  const servicio = tiquete.servicio;

  return (
    <div className="space-y-6 font-inter p-6 w-full rounded-lg bg-fourth-gray text-fifth-gray">
      {/* Header */}
      <div className="flex items-start justify-between">
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
        <h2 className="mb-6 text-lg font-bold">Información general</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Cliente"
            value={`${cliente.nombre} ${cliente.apellido}`}
          />

          <InfoItem
            label="Proveedor"
            value={proveedor?.razonSocial ?? "Sin proveedor"}
          />

          <InfoItem label="Número de tiquete" value={tiquete.numeroTiquete} />

          <InfoItem
            label="Fecha de emisión"
            value={formatDate(tiquete.fechaEmision)}
          />
        </div>
      </section>

      {/* Trayecto */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Información del viaje</h2>

        <div className="mb-8 flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold">{ruta.codigoOrigen}</p>

            <p className="text-sm text-fifth-gray">{ruta.origen}</p>
          </div>

          <div className="flex-1 border-t border-dashed border-gray-300" />

          <div className="text-right">
            <p className="text-2xl font-bold">{ruta.codigoDestino}</p>

            <p className="text-sm text-fifth-gray">{ruta.destino}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Pasajero"
            value={`${pasajero.nombre} ${pasajero.apellido}`}
          />

          <InfoItem label="Clase" value={tiquete.clase} />

          <InfoItem label="Fecha de ida" value={formatDate(tiquete.fechaIda)} />

          <InfoItem
            label="Fecha de regreso"
            value={formatDate(tiquete.fechaRegreso)}
          />
        </div>
      </section>

      {/* Valores */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Valores</h2>

        <div className="space-y-3">
          <AmountRow label="Tarifa neta" value={tiquete.tarifaNeta} />

          <AmountRow label="IVA tarifa" value={tiquete.ivaTarifa} />

          <AmountRow label="Otros impuestos" value={tiquete.otrosImpuestos} />

          <AmountRow
            label="Tarifa administrativa neta"
            value={tiquete.tarifaAdministrativaNeta}
          />

          <AmountRow
            label="IVA tarifa administrativa"
            value={tiquete.ivaTarifaAdministrativa}
          />

          <AmountRow label="Fee agencia neta" value={tiquete.feeAgenciaNeta} />

          <AmountRow label="IVA fee agencia" value={tiquete.ivaFeeAgencia} />

          <AmountRow label="Fee pago tarjeta" value={tiquete.feePagoTarjeta} />

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-bold">Total a pagar</span>

            <span className="text-xl font-bold">
              {formatCurrency(tiquete.totalPagar)}
            </span>
          </div>
        </div>
      </section>

      {/* Pago */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Información de pago</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Forma de pago" value={tiquete.pago} />

          {tiquete.tipoCash && (
            <InfoItem label="Tipo de pago" value={tiquete.tipoCash} />
          )}

          {tiquete.creditoAgencia && (
            <InfoItem
              label="Crédito agencia"
              value={`${tiquete.creditoAgencia} días`}
            />
          )}

          {tiquete.numeroTarjeta && (
            <InfoItem label="Número de tarjeta" value={tiquete.numeroTarjeta} />
          )}

          {tiquete.numeroAprobacion && (
            <InfoItem
              label="Número de aprobación"
              value={tiquete.numeroAprobacion}
            />
          )}
        </div>
      </section>

      {/* Información adicional */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Información adicional</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="APH" value={tiquete.aph} />

          <InfoItem label="CECO" value={tiquete.ceCos} />

          <InfoItem label="Proyecto FCDS" value={tiquete.proyectoFCDS} />

          <InfoItem
            label="Fecha emisión FES"
            value={formatDate(tiquete.fechaEmisionTiqueteFES)}
          />
        </div>

        {tiquete.observaciones && (
          <div className="mt-6">
            <InfoItem label="Observaciones" value={tiquete.observaciones} />
          </div>
        )}
      </section>

      {/* Documentos */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Documentos</h2>

        <div className="flex flex-wrap gap-3">
          {tiquete.facturaProveedorUrl && (
            <a
              href={tiquete.facturaProveedorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Factura proveedor
            </a>
          )}

          {tiquete.soporteTiqueteUrl && (
            <a
              href={tiquete.soporteTiqueteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Soporte tiquete
            </a>
          )}

          {tiquete.facturaGoTravelUrl && (
            <a
              href={tiquete.facturaGoTravelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Factura GoTravel
            </a>
          )}

          {!tiquete.facturaProveedorUrl &&
            !tiquete.soporteTiqueteUrl &&
            !tiquete.facturaGoTravelUrl && (
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
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-fifth-gray">{label}</p>

      <p className="font-medium text-fifth-gray">{value || "—"}</p>
    </div>
  );
}

function AmountRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-fifth-gray">{label}</span>

      <span className="font-medium">{formatCurrency(value)}</span>
    </div>
  );
}
