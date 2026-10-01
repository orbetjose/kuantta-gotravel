"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth-actions";
import Link from "next/link";
import { registerSchema, type RegisterFormData } from "@/libs/zod";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setConfirmPasswordError(null);

    if (data.password !== data.confirmPassword) {
      setConfirmPasswordError("La contraseña no coincide");
      return;
    }

    startTransition(async () => {
      const response = await registerAction(data);

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Ocurrió un error");
        return;
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white/40 p-8 shadow-lg font-inter">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Crear una cuenta</h1>

          <p className="mt-2 text-sm text-white">Regístrate para comenzar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm  text-white">
              Nombre
            </label>

            <input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              {...register("name")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                errors.name
                  ? "border-red-800 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.name && (
              <p className="mt-1.5 text-sm text-red-800">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm  text-white">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="juan@email.com"
              {...register("email")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                errors.email
                  ? "border-red-800 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.email && (
              <p className="mt-1.5 text-sm text-red-800">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm  text-white"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                errors.password
                  ? "border-red-800 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {errors.password && (
              <p className="mt-1.5 text-sm text-red-800">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm  text-white"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                errors.confirmPassword || confirmPasswordError
                  ? "border-red-800 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {(errors.confirmPassword || confirmPasswordError) && (
              <p className="mt-1.5 text-sm text-red-800">
                {confirmPasswordError || errors.confirmPassword?.message}
              </p>
            )}
          </div>

          {/* Error general */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-center text-sm text-white">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className=" text-white hover:text-blue-700 underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
