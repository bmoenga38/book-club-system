import Credentials from "next-auth/providers/credentials";
import { getUserByPhone } from "@/lib/db/queries/userQueries";
import type { UserRole } from "@/types/auth";

export const credentialsProvider = Credentials({
  credentials: {
    phone: { type: "text" },
  },
  authorize: async (credentials) => {
    const phone = credentials?.phone as string | undefined;
    if (!phone) return null;

    const user = await getUserByPhone(phone);
    if (!user) return null;

    return {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role as UserRole,
      status: user.status as "pending_verification" | "active" | "suspended",
      churchId: user.churchId,
    };
  },
});
