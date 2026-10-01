interface DashboardCardProps {
  title: string;
  value: string;
  description?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="font-inter text-sm text-fifth-gray">
        {title}
      </p>

      <p className="mt-2 font-poppins text-2xl md:text-3xl font-bold text-primary-blue">
        {value}
      </p>

      {description && (
        <p className="mt-1 font-inter text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}