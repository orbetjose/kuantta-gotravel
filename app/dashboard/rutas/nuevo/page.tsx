import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import RouteForm from "@/app/components/dashboard/forms/routes-form";

export default async function RutasNuevoPage() {
  try {
    await requirePermission("rutas", "create");
  } catch {
    redirect("/dashboard");
  }
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Rutas</span>
        <h2 className="text-third-gray text-4xl">Creación de rutas</h2>
      </div>
      <RouteForm />
    </div>
  );
}
