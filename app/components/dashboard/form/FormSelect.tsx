"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  required = false,
  error,
  disabled = false,
}: FormSelectProps) {
  const [open, setOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block font-inter text-sm font-medium text-fifth-gray"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div ref={selectRef} className="relative">
        <button
          id={name}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-lg bg-inputs px-4 py-3 text-left font-inter text-sm outline-none transition
            ${
              selectedOption
                ? "text-fifth-gray"
                : "text-fifth-gray/50"
            }
            ${open ? "ring-2 ring-blue-500" : ""}
            ${error ? "ring-2 ring-red-400" : ""}
            ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }
          `}
        >
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>

          <ChevronDown
            className={`ml-3 h-4 w-4 shrink-0 text-fifth-gray/60 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && !disabled && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left font-inter text-sm transition
                        ${
                          isSelected
                            ? "bg-blue-50 text-blue-600"
                            : "text-fifth-gray hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="truncate">
                        {option.label}
                      </span>

                      {isSelected && (
                        <Check className="ml-3 h-4 w-4 shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-3 font-inter text-sm text-fifth-gray/60">
                  No hay opciones disponibles
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="font-inter text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}