import "next-auth";
import "next-auth/jwt";

export enum UserRole {
  MEMBER = "member",
  ASSISTANT_LIBRARIAN = "assistant_librarian",
  CHURCH_ADMIN = "church_admin",
  SUPER_ADMIN = "super_admin",
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      churchId: string;
      name: string;
      phone: string;
    };
  }

  interface User {
    role: UserRole;
    churchId: string;
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    churchId: string;
  }
}
