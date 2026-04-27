import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; latencyMs?: number; detail?: string }> = {};

  // Check Convex connectivity
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    const start = Date.now();
    try {
      const res = await fetch(convexUrl, { method: "OPTIONS", signal: AbortSignal.timeout(5000) });
      checks.convex = { status: res.ok || res.status === 405 ? "ok" : "error", latencyMs: Date.now() - start };
    } catch (e) {
      checks.convex = { status: "error", latencyMs: Date.now() - start, detail: e instanceof Error ? e.message : "unreachable" };
    }
  } else {
    checks.convex = { status: "error", detail: "NEXT_PUBLIC_CONVEX_URL not set" };
  }

  // Check SMS Leopard config
  checks.sms = {
    status: process.env.SMSLEOPARD_ACCESS_TOKEN && process.env.SMSLEOPARD_SENDER_ID ? "ok" : "error",
    detail: !process.env.SMSLEOPARD_ACCESS_TOKEN ? "SMSLEOPARD_ACCESS_TOKEN not set" : undefined,
  };

  // Check auth config
  checks.auth = {
    status: process.env.AUTH_SECRET ? "ok" : "error",
    detail: !process.env.AUTH_SECRET ? "AUTH_SECRET not set" : undefined,
  };

  // Check Sentry config
  checks.sentry = {
    status: process.env.NEXT_PUBLIC_SENTRY_DSN ? "ok" : "error",
    detail: !process.env.NEXT_PUBLIC_SENTRY_DSN ? "SENTRY_DSN not configured" : undefined,
  };

  const allOk = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
