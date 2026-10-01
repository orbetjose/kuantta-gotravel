import type { UseFormRegisterReturn } from "react-hook-form";

type FormDateProps = {
  label: string;
  name: string;
  registration?: UseFormRegisterReturn;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

export default function FormDate({
  label,
  name,
  registration,
  required = false,
  error,
  disabled = false,
}: FormDateProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={registration?.name}
        className="block font-inter text-sm font-medium text-fifth-gray"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        {...registration}
        id={registration?.name}
        name={name}
        type="date"
        disabled={disabled}
        className={`w-full rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray outline-none transition
          focus:ring-2 focus:ring-primary-blue
          disabled:cursor-not-allowed disabled:opacity-60
          ${error ? "ring-2 ring-red-400" : ""}
        `}
      />

      {error && <p className="font-inter text-xs text-red-500">{error}</p>}
    </div>
  );
}
