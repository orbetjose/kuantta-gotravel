import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import ProviderForm from "@/app/components/dashboard/forms/provider-form";

export default async function page() {
  try {
    await requirePermission("proveedores", "create");
  } catch {
    redirect("/dashboard");
  }
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Proveedores</span>
        <h2 className="text-third-gray text-4xl">Creación de proveedores</h2>
      </div>
      <ProviderForm />
    </div>
  );
}
