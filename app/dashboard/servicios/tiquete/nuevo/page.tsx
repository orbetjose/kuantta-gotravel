import {
  getClientes,
  getProveedores,
  getRutas,
  getPasajeros,
} from "@/actions/catalogos";
import { redirect } from "next/navigation";
import { requirePermission } from "@/libs/authorization";

import TicketForm from "@/app/components/dashboard/forms/ticket-form";

export default async function pageTiquete() {
  const [clientes, proveedores, rutas, pasajeros] = await Promise.all([
    getClientes(),
    getProveedores(),
    getRutas(),
    getPasajeros(),
  ]);

  try {
    await requirePermission("servicios", "create");
  } catch {
    redirect("/dashboard/servicios/tiquete");
  }
  
  return (
    <div className="w-full  bg-fourth-gray p-4 rounded-lg ">
      <div className="font-inter font-bold">
        <span className="text-primary-blue">Tipo de servicio</span>
        <h2 className="text-third-gray text-4xl">Tiquete</h2>
      </div>
      <TicketForm
        clientes={clientes}
        proveedores={proveedores}
        pasajeros={pasajeros}
        rutas={rutas}
      />
    </div>
  );
}
