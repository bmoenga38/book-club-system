import NextAuth from "next-auth";
import { credentialsProvider } from "./credentials";
import type { UserRole, UserStatus } from "@/types/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [credentialsProvider],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id!;
        token.role = (user as { role: UserRole }).role;
        token.status = (user as { status: UserStatus }).status;
        token.churchId = (user as { churchId: string }).churchId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as UserRole;
      session.user.status = token.status as UserStatus;
      session.user.churchId = token.churchId as string;
      return session;
    },
  },
});
