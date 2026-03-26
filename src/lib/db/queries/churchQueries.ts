import "server-only";

import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";

export async function getChurches(): Promise<{ id: string; name: string }[]> {
  const client = getConvexClient();
  const churches = await client.query(api.churches.list, {});
  return churches.map((c) => ({ id: c._id, name: c.name }));
}
