import { FileText, Plus } from "lucide-react";

type FormFileProps = {
  label: string;
  name: string;
  value?: File;
  onChange: (file: File | undefined) => void;
  required?: boolean;
  error?: string;
  accept?: string;
  disabled?: boolean;
};

export default function FormFile({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  accept,
  disabled = false,
}: FormFileProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block font-inter text-sm font-medium text-fifth-gray"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div
        className={`relative flex min-h-12 w-full items-center justify-between rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray transition
          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-inputs/80"
          }
          ${error ? "ring-2 ring-red-400" : ""}
        `}
      >
        <div className="flex min-w-0 items-center gap-2">
          {value ? (
            <>
              <FileText className="h-4 w-4 shrink-0 text-primary-blue" />

              <span className="truncate" title={value.name}>
                {value.name}
              </span>
            </>
          ) : (
            <span className="text-fifth-gray/50">Seleccionar archivo</span>
          )}
        </div>

        <div className="rounded-full bg-primary-blue">
          <Plus className="h-4 w-4 shrink-0 p-1 text-primary-green" />
        </div>

        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            onChange(file);
          }}
        />
      </div>

      <p className="font-inter text-xs text-fifth-gray/60">PDF</p>

      {error && <p className="font-inter text-xs text-red-500">{error}</p>}
    </div>
  );
}
