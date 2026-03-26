import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function getUserByPhone(phone: string) {
  const client = getConvexClient();
  return await client.query(api.users.getByPhone, { phone });
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
  const client = getConvexClient();
  return await client.mutation(api.users.create, {
    phone,
    name,
    churchId: churchId as any, // Convex ID from client
  });
}
