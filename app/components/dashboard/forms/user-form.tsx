"use client";

import { createUser, updateUser } from "@/actions/auth-actions";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormInput from "@/app/components/dashboard/ui/FormInput";
import FormSelect from "@/app/components/dashboard/ui/FormSelect";
import FormActions from "./form-actions";
import { Eye, EyeClosed } from "lucide-react";

import { registerSchema, updateSchema, type UserFormData } from "@/libs/zod";

type UserFormProps = {
  mode?: "create" | "edit";
  userId?: string;
  initialData?: {
    name: string;
    email: string;
    role: "ASESOR" | "FACTURADOR" | "ADMINISTRADOR";
  };
};

export default function UserForm({
  mode = "create",
  userId,
  initialData,
}: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const schema = mode === "create" ? registerSchema : updateSchema;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, touchedFields },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      role: initialData?.role ?? "ASESOR",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const showPasswordMismatch =
    touchedFields.password &&
    touchedFields.confirmPassword &&
    password &&
    confirmPassword &&
    password !== confirmPassword;

  function generatePassword() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

    const password = Array.from({ length: 12 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");

    setValue("password", password, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("confirmPassword", password, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  async function onSubmit(data: UserFormData) {
    setIsLoading(true);

    if (mode === "edit" && userId) {
      const result = await updateUser(userId, data);

      if (!result.success) {
        console.error(result.error);
        return;
      }

      router.push(`/dashboard/administracion/usuarios/${userId}`);
      router.refresh();
      return;
    }

    const result = await createUser(data);

    if (!result.success) {
      console.error(result.error);
      return;
    }

    router.push(`/dashboard/administracion/usuarios`);
    router.refresh();
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-4"
    >
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 font-inter text-lg font-semibold text-fifth-gray">
          Información del cliente
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormInput
            label="Nombre"
            name="name"
            registration={register("name")}
            placeholder="Ingresa el nombre"
            required
            error={errors.name?.message}
          />

          <FormInput
            label="Correo"
            name="email"
            type="email"
            registration={register("email")}
            placeholder="correo@ejemplo.com"
            required
            error={errors.email?.message}
          />

          <div>
            <label className="mb-2 block font-inter text-sm font-medium text-fifth-gray">
              Contraseña
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Ingresa la contraseña"
                  className="w-full rounded-lg bg-inputs px-4 py-3 font-inter text-sm text-fifth-gray outline-none placeholder:text-fifth-gray/50 focus:ring-2 focus:ring-primary-blue"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <Eye /> : <EyeClosed />}
                </button>
              </div>

              <button
                type="button"
                onClick={generatePassword}
                className="rounded-lg bg-primary-blue px-6 py-3 font-inter text-sm font-medium text-white transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generar
              </button>

              <button
                type="button"
                onClick={async () => {
                  const password = getValues("password");

                  if (!password) return;

                  await navigator.clipboard.writeText(password);

                  setIsCopied(true);

                  setTimeout(() => {
                    setIsCopied(false);
                  }, 2000);
                }}
                className="rounded-lg bg-[#bfc0c14d] text-sm px-4 font-inter text-fifth-gray"
              >
                {isCopied ? "✓ Copiada" : "Copiar"}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <FormInput
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            registration={register("confirmPassword")}
            placeholder="Confirma la contraseña"
            required
            error={
              errors.confirmPassword?.message ??
              (showPasswordMismatch
                ? "Las contraseñas no coinciden"
                : undefined)
            }
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormSelect
                label="Role"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: "ASESOR", label: "Asesor" },
                  { value: "FACTURADOR", label: "Facturador" },
                  { value: "ADMINISTRADOR", label: "Administrador" },
                ]}
                error={errors.role?.message}
              />
            )}
          />
        </div>
      </section>

      <FormActions
        isLoading={isLoading}
        mode={mode}
        createText="Crear usuario"
      />
    </form>
  );
}
