"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  ReceiptText,
  ChartNoAxesCombined,
  WalletCards,
  Settings2,
  Monitor,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { can, type Resource, type Action } from "@/libs/permissions";
import { SidebarTooltip } from "./ui/sidebar-tooltip";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  type: "link" | "dropdown";
  resource: Resource;
  action: Action;
  items?: {
    label: string;
    href: string;
    resource: Resource;
    action: Action;
  }[];
};

type SidebarProps = {
  role: "ASESOR" | "FACTURADOR" | "ADMINISTRADOR";
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    type: "link",
    resource: "dashboard",
    action: "view",
  },
  {
    label: "Notas",
    href: "/dashboard/notas",
    icon: NotebookPen,
    type: "link",
    resource: "notas",
    action: "view",
  },
  {
    label: "Servicios",
    href: "/dashboard/servicios",
    icon: BriefcaseBusiness,
    type: "dropdown",
    resource: "servicios",
    action: "view",
    items: [
      {
        label: "Todos",
        href: "/dashboard/servicios/",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Hotel",
        href: "/dashboard/servicios/hotel",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Tiquete",
        href: "/dashboard/servicios/tiquete",
        resource: "servicios",
        action: "view",
      },

      {
        label: "Alquiler auto",
        href: "/dashboard/servicios/alquiler-auto",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Salón",
        href: "/dashboard/servicios/salon",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Evento",
        href: "/dashboard/servicios/evento",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Silla",
        href: "/dashboard/servicios/silla",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Tarjeta asistencia",
        href: "/dashboard/servicios/tarjeta-asistencia",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Traslado",
        href: "/dashboard/servicios/traslado",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Visa",
        href: "/dashboard/servicios/visa",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Web check-in",
        href: "/dashboard/servicios/web-checkin",
        resource: "servicios",
        action: "view",
      },
      {
        label: "Plan vacacional",
        href: "/dashboard/servicios/plan-vacacional",
        resource: "servicios",
        action: "view",
      },
    ],
  },
  {
    label: "Gestión",
    href: "/dashboard/gestion",
    icon: Users,
    type: "dropdown",
    resource: "gestion",
    action: "view",
    items: [
      {
        label: "Clientes",
        href: "/dashboard/clientes/",
        resource: "clientes",
        action: "view",
      },
      {
        label: "Proveedores",
        href: "/dashboard/proveedores/",
        resource: "proveedores",
        action: "view",
      },
      {
        label: "Pasajeros",
        href: "/dashboard/pasajeros/",
        resource: "pasajeros",
        action: "view",
      },
      {
        label: "Rutas",
        href: "/dashboard/rutas/",
        resource: "rutas",
        action: "view",
      },
    ],
  },
  {
    label: "Facturación",
    href: "/dashboard/facturacion",
    icon: ReceiptText,
    type: "link",
    resource: "facturacion",
    action: "view",
  },
  {
    label: "Reportes",
    href: "/dashboard/reportes",
    icon: ChartNoAxesCombined,
    type: "link",
    resource: "reportes",
    action: "view",
  },
  {
    label: "Cartera",
    href: "/dashboard/cartera",
    icon: WalletCards,
    type: "link",
    resource: "cartera",
    action: "view",
  },
  {
    label: "Administración",
    href: "/dashboard/administracion",
    icon: Settings2,
    type: "dropdown",
    resource: "administracion",
    action: "view",
    items: [
      {
        label: "Usuarios",
        href: "/dashboard/administracion/usuarios",
        resource: "administracion",
        action: "view",
      },
    ],
  },
  {
    label: "Kuantta Desk",
    href: "/dashboard/kuantta-desk",
    icon: Monitor,
    type: "link",
    resource: "kuanttaDesk",
    action: "view",
  },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  function toggleMenu(href: string) {
    setOpenMenus((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href],
    );
  }

  const filteredMenuItems = menuItems
    .filter((item) => can(role, item.resource, item.action))
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) =>
        can(role, subItem.resource, subItem.action),
      ),
    }))
    .filter(
      (item) => item.type !== "dropdown" || (item.items?.length ?? 0) > 0,
    );

  function handleDropdownClick(href: string) {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenMenus((prev) => (prev.includes(href) ? prev : [...prev, href]));
      return;
    }

    toggleMenu(href);
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px) and (max-height: 750px)",
    );

    const actualizarEstado = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsCollapsed(event.matches);
    };

    actualizarEstado(mediaQuery);

    mediaQuery.addEventListener("change", actualizarEstado);

    return () => {
      mediaQuery.removeEventListener("change", actualizarEstado);
    };
  }, []);

  return (
    <>
      {/* Botón para abrir en mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-7 z-30 rounded-lg p-2 lg:hidden"
      >
        <Menu className="h-7 w-7" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-sidebar bg-cover bg-center bg-primary-blue
          font-inter text-white
          transition-[width,transform] duration-300

          lg:static lg:h-screen lg:translate-x-0
          ${isCollapsed ? "lg:w-16 2xl:w-16" : "lg:w-52 2xl:w-50"}

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div
          className={`flex h-16 shrink-0 items-center ${
            isCollapsed ? "justify-center px-2" : "px-6"
          }`}
        >
          <Link href="/dashboard">
            {isCollapsed ? (
              <span className="text-3xl font-bold text-white">K</span>
            ) : (
              <img
                className="h-14"
                src="/assets/images/logo_kuantta.png"
                alt="Kuantta"
              />
            )}
          </Link>
        </div>
        <div className="hidden shrink-0 border-t border-white/10 p-3 lg:flex lg:justify-center">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
            aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={24} />
            ) : (
              <PanelLeftClose size={24} />
            )}
          </button>
        </div>
        {/* Menu */}
        <nav className="flex-1 overflow-y-auto 3xl:overflow-y-hidden">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              const isOpen = openMenus.includes(item.href);

              if (item.type === "dropdown") {
                return (
                  <li key={item.href} className="relative">
                    {isCollapsed ? (
                      <SidebarTooltip label={item.label}>
                        <button
                          type="button"
                          onClick={() => handleDropdownClick(item.href)}
                          className={`flex w-full items-center justify-center px-2 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                              : "text-white hover:bg-third-green/20"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                        </button>
                      </SidebarTooltip>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDropdownClick(item.href)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                              : "text-white hover:bg-third-green/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 shrink-0" />
                            <span>{item.label}</span>
                          </div>

                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className={`space-y-1`}>
                            {item.items?.map((subItem) => {
                              const isSubItemActive =
                                pathname === subItem.href ||
                                pathname.startsWith(`${subItem.href}/`);

                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setIsOpen(false)}
                                  className={`block px-4 py-2 text-sm transition-colors ${
                                    isSubItemActive
                                      ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                                      : "text-white hover:bg-third-green/20"
                                  }`}
                                >
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </li>
                );
              }

              return isCollapsed ? (
                <li className="flex justify-center" key={item.href}>
                  <SidebarTooltip label={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group relative flex w-full items-center py-3 text-sm font-normal transition ${
                        isCollapsed ? "justify-center px-2" : "gap-4 px-4"
                      } ${
                        isActive
                          ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                          : "text-white hover:bg-third-green/20"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />

                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </SidebarTooltip>
                </li>
              ) : (
                <li className="flex" key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group relative flex w-full items-center py-3 text-sm font-normal transition ${
                      isCollapsed ? "justify-center px-2" : "gap-4 px-4"
                    } ${
                      isActive
                        ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                        : "text-white hover:bg-third-green/20"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />

                    {!isCollapsed && <span>{item.label}</span>}

                    {isCollapsed && (
                      <span className="pointer-events-none absolute left-full top-1/2 z-70 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>
    </>
  );
}
