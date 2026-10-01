"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Building2,
  UserRound,
  ReceiptText,
  ChartNoAxesCombined,
  WalletCards,
  Settings2,
  Monitor,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    type: "link",
  },
  {
    label: "Servicios",
    href: "/dashboard/servicios",
    icon: BriefcaseBusiness,
    type: "dropdown",
    items: [
      {
        label: "Todos",
        href: "/dashboard/servicios/",
      },
      {
        label: "Hotel",
        href: "/dashboard/servicios/hotel",
      },
      {
        label: "Tiquete",
        href: "/dashboard/servicios/tiquete",
      },

      {
        label: "Alquiler auto",
        href: "/dashboard/servicios/alquiler-auto",
      },
      {
        label: "Salón",
        href: "/dashboard/servicios/salon",
      },
      {
        label: "Evento",
        href: "/dashboard/servicios/evento",
      },
      {
        label: "Silla",
        href: "/dashboard/servicios/silla",
      },
      {
        label: "Tarjeta asistencia",
        href: "/dashboard/servicios/tarjeta-asistencia",
      },
      {
        label: "Traslado",
        href: "/dashboard/servicios/traslado",
      },
      {
        label: "Visa",
        href: "/dashboard/servicios/visa",
      },
      {
        label: "Web check-in",
        href: "/dashboard/servicios/web-checkin",
      },
      {
        label: "Plan vacacional",
        href: "/dashboard/servicios/plan-vacacional",
      },
    ],
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
    type: "link",
  },
  {
    label: "Proveedores",
    href: "/dashboard/proveedores",
    icon: Building2,
    type: "link",
  },
  {
    label: "Pasajeros",
    href: "/dashboard/pasajeros",
    icon: UserRound,
    type: "link",
  },
  {
    label: "Facturación",
    href: "/dashboard/facturacion",
    icon: ReceiptText,
    type: "link",
  },
  {
    label: "Reportes",
    href: "/dashboard/reportes",
    icon: ChartNoAxesCombined,
    type: "link",
  },
  {
    label: "Cartera",
    href: "/dashboard/cartera",
    icon: WalletCards,
    type: "link",
  },
  {
    label: "Administración",
    href: "/dashboard/administracion",
    icon: Settings2,
    type: "dropdown",
    items: [
      {
        label: "Rutas",
        href: "/dashboard/administracion/rutas",
      },
    ],
  },
  {
    label: "Kuantta Desk",
    href: "/dashboard/kuantta-desk",
    icon: Monitor,
    type: "link",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu(href: string) {
    setOpenMenus((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href],
    );
  }

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
          flex w-64 flex-col
          bg-sidebar bg-cover bg-center bg-primary-blue
          font-inter text-white
          transition-transform duration-300

          lg:static lg:h-screen lg:translate-x-0

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center px-6">
          <Link href="/dashboard">
            <img
              className="h-14"
              src="/assets/images/logo_kuantta.png"
              alt=""
            />
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 overflow-y-auto 3xl:overflow-y-hidden">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              const isOpen = openMenus.includes(item.href);

              if (item.type === "dropdown") {
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.href)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                          : "text-white hover:bg-third-green/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />

                        <span>{item.label}</span>
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="ml-2 mt-1 max-h-50 space-y-1 overflow-y-auto">
                        {item.items?.map((subItem) => {
                          const isSubItemActive = pathname === subItem.href;

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
                  </li>
                );
              }

              return (
                <li className="flex" key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex w-full items-center gap-4 px-4 py-2 font-normal transition ${
                      isActive
                        ? "border-l-3 border-third-green bg-secondary-green/20 text-third-green"
                        : "text-white hover:bg-third-green/20"
                    }`}
                  >
                    <Icon className="h-5 w-5" />

                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="space-y-2 ">
          <Link
            href="/dashboard/ajustes"
            className="flex gap-4 w-full items-center px-4 py-2 text-white hover:bg-third-green/20"
          >
            <Settings className="h-5 w-5" />
            Ajustes
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex gap-4 w-full items-center px-4 py-2 text-white hover:bg-third-green/20"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
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
