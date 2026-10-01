import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
}: SearchInputProps) {
  return (
    <>      
      <div className={`relative ${className}`}>
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fifth-gray/60"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg bg-inputs py-3 pl-10 pr-4 font-inter text-sm text-fifth-gray outline-none placeholder:text-fifth-gray focus:ring-2 focus:ring-primary-blue"
        />
      </div>
    </>
  );
}
