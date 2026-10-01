import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "ADMINISTRADOR" | "ASESOR" | "FACTURADOR";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMINISTRADOR" | "ASESOR" | "FACTURADOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role: "ADMINISTRADOR" | "ASESOR" | "FACTURADOR";
  }
}