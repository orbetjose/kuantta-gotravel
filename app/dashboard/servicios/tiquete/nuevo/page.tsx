import { getClientes, getProveedores, getRutas, getPasajeros } from "@/actions/catalogos";

import TicketForm from "@/app/components/dashboard/ticket-form";

export default async function pageTiquete() {
    const [clientes, proveedores, rutas, pasajeros] = await Promise.all([
    getClientes(),
    getProveedores(),
    getRutas(),
    getPasajeros(),
  ]);
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Tipo de servicio</span>
        <h2 className="text-third-gray text-5xl">Tiquete</h2>
      </div>
      <TicketForm clientes={clientes}
        proveedores={proveedores}
        pasajeros={pasajeros}
        rutas={rutas} />
    </div>
  );
}
