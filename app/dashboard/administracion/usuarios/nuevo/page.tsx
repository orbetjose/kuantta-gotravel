import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";
import UserForm from "@/app/components/dashboard/forms/user-form";

export default async function NuevoUsuario() {
  try {
    await requirePermission("usuarios", "create");
  } catch {
    redirect("/dashboard");
  }
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Usuarios</span>
        <h2 className="text-third-gray text-5xl">Creación de usuarios</h2>
      </div>
      <UserForm />
    </div>
  );
}
