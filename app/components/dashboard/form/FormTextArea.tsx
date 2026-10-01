import type { UseFormRegisterReturn } from "react-hook-form";

type FormTextareaProps = {
  label: string;
  name: string;
  placeholder?: string;
  registration?: UseFormRegisterReturn;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
};

export default function FormTextarea({
  label,
  name,
  registration,
  placeholder,
  required = false,
  error,
  disabled = false,
  maxLength,
  rows = 4,
}: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={registration?.name}
        className="block font-inter text-sm font-medium text-fifth-gray"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        {...registration}
        id={registration?.name}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={`w-full resize-y rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray outline-none transition
          placeholder:text-fifth-gray/50
          focus:ring-2 focus:ring-primary-blue
          disabled:cursor-not-allowed disabled:opacity-60
          ${error ? "ring-2 ring-red-400" : ""}
        `}
      />

      {maxLength && (
        <p className="text-right font-inter text-xs text-fifth-gray/60">
          Máximo {maxLength} caracteres
        </p>
      )}

      {error && <p className="font-inter text-xs text-red-500">{error}</p>}
    </div>
  );
}
