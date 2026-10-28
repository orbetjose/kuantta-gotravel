import "server-only";

import { auth } from "@/auth";
import type { Resource, Action } from "@/libs/permissions";
import { can } from "@/libs/permissions";

export async function obtenerUsuarioActual() {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id,
    role: session.user.role,
  };
}

export async function requirePermission(resource: Resource, action: Action) {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    throw new Error("No autenticado");
  }

  if (!can(usuario.role, resource, action)) {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  return usuario;
}
