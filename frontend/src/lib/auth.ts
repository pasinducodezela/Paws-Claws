import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getDb } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const db = await getDb();
        const admin = await db.collection("Admin").findOne<{ id: string; name?: string; email: string; password: string }>({
          email,
        });

        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
          return null;
        }

        return {
          id: admin.id,
          name: admin.name ?? "Admin",
          email: admin.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.adminId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.adminId ?? "";
      }

      return session;
    },
  },
};