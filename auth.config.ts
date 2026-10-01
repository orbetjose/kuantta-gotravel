import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/libs/zod";
import { prisma } from "@/libs/prisma";
import bcryptjs from "bcryptjs";
// import { nanoid } from "nanoid";
// import { sendEmailVerification } from "./lib/mail";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = loginSchema.safeParse(credentials);
        if (!success) {
          throw new Error("Invalid credentials");
        }
        const user = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        
        const isValidPassword = await bcryptjs.compare(data.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        /*

        if (!user.emailVerified) {
          const verifyTokenExists = await prisma.verificationToken.findFirst({
            where: { identifier: user.email },
          })

          if (verifyTokenExists?.identifier) {
            await prisma.verificationToken.delete({
              where: {
                identifier: user.email
              }
            })
          }

          const token = nanoid();

          await prisma.verificationToken.create({
            data:{
              identifier: user.email,
              token,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
          })

          // Send verification email

          await sendEmailVerification(user.email, token);

          throw new Error("Necesitas verificar tu correo electrónico. Se ha enviado un enlace de verificación a tu correo.");

        }

        */
        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
