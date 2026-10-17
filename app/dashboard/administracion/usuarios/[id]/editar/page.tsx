import { notFound } from "next/navigation";
import { prisma } from "@/libs/prisma";
import UserForm from "@/app/components/dashboard/forms/user-form";

export default async function EditarUsuario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const userId = id;

  if (!userId) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    notFound();
  }
  return (
    <div className="font-inter">
      <UserForm
        mode="edit"
        userId={userId}
        initialData={{
          name: user.name as string,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  );
}
