"use client";

import { createPortal } from "react-dom";
import { useState } from "react";

type SidebarTooltipProps = {
  children: React.ReactNode;
  label: string;
};

export function SidebarTooltip({
  children,
  label,
}: SidebarTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    setPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });

    setVisible(true);
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible &&
        createPortal(
          <span
            className="pointer-events-none fixed z-99 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {label}
          </span>,
          document.body
        )}
    </div>
  );
}