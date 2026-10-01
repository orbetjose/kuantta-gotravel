import Link from "next/link";

type btnAddProps = {
  href: string;
  services: string;
};

export default function btnAdd({ href, services }: btnAddProps) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-primary-blue px-6 py-3 font-inter text-sm font-bold text-white hover:opacity-90 transition w-fit"
    >
      + {services}
    </Link>
  );
}
