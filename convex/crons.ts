import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run penalty escalation check daily at 8 AM EAT (5 AM UTC)
crons.daily(
  "penalty-escalation",
  { hourUTC: 5, minuteUTC: 0 },
  internal.penalties.processEscalations
);

export default crons;
