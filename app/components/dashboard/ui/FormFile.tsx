import { FileText, Plus, X } from "lucide-react";

type FormFileProps = {
  label: string;
  name: string;
  value?: File | File[];
  onChange: (file: File | File[] | undefined) => void;
  required?: boolean;
  error?: string;
  accept?: string;
  acceptLabel?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
};

export default function FormFile({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  accept,
  acceptLabel = "PDF",
  disabled = false,
  multiple = false,
  maxFiles = 4,
}: FormFileProps) {
  const files = value ? (Array.isArray(value) ? value : [value]) : [];

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
        className={`relative flex min-h-12 w-full items-center justify-between rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray transition ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-inputs/80"
        } ${error ? "ring-2 ring-red-400" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {multiple ? (
            <span className="text-fifth-gray/60">
              Seleccionar archivos ({files.length}/{maxFiles})
            </span>
          ) : files[0] ? (
            <>
              <FileText className="h-4 w-4 shrink-0 text-primary-blue" />
              <span className="truncate" title={files[0].name}>
                {files[0].name}
              </span>
            </>
          ) : (
            <span className="text-fifth-gray/50">
              Seleccionar archivo
            </span>
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
          multiple={multiple}
          disabled={disabled || (multiple && files.length >= maxFiles)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(event.target.files ?? []);

            if (!multiple) {
              onChange(selectedFiles[0]);
            } else {
              const remaining = maxFiles - files.length;
              const newFiles = selectedFiles.slice(0, remaining);
              onChange([...files, ...newFiles]);
            }

            event.target.value = "";
          }}
        />
      </div>

      {multiple && files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-inputs px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-primary-blue" />
                <span className="truncate" title={file.name}>
                  {file.name}
                </span>
              </span>

              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(files.filter((_, i) => i !== index))
                }
                className="shrink-0 text-red-500 disabled:opacity-50"
                aria-label={`Eliminar ${file.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!multiple && (
        <p className="font-inter text-xs text-fifth-gray/60">Formatos permitidos: {acceptLabel}</p>
      )}

      {multiple && (
        <p className="font-inter text-xs text-fifth-gray/60">
           Máximo {maxFiles} archivos. Formatos: {acceptLabel}.
        </p>
      )}

      {error && (
        <p className="font-inter text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}