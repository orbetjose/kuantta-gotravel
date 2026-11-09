import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/libs/prisma";
import {
  EstadoServicio,
  Role,
  TipoPagadoProveedor,
} from "@/libs/generated/prisma/enums";
import { obtenerFecha } from "@/libs/dashboard-helpers";

type EstadoCartera = "VENCIDO" | "PENDIENTE" | "SIN_FECHA";

interface CarteraProveedor {
  proveedorId: number;
  proveedor: string;
  fechaVencimiento: string | null;
  monto: number;
  estado: EstadoCartera;
  tieneVencidos: boolean;
  tieneFechas: boolean;
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
        { error: "No tienes permisos para consultar esta información" },
        { status: 403 },
      );
    }

    const hoy = obtenerFecha(new Date());

    // Obtener servicios con deuda pendiente a proveedores
    const servicios = await prisma.servicio.findMany({
      where: {
        pagadoProveedor: TipoPagadoProveedor.NO,
        proveedorId: {
          not: null,
        },
        estado: {
          not: EstadoServicio.ANULADO,
        },
        detalleServicio: {
          isNot: null,
        },
      },
      select: {
        vencimientoFacturaProveedor: true,

        proveedor: {
          select: {
            id: true,
            razonSocial: true,
            nombreComercial: true,
          },
        },

        detalleServicio: {
          select: {
            totalPagado: true,
          },
        },
      },
    });

    // Agrupar deudas por proveedor
    const carteraPorProveedor = new Map<number, CarteraProveedor>();

    for (const servicio of servicios) {
      if (!servicio.proveedor || !servicio.detalleServicio) {
        continue;
      }

      const proveedorId = servicio.proveedor.id;
      const monto = Number(servicio.detalleServicio.totalPagado);

      if (monto <= 0) continue;

      const fechaVencimiento = servicio.vencimientoFacturaProveedor
        ? obtenerFecha(servicio.vencimientoFacturaProveedor)
        : null;

      const vencido = fechaVencimiento ? fechaVencimiento < hoy : false;

      const proveedor = carteraPorProveedor.get(proveedorId);

      if (!proveedor) {
        carteraPorProveedor.set(proveedorId, {
          proveedorId,
          proveedor:
            servicio.proveedor.nombreComercial ||
            servicio.proveedor.razonSocial,
          fechaVencimiento,
          monto,
          estado: vencido
            ? "VENCIDO"
            : fechaVencimiento
              ? "PENDIENTE"
              : "SIN_FECHA",
          tieneVencidos: vencido,
          tieneFechas: fechaVencimiento !== null,
        });
      } else {
        // Acumular deuda
        proveedor.monto += monto;

        // Actualizar vencimiento más próximo
        if (
          fechaVencimiento &&
          (!proveedor.fechaVencimiento ||
            fechaVencimiento < proveedor.fechaVencimiento)
        ) {
          proveedor.fechaVencimiento = fechaVencimiento;
        }

        if (fechaVencimiento) {
          proveedor.tieneFechas = true;
        }

        // Consolidar estado
        if (vencido) {
          proveedor.tieneVencidos = true;
        }
      }
    }

    // Preparar respuesta y ordenar por mayor deuda
    const datos = Array.from(carteraPorProveedor.values())
      .map(({ tieneVencidos, tieneFechas, ...proveedor }) => ({
        ...proveedor,
        estado: tieneVencidos
          ? "VENCIDO"
          : tieneFechas
            ? "PENDIENTE"
            : "SIN_FECHA",
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 4);

    return NextResponse.json({
      datos,
    });
  } catch (error) {
    console.error("Error obteniendo cartera de proveedores:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
