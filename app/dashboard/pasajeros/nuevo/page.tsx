import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import PasajeroForm from "@/app/components/dashboard/forms/pasajero-form";

export default async function PasajerosNuevoPage() {
  try {
    await requirePermission("pasajeros", "create");
  } catch {
    redirect("/dashboard");
  }
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Pasajeros</span>
        <h2 className="text-third-gray text-4xl">Creación de pasajeros</h2>
      </div>
      <PasajeroForm />
    </div>
  );
}
