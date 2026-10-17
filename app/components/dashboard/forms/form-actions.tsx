interface FormActionsProps {
  isLoading: boolean;
  mode: "create" | "edit";
  createText: string;
  facturarText: string;
  editText?: string;
  cancelText?: string;
}

export default function FormActions({
  isLoading,
  mode,
  createText,
  facturarText,
  editText = "Guardar cambios",
  cancelText = "Cancelar",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pb-6 font-inter">
      <button
        type="button"
        className="rounded-lg border border-gray-300 px-5 text-sm py-2 bg-white text-fifth-gray transition hover:opacity-70"
        onClick={() => window.history.back()}
      >
        {cancelText}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        name="estado"
        value="POR_FACTURAR"
        className="rounded-lg bg-primary-green px-6 py-3 text-sm font-medium text-white transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Cargando..." : facturarText}
      </button>
      <button
        type="submit"
        disabled={isLoading}
        name="estado"
        value={mode === "edit" ? "MANTENER_ESTADO" : "BORRADOR"}
        className="rounded-lg bg-primary-blue px-6 py-3 text-sm font-medium text-white transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Cargando..." : mode === "edit" ? editText : createText}
      </button>
    </div>
  );
}
