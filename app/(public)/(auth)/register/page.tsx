import RegisterForm from "@/app/components/register-form";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/login");
  return (
    <div className="bg-body bg-center bg-cover">
      <div className="md:pt-10 pt-20 pb-4">
        <RegisterForm />
      </div>
    </div>
  );
}
