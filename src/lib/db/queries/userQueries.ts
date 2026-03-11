import "server-only";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUserByPhone(phone: string) {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  return results[0] ?? null;
}

export async function createUser({
  phone,
  name,
  churchId,
}: {
  phone: string;
  name: string;
  churchId: string;
}) {
  const results = await db
    .insert(users)
    .values({
      phone,
      name,
      churchId,
      role: "member",
      status: "pending_verification",
    })
    .returning();

  return results[0];
}
