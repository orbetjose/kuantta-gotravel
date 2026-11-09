"use client";

import { usePathname } from "next/navigation";
import { getDashboardTitle } from "@/libs/helpers";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";

type DashboardNavbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    image?: string | null;
  };
};

export default function DashboardNavbar({ user }: DashboardNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();
  const title = getDashboardTitle(pathname);

  return (
    <header className="md:px-8 px-2 pt-4 font-inter">
      <div className="h-16 ps-4 rounded-3xl flex items-center justify-end lg:justify-between bg-primary-gray relative">
        {/* Logo */}
        <div className=" items-center hidden lg:flex">
          <img
            className="md:h-10 h-6 "
            src="/assets/images/logo_gotravel.png"
            alt=""
          />
        </div>

        {/* Module title */}
        <div className="text-center hidden lg:block">
          <h1 className="text-lg font-bold text-primary-blue">{title}</h1>
        </div>

        <div className="min-w-40" />

        {/* User */}
        <div
          className={`absolute top-0 right-0 flex flex-col cursor-pointer px-2 overflow-hidden transition-all duration-300 ${
            isOpen ? "bg-secondary-blue rounded-3xl" : "rounded-r-3xl"
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          {/* Información del usuario */}
          <div className="flex h-full items-center gap-3 py-2">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <ChevronDown
                  size={20}
                  className={`transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
                <p className="text-sm font-bold text-primary-blue capitalize">
                  Hola, {user.name}
                </p>
              </div>

              <span
                className={`text-xs font-bold ${
                  isOpen ? "text-primary-blue" : "text-secondary-blue"
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-secondary-blue">
              <img
                src="/assets/images/ico-user.png"
                alt="Juan Pérez"
                className="object-cover"
              />
            </div>
          </div>

          {/* Menú desplegable */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden flex ">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex w-full justify-center items-center gap-3 px-3 py-3 text-sm font-medium text-white transition-opacity hover:opacity-70 cursor-pointer"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
