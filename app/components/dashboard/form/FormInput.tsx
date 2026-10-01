import type { UseFormRegisterReturn } from "react-hook-form";

type FormInputProps = {
  label: string;
  name: string;
  registration?: UseFormRegisterReturn;
  type?: "text" | "number";
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: number;
  step?: number;
};

export default function FormInput({
  label,
  registration,
  name,
  type,
  placeholder,
  required = false,
  error,
  disabled = false,
  min,
  step,
}: FormInputProps) {
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
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        className="w-full rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray outline-none placeholder:text-fifth-gray/50 focus:ring-2 focus:ring-primary-blue"
      />
      {error && <p className="font-inter text-xs text-red-500">{error}</p>}
    </div>
  );
}
