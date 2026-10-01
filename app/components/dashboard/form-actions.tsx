interface FormActionsProps {
  isLoading: boolean;
  mode: "create" | "edit";
  createText: string;
  editText?: string;
  cancelText?: string;
}

export default function FormActions({
  isLoading,
  mode,
  createText,
  editText = "Guardar cambios",
  cancelText = "Cancelar",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pb-6">
      <button
        type="button"
        className="rounded-lg border border-gray-300 px-5 py-2 font-bold bg-white text-black transition hover:opacity-70"
        onClick={() => window.history.back()}
      >
        {cancelText}
      </button>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-primary-blue px-6 py-3 font-inter text-sm font-medium text-white transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Cargando..."
          : mode === "edit"
            ? editText
            : createText}
      </button>
    </div>
  );
}