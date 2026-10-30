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
      <div className="h-16 px-4 rounded-3xl flex items-center justify-end lg:justify-between bg-primary-gray relative">
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

        {/* User */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          <div className="text-right">
            <p className="text-sm font-bold text-primary-blue capitalize">
              Hola, {user.name}
            </p>
            <span className="text-sm text-primary-green font-bold uppercase ">
              {user.role}
            </span>
          </div>

          <div className="h-11 w-11 overflow-hidden rounded-full bg-primary-green ">
            <img
              src="/assets/images/ico-user.png"
              alt="Juan Pérez"
              className="object-cover p-2"
            />
            <ChevronDown
              size={16}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
          {isOpen && (
            <div className="absolute right-4 top-[90%] z-50 w-48 bg-primary-gray rounded-b-xl p-2 shadow-lg font-inter">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:opacity-70"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
