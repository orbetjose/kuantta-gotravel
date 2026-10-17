import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) { 
  const { searchParams } = new URL(request.url);

  const id = searchParams.get("id");
  const search = searchParams.get("q")?.trim() ?? "";

  try {
    if (id !== null) {
      const clienteId = Number(id);

      if (!Number.isInteger(clienteId) || clienteId <= 0) {
        return NextResponse.json(
          { error: "ID de cliente inválido." },
          { status: 400 },
        );
      }

      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: {
          id: true,
          nombre: true,
          razonSocial: true,
          documento: true,
          tipoDocumento: true,
          correo: true,
          telefono: true,
        },
      });

      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente no encontrado." },
          { status: 404 },
        );
      }

      return NextResponse.json(cliente);
    }

    // Buscar clientes por texto
    if (search.length < 2) {
      return NextResponse.json([]);
    }
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          {
            nombre: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            razonSocial: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            correo: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        nombre: "asc",
      },
      take: 10,
      select: {
        id: true,
        nombre: true,
        razonSocial: true,
        documento: true,
        tipoDocumento: true,
        correo: true,
        telefono: true,
      },
    });

    return NextResponse.json(
      clientes.map((cliente) => ({
        value: String(cliente.id),
        label: `${cliente.nombre ?? ""}`,
        razonSocial: cliente.razonSocial,
        tipoDocumento: cliente.tipoDocumento,
        documento: cliente.documento,
        correo: cliente.correo,
        telefono: cliente.telefono,
      })),
    );
  } catch (error) {
    console.error("Error consultando clientes:", error);

    return NextResponse.json(
      { error: "No se pudieron consultar los clientes." },
      { status: 500 },
    );
  }
}
