import "server-only";
import NextAuth from "next-auth";
import { credentialsProvider } from "./credentials";
import type { UserRole } from "@/types/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [credentialsProvider],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.role = (user as { role: UserRole }).role;
        token.churchId = (user as { churchId: string }).churchId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as UserRole;
      session.user.churchId = token.churchId as string;
      return session;
    },
  },
});
