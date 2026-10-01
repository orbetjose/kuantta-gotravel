import ClientForm from "@/app/components/dashboard/client-form";

export default function page() {
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Clientes</span>
        <h2 className="text-third-gray text-5xl">Creación de cliente</h2>
      </div>
      <ClientForm />
    </div>
  );
}
