import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Use simple in-memory cache (free tier — no R2 needed)
  // Add r2IncrementalCache later if you want persistent ISR cache
});
