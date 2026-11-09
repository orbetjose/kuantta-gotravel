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
    const facturadorId = session?.user?.id;

    if (!facturadorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const hoy = obtenerFecha(new Date());
    const primerDia = sumarDias(hoy, -6);
    const diaSiguiente = sumarDias(hoy, 1);

    const fechaInicio = inicioDelDia(primerDia);
    const fechaFin = inicioDelDia(diaSiguiente);

    const filtrosServicio = {
      facturadoPorId: facturadorId,
      estado: EstadoServicio.FACTURADO,
      fechaFacturacion: {
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
              fechaFacturacion: true,
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
              fechaFacturacion: true,
            },
          },
        },
      }),
    ]);

    // Inicializamos los siete días, incluso los que no tengan facturados.
    const facturadosPordia = new Map<
      string,
      { fecha: string; dia: string; facturados: number }
    >();

    for (let i = 0; i < 7; i++) {
      const fecha = sumarDias(primerDia, i);

      facturadosPordia.set(fecha, {
        fecha,
        dia: obtenerEtiqueta(fecha),
        facturados: 0,
      });
    }

    // Sumamos las facturados de los tiquetes según su fecha de creación.
    for (const tiquete of tiquetes) {
      if (tiquete.servicio.fechaFacturacion) {
        const fecha = obtenerFecha(tiquete.servicio.fechaFacturacion);
        const registro = facturadosPordia.get(fecha);
        if (registro) {
          registro.facturados += Number(tiquete.totalPagar);
        }
      }
    }

    // Sumamos las facturados de los demás tipos de servicio.
    for (const detalle of detalles) {
      if (detalle.servicio.fechaFacturacion) {
        const fecha = obtenerFecha(detalle.servicio.fechaFacturacion);
        const registro = facturadosPordia.get(fecha);

        if (registro) {
          registro.facturados += Number(detalle.totalVentaAgencia);
        }
      }
    }

    const datos = Array.from(facturadosPordia.values()).map((registro) => ({
      ...registro,
      facturados: Math.round(registro.facturados * 100) / 100,
    }));

    return NextResponse.json({ datos });
  } catch (error) {
    console.error("Error al obtener facturados semanales:", error);

    return NextResponse.json(
      { error: "Error al obtener las facturados semanales" },
      { status: 500 },
    );
  }
}
