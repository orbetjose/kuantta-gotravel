"use client";

interface DashboardSummary {
  totalFacturadoHoy: number;
  carteraPendiente: number;
  pagoPendienteProveedores: number;
  clientesConCartera: number;
  proveedoresPendientes: number;
}

interface DashboardIndicadoresProps {
  summary: DashboardSummary;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function DashboardFacturadorIndicadores({
  summary,
}: DashboardIndicadoresProps) {
  const indicadores = [
    {
      concepto: "Total facturado hoy",
      valor: formatCurrency(summary.totalFacturadoHoy),
    },
    {
      concepto: "Cartera pendiente",
      valor: formatCurrency(summary.carteraPendiente),
    },
    {
      concepto: "Pago pendiente a proveedores",
      valor: formatCurrency(summary.pagoPendienteProveedores),
    },
    {
      concepto: "Clientes con cartera",
      valor: summary.clientesConCartera.toLocaleString("es-CO"),
    },
    {
      concepto: "Proveedores pendientes",
      valor: summary.proveedoresPendientes.toLocaleString("es-CO"),
    },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-inter text-base font-semibold text-gray-800">
          Detalle de indicadores
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Resumen de facturación y cartera
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500">
              <th className="pb-3 font-medium">Concepto</th>
              <th className="px-3 pb-3 text-right font-medium">Valor</th>
              <th className="pb-3 pl-3 text-right font-medium">Variación</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {indicadores.map((indicador) => (
              <tr key={indicador.concepto}>
                <td className="py-3 pr-3 font-medium text-gray-700">
                  {indicador.concepto}
                </td>

                <td className="px-3 py-3 text-right font-medium whitespace-nowrap text-gray-800">
                  {indicador.valor}
                </td>

                <td className="py-3 pl-3 text-right text-gray-400">
                  —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}