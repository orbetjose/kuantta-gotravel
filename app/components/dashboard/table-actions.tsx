"use client";

import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";

export interface TableAction {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface TableActionsProps {
  actions: TableAction[];
}

export default function TableActions({
  actions,
}: TableActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Abrir acciones"
        aria-expanded={isOpen}
        className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-primary-blue transition hover:bg-gray-100 hover:text-gray-900"
      >
        <EllipsisVertical />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {actions.map((action) => {
            if (action.href) {
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 text-sm font-inter transition hover:bg-gray-100 ${
                    action.disabled
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={action.label}
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  action.onClick?.();
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm font-inter transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}