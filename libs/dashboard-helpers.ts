


const TIME_ZONE = "America/Bogota";

export function obtenerFecha(fecha: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);

  const obtenerParte = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)!.value;

  return `${obtenerParte("year")}-${obtenerParte("month")}-${obtenerParte("day")}`;
}

export function inicioDelDia(fecha: string) {
  return new Date(`${fecha}T00:00:00-05:00`);
}

export function fechaValida(fecha: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const fechaParseada = inicioDelDia(fecha);

  return (
    !Number.isNaN(fechaParseada.getTime()) &&
    obtenerFecha(fechaParseada) === fecha
  );
}

export function redondear(valor: number) {
  return Math.round(valor * 100) / 100;
}