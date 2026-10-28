import { Plus } from "lucide-react";
import Link from "next/link";

type BtnAddProps = {
  href: string;
  services: string;
};

export default function BtnAdd({ href, services }: BtnAddProps) {
  return (
    <Link
      href={href}
      className="inline-flex gap-2 rounded-lg bg-primary-blue px-4 py-3 font-inter text-sm font-bold text-white hover:opacity-90 transition w-fit"
    >
      <Plus size={18} />
      {services}
    </Link>
  );
}
