"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "@/actions/auth-actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),

  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    startTransition(async () => {
      const response = await loginAction(data);
      if (response?.error) {
        setError("El correo o la contraseña son incorrectos.");
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="flex md:min-h-screen items-center justify-center md:px-4">
      <div className="w-full max-w-md rounded-xl bg-white/40 p-8 shadow-lg font-inter">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Bienvenido a Kuantta
          </h1>

          <p className="mt-2 text-sm text-white">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-white">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="juan@email.com"
              {...register("email")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                ${
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
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm text-white">
                Contraseña
              </label>

              <a
                href="/forgot-password"
                className="text-sm text-white hover:text-white"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                ${
                  errors.password
                    ? "border-red-800 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 focus:border-primary-blue focus:ring-2 focus:ring-blue-100"
                }`}
            />

            {errors.password && (
              <p className="mt-1.5 text-sm text-red-800">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="mt-1.5 text-sm text-red-800">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-white">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-bold text-white hover:text-white underline"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
