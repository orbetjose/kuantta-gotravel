export type PeriodoAgrupacion = "DIA" | "SEMANA" | "MES";

export function getChartDateRange(fechaDesde: string, fechaHasta: string) {
  // Sin filtros:
  // primer día del mes actual -> hoy
  if (!fechaDesde && !fechaHasta) {
    const hoy = new Date();

    const desde = new Date(hoy.getFullYear(), 0, 1);

    const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    return {
      desde,
      hasta,
    };
  }

  // Solo fechaDesde
  if (fechaDesde && !fechaHasta) {
    const desde = new Date(`${fechaDesde}T00:00:00`);

    const hoy = new Date();

    const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    return {
      desde,
      hasta,
    };
  }

  // Solo fechaHasta
  if (!fechaDesde && fechaHasta) {
    const hasta = new Date(`${fechaHasta}T00:00:00`);

    const desde = new Date(hasta.getFullYear(), hasta.getMonth(), 1);

    return {
      desde,
      hasta,
    };
  }

  // Ambas fechas
  return {
    desde: new Date(`${fechaDesde}T00:00:00`),
    hasta: new Date(`${fechaHasta}T00:00:00`),
  };
}

export function getPeriodoAgrupacion(
  desde: Date,
  hasta: Date,
): PeriodoAgrupacion {
  const diferencia = hasta.getTime() - desde.getTime();

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;

  if (dias <= 31) {
    return "DIA";
  }

  if (dias <= 90) {
    return "SEMANA";
  }

  return "MES";
}

export function getPeriodoKey(fecha: Date, agrupacion: PeriodoAgrupacion) {
  // -------------------------
  // DÍA
  // -------------------------

  if (agrupacion === "DIA") {
    const year = fecha.getFullYear();

    const month = String(fecha.getMonth() + 1).padStart(2, "0");

    const day = String(fecha.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // -------------------------
  // MES
  // -------------------------

  if (agrupacion === "MES") {
    const year = fecha.getFullYear();

    const month = String(fecha.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  }

  // -------------------------
  // SEMANA
  // -------------------------

  const date = new Date(fecha);

  const day = date.getDay();

  // Convertimos domingo (0) a 6
  // y lunes (1) a 0.
  const diferencia = day === 0 ? 6 : day - 1;

  date.setDate(date.getDate() - diferencia);

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const dayOfMonth = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${dayOfMonth}`;
}
