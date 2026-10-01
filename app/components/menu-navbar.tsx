"use client"

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Funcionalidades", href: "#funcionalidades" },
    { name: "Precios", href: "#precios" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <>
      <nav className="absolute md:fixed top-0 left-0 z-50 w-full ">        
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="/assets/images/logo_kuantta.png"
              alt="Kuantta"
              className="h-10 w-auto"
            />
          </a>

          {/* Desktop menu */}
          <div className="hidden items-center gap-8 md:flex font-inter">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-white transition hover:text-primary-green"
              >
                {link.name}
              </a>
            ))}

            <a
              href="/login"
              className="rounded-lg bg-primary-green px-3 py-1.5 text-sm font-bold text-white transition hover:bg-primary-blue"
            >
              Solicitar demo
            </a>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 text-white hover:bg-gray-100 md:hidden"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-10 w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </nav>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-70 h-full w-80 bg-primary-blue shadow-xl transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-gray-200 px-6">
          
          {/* Logo */}
          <img
            src="/assets/images/logo_kuantta.png"
            alt="Kuantta"
            className="h-8 w-auto"
          />

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-white "
            aria-label="Cerrar menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar links */}
        <div className="flex flex-col px-6 py-8 font-inter">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="border-b border-gray-100 py-4 text-base font-bold text-white transition "
            >
              {link.name}
            </a>
          ))}

          <a
            href="/login"
            onClick={() => setIsOpen(false)}
            className="mt-8 rounded-lg bg-primary-green px-5 py-3 text-center font-bold text-white transition "
          >
            Solicitar demo
          </a>
        </div>
      </aside>
    </>
  );
}