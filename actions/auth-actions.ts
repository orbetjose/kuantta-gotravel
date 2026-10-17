"use server";

import { signIn } from "@/auth";
import { prisma } from "@/libs/prisma";
import { loginSchema, registerSchema, updateSchema } from "@/libs/zod";
import { auth } from "@/auth";
import { AuthError } from "next-auth";
import z from "zod";
import bcrypt from "bcryptjs";

export const loginAction = async (data: z.infer<typeof loginSchema>) => {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "An unexpected error occurred" };
  }
};

export const registerAction = async (
  values: z.infer<typeof registerSchema>,
) => {
  /*
  try {
    const { data, success } = registerSchema.safeParse(values);
    if (!success) {
      return { error: "Invalid data" };
    }
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      return { error: "User already exists" };
    }

    const password = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
      },
    });

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "An unexpected error occurred" };
  }*/
  return Response.json({ error: "Registro deshabilitado" }, { status: 403 });
};

export const createUser = async (values: z.infer<typeof registerSchema>) => {
  try {
    const { data, success } = registerSchema.safeParse(values);
    if (!success) {
      return { error: "Invalid data" };
    }
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (user) {
      return { error: "User already exists" };
    }

    const password = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "An unexpected error occurred" };
  }
  return {
    success: true,
  };
};

export const updateUser = async (
  userId: string,
  values: {
    name: string;
    email: string;
    role: "ASESOR" | "FACTURADOR" | "ADMINISTRADOR";
    password?: string;
  },
) => {
  try {
    const { data, success } = updateSchema.safeParse(values);
    if (!success) {
      return { error: "Invalid data" };
    }

    const updateData: {
      name: string;
      email: string;
      role: "ASESOR" | "FACTURADOR" | "ADMINISTRADOR";
      password?: string;
    } = {
      name: data.name,
      email: data.email,
      role: data.role,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });
    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "An unexpected error occurred" };
  }
};

export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No estás autenticado.");
  }

  return session.user;
}
