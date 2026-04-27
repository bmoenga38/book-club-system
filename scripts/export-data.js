#!/usr/bin/env node

/**
 * Export all Convex data to JSON files for local backup.
 *
 * Usage:
 *   node scripts/export-data.js
 *
 * Creates a timestamped backup folder in ./backups/
 * with one JSON file per Convex table.
 *
 * Note: Convex also provides automatic point-in-time recovery
 * on paid plans (30-day retention). This script is for
 * additional local backup peace of mind.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const TABLES = [
  "churches",
  "users",
  "books",
  "borrowings",
  "xpEvents",
  "penaltyEscalations",
  "smsLog",
  "auditLog",
  "otpCodes",
];

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = path.join(__dirname, "..", "backups", timestamp);

  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`\n  Blessed Hope Library — Data Export`);
  console.log(`  ───────────────────────────────────`);
  console.log(`  Output: ${backupDir}\n`);

  let totalRecords = 0;

  for (const table of TABLES) {
    process.stdout.write(`  Exporting ${table}...`);
    try {
      // Use npx convex to query each table
      const cmd = `npx convex run --no-push "churches:list" "{}" 2>/dev/null`;
      // Generic export using convex export command
      const result = execSync(
        `npx convex export --path "${backupDir}" --tables ${table} 2>&1`,
        { encoding: "utf-8", timeout: 30000 }
      ).trim();
      console.log(` done`);
    } catch {
      // Fallback: try convex data export
      try {
        // Write empty file as placeholder
        const filePath = path.join(backupDir, `${table}.json`);
        fs.writeFileSync(filePath, "[]");
        console.log(` skipped (use Convex dashboard for full export)`);
      } catch (e2) {
        console.log(` error`);
      }
    }
  }

  // Also export via Convex snapshot if available
  console.log(`\n  Trying full snapshot export...`);
  try {
    execSync(`npx convex export --path "${backupDir}" 2>&1`, {
      encoding: "utf-8",
      timeout: 120000,
    });
    console.log(`  ✓ Full snapshot exported to ${backupDir}`);
  } catch {
    console.log(`  ℹ Use Convex Dashboard → Settings → Export for full backup`);
    console.log(`    https://dashboard.convex.dev/t/bry-code/bookclub/dapper-salamander-803/settings`);
  }

  console.log(`\n  ─── Backup Strategy ────────────`);
  console.log(`  • Convex automatic: Point-in-time recovery (paid plans)`);
  console.log(`  • This script: Local JSON snapshots`);
  console.log(`  • Recommended: Run weekly via cron or before major changes`);
  console.log(`  • Dashboard: https://dashboard.convex.dev\n`);
}

main().catch((e) => {
  console.error("Export failed:", e.message);
  process.exit(1);
});
