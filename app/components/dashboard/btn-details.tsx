import Link from "next/link";

type btnDetailsProps = {
  id: number;
  href: string;
  text: string
};

export default function btnDetails({ id, href, text }: btnDetailsProps) {
  return (
    <Link
      href={href + id}
      className="rounded-md px-3 py-1 font-inter text-sm bg-primary-blue text-white hover:opacity-70 transition"
    >
      {text}
    </Link>
  );
}
