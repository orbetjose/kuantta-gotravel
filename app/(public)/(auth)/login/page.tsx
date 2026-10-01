import { auth } from "@/auth";
import { redirect } from "next/navigation";

import LoginForm from "@/app/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="bg-body bg-center bg-cover">
      <div className="mx-auto flex md:flex-row flex-col h-full max-w-6xl 3xl:max-w-7xl items-center gap-6 md:gap-8 px-6 lg:px-8 md:pt-10 pt-24 pb-4">
        <section className="flex md:w-1/2 flex-col justify-center gap-6">
          <div className="flex flex-col justify-center gap-4">
            <h1 className="text-[clamp(1.5rem,3vw,3rem)] font-bold leading-tight tracking-tight text-white md:w-4/5 3xl:w-auto">
              TU AGENCIA MERECE OPERAR SIN CAOS VENTAS Y{" "}
              <span className="text-primary-green">
                FACTURACIÓN EN UN SOLO LUGAR.
              </span>
            </h1>
          </div>
          <div>
            <img
              src="/assets/images/logo_kuantta.png"
              className="h-10 md:h-28 md:-ml-6"
              alt=""
            />
            <p className="text-white md:max-w-xs mt-2">
              Lleva tu agencia al siguiente nivel gestiona ventas y facturación
              desde una sola app
            </p>
          </div>
        </section>
        <section className="md:w-1/2">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
