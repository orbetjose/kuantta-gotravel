import PasajeroForm from "@/app/components/dashboard/pasajero-form";

export default function page() {
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Pasajeros</span>
        <h2 className="text-third-gray text-5xl">Creación de pasajeros</h2>
      </div>
      <PasajeroForm />
    </div>
  );
}
