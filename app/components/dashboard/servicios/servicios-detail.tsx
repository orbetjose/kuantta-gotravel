import { getEstadoStyles, getTiposStyles } from "@/libs/helpers";
import ServicioActions from "./servicio-actions";

type ServicioDetailProps = {
  servicio: any;
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

export default function ServiciosDetail({
  servicio,
  role,
}: ServicioDetailProps) {
  const cliente = servicio.cliente;
  const pasajero = servicio.pasajero;
  const proveedor = servicio.proveedor;
  const tipoServicio = servicio.tipo;

  return (
    <div className="space-y-6 font-inter p-6 w-full rounded-lg bg-fourth-gray text-fifth-gray">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-fifth-gray">Detalle del servicio</p>

          <h1 className="text-3xl font-bold text-fifth-gray">
            Servicio # {servicio.id}
          </h1>

          <div className="flex justify-center gap-4 pt-2">
            <span
              className={`inline-flex w-fit rounded-full px-8 py-1 text-sm font-bold ${getTiposStyles(
                tipoServicio,
              )}`}
            >
              {formatEstado(tipoServicio)}
            </span>
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
            estado={servicio.estado}
            role={role}
            tipoServicio={tipoServicio}
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

          <InfoItem
            label="Fecha de emisión"
            value={formatDate(servicio.fechaEmision)}
          />

          <InfoItem
            label="Pasajero"
            value={`${pasajero.nombre} ${pasajero.apellido}`}
          />
          <InfoItem
            label="Código de reserva"
            value={servicio.detalleServicio.codigoReserva}
          />
          <InfoItem
            label="Pagado al proveedor"
            value={servicio.pagadoProveedor}
          />
          <InfoItem
            label="Fecha de pago al proveedor"
            value={formatDate(servicio.fechaPagoProveedor)}
          />
          <InfoItem
            label="Fecha de vencimiento factura proveedor"
            value={formatDate(servicio.vencimientoFacturaProveedor)}
          />
          <div className="mt-6 md:col-span-4">
            <InfoItem
              label="Descripcion del servicio"
              value={servicio.detalleServicio.descripcionServicio}
              border
            />
          </div>
        </div>
      </section>
      {/* Valores */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Valores</h2>

        <div className="space-y-3">
          <AmountRow
            label="Valor pagado al proveedor"
            value={servicio.detalleServicio.valorPagadoProveedor}
          />

          <AmountRow label="TRM" value={servicio.detalleServicio.trm} />

          <AmountRow
            label="Fee pago tarjeta de crédito"
            value={servicio.detalleServicio.feePagoTarjetaCredito}
          />

          <AmountRow
            label="Valor pagado a Go Travel"
            value={servicio.detalleServicio.valorPagadoGoTravel}
          />

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-bold">Total a ingreso</span>

            <span className="text-xl font-bold">
              {formatCurrency(servicio.detalleServicio.totalIngreso)}
            </span>
          </div>
        </div>
      </section>
      {/* Pago */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Información de pago</h2>

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
        <h2 className="mb-6 text-lg font-bold">Información adicional</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="CECO" value={servicio.ceCos} />

          <InfoItem label="Proyecto FCDS" value={servicio.proyectoFCDS} />
        </div>

        {servicio.observaciones && (
          <div className="mt-6">
            <InfoItem label="Observaciones" value={servicio.observaciones} border />
          </div>
        )}
      </section>
      {/* Documentos */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold">Documentos</h2>

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

          {servicio.soporteTiqueteElectronico && (
            <a
              href={servicio.soporteTiqueteElectronico}
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

          {!servicio.facturaProveedorUrl &&
            !servicio.soporteTiqueteUrl &&
            !servicio.facturaGoTravelUrl && (
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
  border,
}: {
  label: string;
  value: string | null | undefined;
  border?: boolean
}) {
  return (
    <div>
      <p className="mb-1 text-sm text-fifth-gray">{label}</p>

      <p className={`font-medium text-fifth-gray ${border && "border-2 py-2 px-2 rounded-lg min-h-30 border-fifth-gray"}`}>
        {value?.replace("_", " ") || "—"}
      </p>
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
