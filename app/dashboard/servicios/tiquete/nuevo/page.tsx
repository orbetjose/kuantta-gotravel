import { getClientes, getProveedores, getRutas } from "@/actions/catalogos";

import TicketForm from "@/app/components/dashboard/ticket-form";

export default async function pageTiquete() {
    const [clientes, proveedores, rutas] = await Promise.all([
    getClientes(),
    getProveedores(),
    getRutas(),
  ]);
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Tipo de servicio</span>
        <h2 className="text-third-gray text-5xl">Tiquete</h2>
      </div>
      <TicketForm clientes={clientes}
        proveedores={proveedores}
        rutas={rutas} />
    </div>
  );
}
