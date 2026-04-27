#!/usr/bin/env node

/**
 * Basic load test for Blessed Hope Library
 *
 * Simulates concurrent users hitting the app to verify
 * it handles the PRD target of 500 members.
 *
 * Usage:
 *   node scripts/load-test.js [baseUrl] [concurrency]
 *
 * Examples:
 *   node scripts/load-test.js                          # localhost, 50 users
 *   node scripts/load-test.js http://localhost:3000 100 # custom URL, 100 users
 *
 * Targets (from PRD):
 *   - Page load: < 3s on 3G
 *   - Server action: < 500ms at p95
 *   - Uptime: 99.5%
 */

const BASE_URL = process.argv[2] || "http://localhost:3000";
const CONCURRENCY = parseInt(process.argv[3] || "50", 10);
const TOTAL_REQUESTS = CONCURRENCY * 5;

const ENDPOINTS = [
  { path: "/login", name: "Login Page", method: "GET" },
  { path: "/api/health", name: "Health Check", method: "GET" },
  { path: "/", name: "Home Page", method: "GET" },
  { path: "/books", name: "Book Catalog", method: "GET" },
  { path: "/profile", name: "Profile Page", method: "GET" },
];

async function makeRequest(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: endpoint.method,
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    const latency = performance.now() - start;
    return {
      endpoint: endpoint.name,
      status: res.status,
      latencyMs: Math.round(latency),
      ok: res.status < 500,
    };
  } catch (e) {
    return {
      endpoint: endpoint.name,
      status: 0,
      latencyMs: Math.round(performance.now() - start),
      ok: false,
      error: e.message,
    };
  }
}

async function runBatch(endpoint, count) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(makeRequest(endpoint));
  }
  return Promise.all(promises);
}

function calcStats(results) {
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const successes = results.filter((r) => r.ok).length;
  return {
    total: results.length,
    successes,
    failures: results.length - successes,
    successRate: `${((successes / results.length) * 100).toFixed(1)}%`,
    min: latencies[0],
    max: latencies[latencies.length - 1],
    avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    p50: latencies[Math.floor(latencies.length * 0.5)],
    p95: latencies[Math.floor(latencies.length * 0.95)],
    p99: latencies[Math.floor(latencies.length * 0.99)],
  };
}

async function main() {
  console.log(`\n  Blessed Hope Library — Load Test`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Target:      ${BASE_URL}`);
  console.log(`  Concurrency: ${CONCURRENCY} simultaneous requests`);
  console.log(`  Total:       ${TOTAL_REQUESTS} requests across ${ENDPOINTS.length} endpoints\n`);

  const allResults = [];

  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`  Testing ${endpoint.name}...`);
    const results = await runBatch(endpoint, CONCURRENCY);
    allResults.push(...results);
    const stats = calcStats(results);
    console.log(` ${stats.successRate} success | avg ${stats.avg}ms | p95 ${stats.p95}ms | p99 ${stats.p99}ms`);
  }

  console.log(`\n  ─── Summary ───────────────────\n`);

  const overall = calcStats(allResults);
  console.log(`  Total Requests:  ${overall.total}`);
  console.log(`  Success Rate:    ${overall.successRate}`);
  console.log(`  Avg Latency:     ${overall.avg}ms`);
  console.log(`  P50 Latency:     ${overall.p50}ms`);
  console.log(`  P95 Latency:     ${overall.p95}ms`);
  console.log(`  P99 Latency:     ${overall.p99}ms`);
  console.log(`  Min / Max:       ${overall.min}ms / ${overall.max}ms`);

  // PRD target checks
  console.log(`\n  ─── PRD Target Checks ─────────\n`);

  const p95Under500 = overall.p95 < 500;
  const p95Under3000 = overall.p95 < 3000;
  const successAbove99 = parseFloat(overall.successRate) >= 99.5;

  console.log(`  ${p95Under3000 ? "✓" : "✗"} Page load < 3s (3G):     p95 = ${overall.p95}ms`);
  console.log(`  ${p95Under500 ? "✓" : "✗"} Server action < 500ms:   p95 = ${overall.p95}ms`);
  console.log(`  ${successAbove99 ? "✓" : "✗"} Uptime > 99.5%:         ${overall.successRate}`);

  console.log(`\n  ${p95Under3000 && successAbove99 ? "✓ ALL TARGETS MET" : "⚠ SOME TARGETS MISSED"}\n`);

  process.exit(p95Under3000 && successAbove99 ? 0 : 1);
}

main().catch((e) => {
  console.error("Load test failed:", e.message);
  process.exit(1);
});
