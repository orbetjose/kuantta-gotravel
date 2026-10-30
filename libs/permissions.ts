export const permissions = {
  ADMINISTRADOR: {
    dashboard: ["view"],
    servicios: ["view", "create", "edit", "delete", "facturar"],
    gestion: ["view", "create", "edit", "delete"],
    clientes: ["view", "create", "edit", "delete"],
    proveedores: ["view", "create", "edit", "delete"],
    pasajeros: ["view", "create", "edit", "delete"],
    rutas: ["view", "create", "edit", "delete"],
    facturacion: ["view"],
    reportes: ["view"],
    cartera: ["view"],
    administracion: ["view"],
    usuarios: ["view", "create", "edit", "delete"],
    kuanttaDesk: ["view"],
    notas: ["view", "create", "edit"],
  },

  ASESOR: {
    dashboard: ["view"],
    servicios: ["view", "create", "edit"],
    gestion: ["view", "create", "edit", "delete"],
    clientes: ["view", "create", "edit"],
    proveedores: ["view", "create", "edit"],
    pasajeros: ["view", "create", "edit"],
    rutas: ["view", "create", "edit"],
    facturacion: [],
    reportes: [],
    cartera: [],
    administracion: [],
    usuarios: [],
    kuanttaDesk: ["view"],
    notas: ["view", "create", "edit"],
  },

  FACTURADOR: {
    dashboard: ["view"],
    servicios: ["view", "facturar"],
    gestion: ["view"],
    clientes: ["view"],
    proveedores: ["view"],
    pasajeros: [],
    rutas: [],
    facturacion: ["view"],
    reportes: ["view"],
    cartera: [],
    administracion: [],
    usuarios: [],
    kuanttaDesk: ["view"],
    notas: ["view", "create", "edit"],
  },
} as const;

export type Role = keyof typeof permissions;

export type Resource = keyof typeof permissions.ADMINISTRADOR;

export type Action = "view" | "create" | "edit" | "delete" | "facturar";

export function can(role: Role, resource: Resource, action: Action) {
  return permissions[role][resource]?.includes(action as never) ?? false;
}
