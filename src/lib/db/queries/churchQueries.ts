import "server-only";

import { db } from "@/lib/db";
import { churches } from "@/lib/db/schema";

export async function getChurches(): Promise<{ id: string; name: string }[]> {
  return db
    .select({ id: churches.id, name: churches.name })
    .from(churches);
}
