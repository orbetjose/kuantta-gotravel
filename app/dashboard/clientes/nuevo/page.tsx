import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import ClientForm from "@/app/components/dashboard/forms/client-form";

export default async function page() {
  try {
    await requirePermission("clientes", "create");
  } catch {
    redirect("/dashboard/clientes");
  }
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Clientes</span>
        <h2 className="text-third-gray text-4xl">Creación de cliente</h2>
      </div>
      <ClientForm />
    </div>
  );
}
