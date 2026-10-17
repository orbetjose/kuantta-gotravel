
import type { UseFormRegisterReturn } from "react-hook-form";

type FormInputProps = {
  label: string;
  name: string;
  registration?: UseFormRegisterReturn;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  step?: number;
};

export default function FormInput({
  label,
  registration,
  name,
  type = "text",
  value,
  readOnly = false,
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
        htmlFor={name}
        className="block font-inter text-sm font-medium text-fifth-gray"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        {...registration}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        step={step}
        {...(value !== undefined ? { value } : {})}
        className={`w-full rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray outline-none placeholder:text-fifth-gray/50 focus:ring-2 focus:ring-primary-blue ${
          readOnly ? "cursor-default focus:ring-transparent" : ""
        }`}
      />

      {error && (
        <p className="font-inter text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
