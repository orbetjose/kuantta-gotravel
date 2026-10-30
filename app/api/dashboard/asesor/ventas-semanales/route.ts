import { NextResponse } from "next/server";
import { EstadoServicio } from "@/libs/generated/prisma/enums";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { obtenerFecha, inicioDelDia } from "@/libs/dashboard-helpers";

const TIME_ZONE = "America/Bogota";

function sumarDias(fecha: string, dias: number) {
  const resultado = new Date(`${fecha}T12:00:00Z`);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

function obtenerEtiqueta(fecha: string) {
  const partes = new Intl.DateTimeFormat("es-CO", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "2-digit",
  }).formatToParts(new Date(`${fecha}T12:00:00Z`));

  const dia = partes.find((parte) => parte.type === "weekday")!.value;
  const numero = partes.find((parte) => parte.type === "day")!.value;

  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${numero}`;
}

export async function GET() {
  try {
    const session = await auth();
    const asesorId = session?.user?.id;

    if (!asesorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const hoy = obtenerFecha(new Date());
    const primerDia = sumarDias(hoy, -6);
    const diaSiguiente = sumarDias(hoy, 1);

    const fechaInicio = inicioDelDia(primerDia);
    const fechaFin = inicioDelDia(diaSiguiente);

    const filtrosServicio = {
      creadoPorId: asesorId,
      estado: {
        not: EstadoServicio.ANULADO,
      },
      createdAt: {
        gte: fechaInicio,
        lt: fechaFin,
      },
    };

    const [tiquetes, detalles] = await Promise.all([
      prisma.tiquete.findMany({
        where: {
          servicio: filtrosServicio,
        },
        select: {
          totalPagar: true,
          servicio: {
            select: {
              createdAt: true,
            },
          },
        },
      }),

      prisma.detalleServicio.findMany({
        where: {
          servicio: filtrosServicio,
        },
        select: {
          totalVentaAgencia: true,
          servicio: {
            select: {
              createdAt: true,
            },
          },
        },
      }),
    ]);

    // Inicializamos los siete días, incluso los que no tengan ventas.
    const ventasPorDia = new Map<
      string,
      { fecha: string; dia: string; ventas: number }
    >();

    for (let i = 0; i < 7; i++) {
      const fecha = sumarDias(primerDia, i);

      ventasPorDia.set(fecha, {
        fecha,
        dia: obtenerEtiqueta(fecha),
        ventas: 0,
      });
    }

    // Sumamos las ventas de los tiquetes según su fecha de creación.
    for (const tiquete of tiquetes) {
      const fecha = obtenerFecha(tiquete.servicio.createdAt);
      const registro = ventasPorDia.get(fecha);

      if (registro) {
        registro.ventas += Number(tiquete.totalPagar);
      }
    }

    // Sumamos las ventas de los demás tipos de servicio.
    for (const detalle of detalles) {
      const fecha = obtenerFecha(detalle.servicio.createdAt);
      const registro = ventasPorDia.get(fecha);

      if (registro) {
        registro.ventas += Number(detalle.totalVentaAgencia);
      }
    }

    const datos = Array.from(ventasPorDia.values()).map((registro) => ({
      ...registro,
      ventas: Math.round(registro.ventas * 100) / 100,
    }));

    return NextResponse.json({ datos });
  } catch (error) {
    console.error("Error al obtener ventas semanales:", error);

    return NextResponse.json(
      { error: "Error al obtener las ventas semanales" },
      { status: 500 },
    );
  }
}
