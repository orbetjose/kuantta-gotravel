"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

type FormComboBoxOption = {
  value: string;
  label: string;
};

type FormComboBoxProps = {
  label: string;
  name: string;
  value: string;
  searchEndpoint?: string;
  onChange: (value: string) => void;
  options: FormComboBoxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

export default function FormComboBox({
  label,
  name,
  value,
  searchEndpoint,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  required = false,
  error,
  disabled = false,
}: FormComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FormComboBoxOption[]>([]);
  const isSearching = search.trim().length >= 2;
  const comboBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = isSearching ? searchResults : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        comboBoxRef.current &&
        !comboBoxRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open) {
      searchInputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`${searchEndpoint}?q=${encodeURIComponent(query)}`)

        if (!response.ok) {
          throw new Error("Error buscando ");
        }

        const data = await response.json();


        setSearchResults(data);
      } catch (error) {
        console.error("Error buscando clientes:", error);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  function handleOpen() {
    if (disabled) return;

    setOpen((prev) => !prev);

    if (open) {
      setSearch("");
    }
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block font-inter text-sm font-medium text-fifth-gray"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div ref={comboBoxRef} className="relative">
        <button
          id={name}
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          className={`flex w-full items-center justify-between rounded-lg bg-inputs px-4 py-3 text-left font-inter text-sm outline-none transition
            ${selectedOption ? "text-fifth-gray" : "text-fifth-gray/50"}
            ${open ? "ring-2 ring-blue-500" : ""}
            ${error ? "ring-2 ring-red-400" : ""}
            ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
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
            {/* Buscador */}
            <div className="border-b border-gray-100 p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fifth-gray/50" />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-md bg-inputs py-2 pl-9 pr-3 font-inter text-sm text-fifth-gray outline-none placeholder:text-fifth-gray/50 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Opciones */}
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
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
                      <span className="truncate">{option.label}</span>

                      {isSelected && (
                        <Check className="ml-3 h-4 w-4 shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-3 font-inter text-sm text-fifth-gray/60">
                  No se encontraron resultados
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="font-inter text-xs text-red-500">{error}</p>}
    </div>
  );
}
