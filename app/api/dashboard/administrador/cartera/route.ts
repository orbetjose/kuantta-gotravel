import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import { EstadoServicio, Role, TipoPago } from "@/libs/generated/prisma/enums";
import { obtenerFecha } from "@/libs/dashboard-helpers";

interface CarteraCliente {
  clienteId: number;
  cliente: string;
  fechaVencimiento: string;
  monto: number;
  estado: "VENCIDO" | "PENDIENTE";
}



// Sumar días calendario a una fecha YYYY-MM-DD
function sumarDias(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  const resultado = new Date(Date.UTC(anio, mes - 1, dia + dias));

  return resultado.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    // Autenticación y permisos
    const session = await auth();
    const usuarioId = session?.user?.id;
    const rol = session?.user?.role;

    if (!usuarioId || !rol) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (rol !== Role.ADMINISTRADOR) {
      return NextResponse.json(
        { error: "No tienes permisos para consultar la cartera" },
        { status: 403 },
      );
    }

    const hoy = obtenerFecha(new Date());

    // Obtener créditos pendientes
    const servicios = await prisma.servicio.findMany({
      where: {
        formaPago: TipoPago.CREDITO_AGENCIA,
        pagadoCliente: false,
        creditoAgencia: {
          not: null,
        },
        estado: {
          not: EstadoServicio.ANULADO,
        },
      },
      select: {
        id: true,
        clienteId: true,
        createdAt: true,
        creditoAgencia: true,

        cliente: {
          select: {
            id: true,
            nombre: true,
            razonSocial: true,
          },
        },

        tiquete: {
          select: {
            totalPagar: true,
          },
        },

        detalleServicio: {
          select: {
            totalVentaAgencia: true,
          },
        },
      },
    });

    // Agrupar créditos por cliente
    const carteraPorCliente = new Map<
      number,
      CarteraCliente & { tieneVencidos: boolean }
    >();

    for (const servicio of servicios) {
      if (servicio.creditoAgencia === null) continue;

      // Obtener monto del crédito
      const monto = Number(
        servicio.tiquete?.totalPagar ??
          servicio.detalleServicio?.totalVentaAgencia ??
          0,
      );

      if (monto <= 0) continue;

      // Calcular fecha de vencimiento
      const fechaRegistro = obtenerFecha(servicio.createdAt);

      const fechaVencimiento = sumarDias(
        fechaRegistro,
        servicio.creditoAgencia,
      );

      const vencido = fechaVencimiento < hoy;

      const clienteId = servicio.clienteId;

      const cliente = carteraPorCliente.get(clienteId);

      if (!cliente) {
        carteraPorCliente.set(clienteId, {
          clienteId,
          cliente: servicio.cliente.razonSocial || servicio.cliente.nombre,
          fechaVencimiento,
          monto,
          estado: vencido ? "VENCIDO" : "PENDIENTE",
          tieneVencidos: vencido,
        });
      } else {
        // Acumular monto
        cliente.monto += monto;

        // Mantener el vencimiento más próximo
        if (fechaVencimiento < cliente.fechaVencimiento) {
          cliente.fechaVencimiento = fechaVencimiento;
        }

        // Si al menos un crédito venció,
        // el estado general del cliente será VENCIDO
        if (vencido) {
          cliente.tieneVencidos = true;
          cliente.estado = "VENCIDO";
        }
      }
    }

    // Ordenar por mayor cartera y obtener los 4 primeros
    const datos = Array.from(carteraPorCliente.values())
      .map(({ tieneVencidos, ...cliente }) => ({
        ...cliente,
        estado: tieneVencidos ? "VENCIDO" : "PENDIENTE",
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 4);

    return NextResponse.json({
      datos,
    });
  } catch (error) {
    console.error("Error obteniendo cartera:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
