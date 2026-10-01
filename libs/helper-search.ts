import { prisma } from "@/libs/prisma";

export async function getSearchIds(search: string) {
  if (!search) {
    return {
      clientesEncontrados: [],
      proveedoresEncontrados: [],
    };
  }

  const clientes = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id
    FROM "Cliente"
    WHERE
      unaccent(lower(nombre)) LIKE unaccent(lower(${`%${search}%`}))
      OR
      unaccent(lower(apellido)) LIKE unaccent(lower(${`%${search}%`}))
  `;

  const proveedores = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id
    FROM "Proveedor"
    WHERE
      unaccent(lower("razonSocial")) LIKE unaccent(lower(${`%${search}%`}))
  `;

  return {
    clientesEncontrados: clientes.map((cliente) => cliente.id),
    proveedoresEncontrados: proveedores.map((proveedor) => proveedor.id),
  };
}
