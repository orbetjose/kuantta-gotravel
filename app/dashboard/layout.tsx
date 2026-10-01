import { auth } from "@/auth";
import { redirect } from "next/navigation";

import Sidebar from "@/app/components/dashboard/sidebar";
import DashboardNavbar from "@/app/components/dashboard/dashboard-navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  return (
    <div className="flex h-screen overflow-hidden bg-secondary-gray/15">
      <Sidebar />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col ">
        <DashboardNavbar user={session.user} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto ">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
