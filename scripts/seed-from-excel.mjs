/**
 * Seed Convex database from convex_data.xlsx
 *
 * Usage: node scripts/seed-from-excel.mjs
 *
 * Requires: NEXT_PUBLIC_CONVEX_URL in .env.local
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import XLSX from "xlsx";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ─── Parse Excel ─────────────────────────────────────────────────────────────
const xlsxPath = resolve(__dirname, "../../convex_data.xlsx");
const wb = XLSX.readFile(xlsxPath);
const sheet = wb.Sheets["Mock Data"];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

// Excel stores dates as serial numbers — convert to ms timestamp
function excelDateToMs(serial) {
  if (!serial || typeof serial !== "number") return undefined;
  // Excel epoch: Jan 1, 1900 (with the leap year bug)
  const epoch = new Date(1899, 11, 30);
  return epoch.getTime() + serial * 86400000;
}

// ─── Extract sections ────────────────────────────────────────────────────────
function extractSection(rows, startMarker, endMarker) {
  let started = false;
  let headerRow = null;
  const data = [];

  for (const row of rows) {
    const firstVal = row["CHURCHES"];

    // Look for section start marker
    if (firstVal === startMarker) {
      started = true;
      continue;
    }

    // Look for section end
    if (started && endMarker && firstVal === endMarker) {
      break;
    }

    if (!started) continue;

    // First row after marker is the header
    if (!headerRow) {
      headerRow = {};
      const keys = Object.keys(row);
      keys.forEach((k) => {
        if (row[k]) headerRow[k] = row[k];
      });
      continue;
    }

    // Skip sub-headers (like "Thika West Library (ch-002)")
    if (!firstVal || (typeof firstVal === "string" && firstVal.startsWith("bk-") === false && firstVal.startsWith("usr-") === false && firstVal.startsWith("ch-") === false)) {
      // Check if it's an actual data row by looking for an id-like pattern
      if (!firstVal || !firstVal.match(/^(ch|usr|bk)-\d+$/)) continue;
    }

    // Map __EMPTY columns to header names
    const mapped = {};
    const rawKeys = Object.keys(row);
    const headerKeys = Object.keys(headerRow);
    for (let i = 0; i < headerKeys.length; i++) {
      const headerName = headerRow[headerKeys[i]];
      const value = row[rawKeys[i]];
      if (headerName && value !== null && value !== undefined) {
        mapped[headerName] = value;
      }
    }

    if (Object.keys(mapped).length > 0) {
      data.push(mapped);
    }
  }

  return data;
}

// Churches start at the top, Users start at "USERS", Books at "BOOKS"
const churches = extractSection(rows, null, "USERS");
// Actually, churches are the first rows before USERS
// Let me re-parse: the first row IS the header row for churches
const churchHeader = rows[0]; // {CHURCHES: "id", __EMPTY: "name", ...}
const churchData = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const id = row["CHURCHES"];
  if (!id || typeof id !== "string") continue;
  if (id === "USERS") break;
  if (!id.startsWith("ch-")) continue;

  const headerKeys = Object.keys(churchHeader);
  const rowKeys = Object.keys(row);
  const mapped = {};
  for (let j = 0; j < rowKeys.length; j++) {
    const headerName = churchHeader[headerKeys[j]];
    if (headerName) mapped[headerName] = row[rowKeys[j]];
  }
  churchData.push(mapped);
}

// Users
const usersStartIdx = rows.findIndex((r) => r["CHURCHES"] === "USERS");
const usersHeaderRow = rows[usersStartIdx + 1];
const usersData = [];
for (let i = usersStartIdx + 2; i < rows.length; i++) {
  const row = rows[i];
  const id = row["CHURCHES"];
  if (!id || typeof id !== "string") continue;
  if (id === "BOOKS") break;
  if (!id.startsWith("usr-")) continue;

  const headerKeys = Object.keys(usersHeaderRow);
  const rowKeys = Object.keys(row);
  const mapped = {};
  for (let j = 0; j < Math.min(headerKeys.length, rowKeys.length); j++) {
    const headerName = usersHeaderRow[headerKeys[j]];
    if (headerName) mapped[headerName] = row[rowKeys[j]];
  }
  usersData.push(mapped);
}

// Books
const booksStartIdx = rows.findIndex((r) => r["CHURCHES"] === "BOOKS");
const booksHeaderRow = rows[booksStartIdx + 1];
const booksData = [];
for (let i = booksStartIdx + 2; i < rows.length; i++) {
  const row = rows[i];
  const id = row["CHURCHES"];
  if (!id || typeof id !== "string") continue;
  if (id === "SAAS STATS") break;
  if (!id.startsWith("bk-")) continue;

  const headerKeys = Object.keys(booksHeaderRow);
  const rowKeys = Object.keys(row);
  const mapped = {};
  for (let j = 0; j < Math.min(headerKeys.length, rowKeys.length); j++) {
    const headerName = booksHeaderRow[headerKeys[j]];
    if (headerName) mapped[headerName] = row[rowKeys[j]];
  }
  booksData.push(mapped);
}

console.log(`Parsed: ${churchData.length} churches, ${usersData.length} users, ${booksData.length} books`);

// ─── Push to Convex ──────────────────────────────────────────────────────────

async function seed() {
  // 1. Clear existing data
  console.log("Clearing existing data...");
  await client.mutation(api.seed.clearAll, {});

  // 2. Seed churches — keep a map of old id → new Convex id
  const churchIdMap = {};
  console.log("\nSeeding churches...");
  for (const ch of churchData) {
    const convexId = await client.mutation(api.seed.seedChurch, {
      name: ch.name,
      code: ch.code || undefined,
      address: ch.location || undefined,
      contactPhone: ch.contact_phone ? String(ch.contact_phone) : undefined,
      contactEmail: ch.contact_email || undefined,
      defaultLoanDays: ch.default_loan_days || undefined,
      maxBooksNew: ch.max_books_new || undefined,
      maxBooksEstablished: ch.max_books_established || undefined,
      trustThreshold: ch.trust_threshold || undefined,
      isActive: ch.is_active !== undefined ? Boolean(ch.is_active) : undefined,
    });
    churchIdMap[ch.id] = convexId;
    console.log(`  ✓ ${ch.name} → ${convexId}`);
  }

  // 3. Seed users
  const userIdMap = {};
  console.log("\nSeeding users...");
  for (const u of usersData) {
    const churchId = churchIdMap[u.church_id];
    if (!churchId) {
      console.warn(`  ✗ Skipping user ${u.first_name} ${u.last_name} — church ${u.church_id} not found`);
      continue;
    }

    const convexId = await client.mutation(api.seed.seedUser, {
      phone: String(u.phone_number),
      name: `${u.first_name} ${u.last_name}`,
      email: u.email || undefined,
      role: u.role,
      status: u.verification_status === "verified" ? "active" : "pending_verification",
      churchId,
      trustStatus: u.trust_status || undefined,
      consecutiveOnTime: u.consecutive_on_time || undefined,
      isSuspended: u.is_suspended !== undefined ? Boolean(u.is_suspended) : undefined,
      isHighRisk: u.is_high_risk !== undefined ? Boolean(u.is_high_risk) : undefined,
      xpBalance: u.xp_balance || undefined,
      level: u.level || undefined,
    });
    userIdMap[u.id] = convexId;
    console.log(`  ✓ ${u.first_name} ${u.last_name} (${u.role}) → ${convexId}`);
  }

  // 4. Seed books
  console.log("\nSeeding books...");
  for (const b of booksData) {
    const churchId = churchIdMap[b.church_id];
    if (!churchId) {
      console.warn(`  ✗ Skipping book "${b.title}" — church ${b.church_id} not found`);
      continue;
    }

    await client.mutation(api.seed.seedBook, {
      title: b.title,
      author: b.author,
      description: b.description || undefined,
      category: b.genre || undefined,
      isbn: b.isbn ? String(b.isbn) : undefined,
      publisher: b.publisher || undefined,
      publishedYear: b.published_date || undefined,
      pageCount: b.page_count || undefined,
      language: b.language || undefined,
      totalCopies: b.total_copies || 1,
      availableCopies: b.available_copies ?? b.total_copies ?? 1,
      churchId,
    });
    console.log(`  ✓ "${b.title}" (${b.genre}) — ${b.available_copies}/${b.total_copies} copies`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`   ${churchData.length} churches`);
  console.log(`   ${usersData.length} users`);
  console.log(`   ${booksData.length} books`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
