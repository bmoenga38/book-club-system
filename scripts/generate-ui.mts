import { stitch } from "@google/stitch-sdk";
import { writeFileSync, mkdirSync } from "fs";

const SCREENS = [
  {
    name: "login",
    prompt: `Design a premium church library mobile app login screen with these exact specifications:
    - Background: deep navy gradient (#1a2744 to #0f1a2e)
    - Centered white card (border-radius: 20px, padding: 32px, box-shadow: 0 20px 60px rgba(0,0,0,0.3))
    - Inside card top: Gold book icon (48px) in a circle, then "Blessed Hope" in 28px bold, "Church Library" in 14px gray
    - Phone input: height 52px, left phone icon, placeholder "+254712345678", border-radius 12px, border: 1px solid #e0e0e0
    - "Log In" button: full width, height 52px, background #d4a843 gold, color #1a2744 dark, font-weight 700, border-radius 12px, box-shadow
    - Divider line with "New member?" text centered
    - "Register with OTP" button: outlined, dashed border, same height
    - Footer: small gray text about borrowing policy
    - Overall: Apple-quality design, generous white space, Inter font`,
  },
  {
    name: "home",
    prompt: `Design a premium mobile home screen for a church library app:
    - Top bar: solid #1a2744 navy, height 56px, left: gold book icon + "Blessed Hope" / "Church Library", right: sun/moon icon + user avatar
    - Hero card: full-width gradient (navy to blue-purple), border-radius 16px, padding 24px. "Welcome back," small text, "Brian" large 28px bold white, "Blessed Hope Church Library" small gray
    - 3 action cards below, each: white background, border-radius 16px, padding 16px, subtle shadow, flex row with:
      Left: 48px colored circle icon (blue for books, amber for loans, purple for profile)
      Center: bold title + gray subtitle
      Right: chevron-right arrow
    - Cards: "Browse Books" (blue), "My Borrowings" (amber), "My Profile" (purple)
    - Bottom nav bar: 5 items (Home active/gold, Books, Loans, Profile, Admin), each with icon + label
    - Apple-quality design, clean spacing`,
  },
  {
    name: "catalog-grid",
    prompt: `Design a premium mobile book catalog for a church library app:
    - Header: "Library" title with book icon, "Browse & borrow books" subtitle
    - Stats row: "25 titles" and "20 available" with small icons, grid/list toggle on right
    - Search bar: rounded, search icon, placeholder "Search by title, author..."
    - Category pills: horizontally scrollable, "All Books" active (filled navy), others outlined: Devotional, Prophecy, Health, Youth, Education
    - 2-column book grid, each card:
      - Top: tall book cover (aspect ratio 2.8:4) with rich dark gradient background unique per book
      - Title printed in white bold on the cover face
      - Author in smaller lighter text on cover
      - Small availability indicator dot (green/red) top-right of cover
      - Bottom bar: author surname + "2/4" availability fraction
      - Card has border-radius 14px, subtle shadow, hover lift
    - Show 6 books: Steps to Christ, The Great Controversy, The Desire of Ages, Patriarchs and Prophets, Christ's Object Lessons, Ministry of Healing
    - Navy/gold color scheme, Apple-quality premium feel`,
  },
  {
    name: "book-detail",
    prompt: `Design a premium mobile book detail page:
    - Back arrow + "Library" link at top
    - Large hero: gradient cover (deep indigo/blue), 200px tall, border-radius 20px
      - Category tag top-left: small rounded pill "Devotional" in frosted glass style
      - Title: "Steps to Christ" in 24px bold white
      - Author: "by Ellen G. White" in lighter color
      - Decorative circles in background for depth
    - Availability bar: light green background, checkmark icon, "3 of 4 copies available" text
    - "About this book" card: white, rounded, with paragraph description text
    - Details grid: 2x1 cards for Author and Copies, full-width card for ISBN
    - Large CTA button: "Request to Borrow" full-width, gold #d4a843, 52px height, bold, rounded, with book icon
    - Premium, clean, lots of breathing room`,
  },
  {
    name: "admin-dashboard",
    prompt: `Design a premium mobile admin dashboard for a church library:
    - 4 stat cards in 2x2 grid, each with:
      - Full gradient background (blue, green, red, amber respectively)
      - Large watermark icon in top-right at 20% opacity
      - Big bold number (e.g. "3"), label below ("Pending Requests")
      - Border-radius 16px, shadow
    - Stats: Pending Requests (blue), Active Loans (green), Overdue (red), New Members (amber)
    - "Quick Actions" section title in uppercase small gray
    - 4 action buttons in 2x2: Issue Book, Return Book, Reports, Members
      - Each: white card, dashed border in blue, icon centered, label below
      - Border-radius 14px, hover fills
    - Bottom nav with Admin tab highlighted
    - Premium dashboard feel, clean`,
  },
  {
    name: "profile",
    prompt: `Design a premium mobile profile page for a gamified church library app:
    - User card: white, rounded 16px, name "Brian Moenga", phone, church "Blessed Hope SDA Church", role "Super Admin"
    - XP card: "750 XP" large bold, "Lvl 4 — Library Champion" badge, progress bar (75% filled gold), "Next: 1000 XP"
    - 3 mini stat cards in row: "2 Active" (blue book icon), "10 Streak" (orange fire), "#1 Rank" (purple star)
    - Trust card: green shield icon, "Established Member", "Can borrow up to 3 books"
    - Badges section: wrapped pills "First Borrow", "Bookworm", "Avid Reader", "Trustworthy", "Streak Master", "Perfect Record"
    - Leaderboard: "Top Readers" title, numbered list with names and XP, current user row highlighted with blue background
    - Sign out button: outlined, full width at bottom
    - Navy/gold/white color scheme, premium gamification UI`,
  },
];

async function main() {
  mkdirSync("scripts/stitch-output", { recursive: true });

  console.log("Creating Stitch project...");
  const result = await stitch.callTool("create_project", {
    title: "Blessed Hope Library UI",
  });
  console.log("Project created:", JSON.stringify(result).slice(0, 200));

  // Extract project ID from "projects/XXXX" format or "projectId" field
  const resultStr = JSON.stringify(result);
  const nameMatch = resultStr.match(/"name"\s*:\s*"projects\/(\d+)"/);
  const idMatch = resultStr.match(/"projectId"\s*:\s*"(\d+)"/);
  const projectId = nameMatch?.[1] ?? idMatch?.[1];
  if (!projectId) {
    console.error("Could not extract project ID. Full result:", resultStr);
    return;
  }
  console.log("Project ID:", projectId);

  const project = stitch.project(projectId);

  for (const screen of SCREENS) {
    console.log(`\nGenerating: ${screen.name}...`);
    try {
      const generated = await project.generate(screen.prompt, "MOBILE");
      console.log(`  Screen generated: ${generated.id}`);

      const htmlUrl = await generated.getHtml();
      console.log(`  HTML URL: ${htmlUrl}`);

      const response = await fetch(htmlUrl);
      const html = await response.text();
      writeFileSync(`scripts/stitch-output/${screen.name}.html`, html);
      console.log(`  Saved: scripts/stitch-output/${screen.name}.html (${html.length} chars)`);

      const imageUrl = await generated.getImage();
      writeFileSync(`scripts/stitch-output/${screen.name}-screenshot-url.txt`, imageUrl);
      console.log(`  Screenshot URL saved`);
    } catch (error: any) {
      console.error(`  Error: ${error?.message ?? error}`);
    }
  }

  console.log("\n\nDone! HTML files saved to scripts/stitch-output/");
}

main().catch(console.error);
