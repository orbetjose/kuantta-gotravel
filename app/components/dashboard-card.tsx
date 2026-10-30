import { ClockIcon, type LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  moneda?: string;
  description?: string;
  clientesConCartera?: number;
  proveedoresPendientes?: number;
  icon?: LucideIcon;
}

export default function DashboardCard({
  title,
  value,
  moneda,
  description,
  clientesConCartera,
  proveedoresPendientes,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-4 3xl:px-5 3xl:py-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-fourth-gray rounded-full p-1.5">
          {Icon && <Icon size={20} />}
        </div>
        <p className="font-inter text-sm 3xl:text-sm text-fifth-gray 3xl:min-h-auto leading-4">
          {title}
        </p>
      </div>

      <p className="mt-2 font-poppins text-2xl md:text-xl 2xl:text-3xl font-bold text-primary-blue">
        {value}
      </p>
      {moneda && (
        <p className=" font-inter text-xs 3xl:text-sm text-primary-blue pt-1">{moneda}</p>
      )}

      {clientesConCartera && (
        <div className="flex gap-1 items-center pt-1">
          <ClockIcon size={16} />
          <p className=" font-inter text-xs 3xl:text-sm text-primary-blue ">
            {clientesConCartera} clientes
          </p>
        </div>
      )}

      {proveedoresPendientes && (
        <div className="flex gap-1 items-center pt-1">
          <ClockIcon size={16} />
          <p className=" font-inter text-xs 3xl:text-sm text-primary-blue ">
            {proveedoresPendientes} proveedores
          </p>
        </div>
      )}

      {description && (
        <p className="mt-1 font-inter text-xs 3xl:text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
