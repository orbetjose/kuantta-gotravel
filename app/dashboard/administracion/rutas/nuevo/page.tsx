import RouteForm from "@/app/components/dashboard/routes-form";

export default function page() {
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Proveedores</span>
        <h2 className="text-third-gray text-5xl">Creación de proveedores</h2>
      </div>
      <RouteForm />
    </div>
  );
}
