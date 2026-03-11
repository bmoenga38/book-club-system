import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { churches } from "./schema/system";
import { users } from "./schema/auth";

// Seed script runs via `tsx` CLI — creates its own Drizzle instance
// (cannot use lib/db/index.ts which has `import "server-only"`)
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const DEFAULT_CHURCH_NAME = "Default SDA Church";
const SUPER_ADMIN_PHONE = "+254700000000";
const SUPER_ADMIN_NAME = "System Admin";

async function seed() {
  console.log("Seeding database...");

  // 1. Upsert default church
  let church = await db
    .select()
    .from(churches)
    .where(eq(churches.name, DEFAULT_CHURCH_NAME))
    .then((rows) => rows[0]);

  if (!church) {
    [church] = await db
      .insert(churches)
      .values({
        name: DEFAULT_CHURCH_NAME,
        address: "Nairobi, Kenya",
      })
      .returning();
    console.log(`  Created church: ${church.name} (${church.id})`);
  } else {
    console.log(`  Church already exists: ${church.name} (${church.id})`);
  }

  // 2. Upsert super admin user
  let admin = await db
    .select()
    .from(users)
    .where(eq(users.phone, SUPER_ADMIN_PHONE))
    .then((rows) => rows[0]);

  if (!admin) {
    [admin] = await db
      .insert(users)
      .values({
        phone: SUPER_ADMIN_PHONE,
        name: SUPER_ADMIN_NAME,
        role: "super_admin",
        status: "active",
        churchId: church.id,
      })
      .returning();
    console.log(`  Created super admin: ${admin.name} (${admin.id})`);
  } else {
    console.log(`  Super admin already exists: ${admin.name} (${admin.id})`);
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
