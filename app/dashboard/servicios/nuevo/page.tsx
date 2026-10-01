import { getClientes, getProveedores, getPasajeros } from "@/actions/catalogos";
import ServiceForm from "@/app/components/dashboard/service-form";

export default async function page() {
  const [clientes, proveedores, pasajeros] = await Promise.all([
    getClientes(),
    getProveedores(),
    getPasajeros(),
  ]);
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Creación de servicios</span>
        <h2 className="text-third-gray text-5xl">Servicio</h2>
      </div>
      <ServiceForm clientes={clientes} proveedores={proveedores} pasajeros={pasajeros} />
    </div>
  );
}
