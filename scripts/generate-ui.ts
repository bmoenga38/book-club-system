import { stitch } from "@google/stitch-sdk";
import { writeFileSync, mkdirSync } from "fs";

const SCREENS = [
  {
    name: "login",
    prompt: `A modern church library app login page. Mobile-first design.
    - Deep navy blue (#1a2744) and gold (#d4a843) color scheme
    - Top: Large book icon in gold circle, "Blessed Hope" title in bold white, "Church Library" subtitle
    - Clean white card with rounded corners (16px radius) and subtle shadow
    - Phone number input field with phone icon, +254 prefix
    - Primary "Log In" button: gold background (#d4a843), dark text, full width, 48px height, bold
    - Divider with "New member?" text
    - Secondary "Register with OTP" button: outlined, dashed border
    - Footer text: "By continuing, you agree to the church library borrowing policy"
    - Background: subtle gradient from navy to darker navy
    - Professional, warm, welcoming feel`,
  },
  {
    name: "home",
    prompt: `A church library app home screen. Mobile-first.
    - Top header bar: navy blue (#1a2744) with gold book icon, "Blessed Hope" title, user avatar right
    - Welcome card: gradient navy-to-blue with "Welcome back, Brian" greeting, church name subtitle
    - Three action cards below with white background, subtle shadow, 12px border radius:
      1. "Browse Books" - blue icon in light blue circle, arrow right
      2. "My Borrowings" - amber clock icon in light amber circle, arrow right
      3. "My Profile" - purple trophy icon in light purple circle, arrow right
    - Each card has title, short description, and right arrow
    - Bottom navigation: Home (active/gold), Books, Loans, Profile, Admin icons
    - Clean spacing, modern mobile app feel`,
  },
  {
    name: "catalog",
    prompt: `A professional church library book catalog. Mobile-first grid view.
    - Page header: "Library" with book icon in blue circle, "Browse & borrow books" subtitle
    - Stats bar: "25 titles" and "20 available" with icons
    - Grid/List toggle buttons on the right
    - Search bar with search icon, "Search by title, author..." placeholder
    - Horizontal scrollable category pills: All Books (active/filled), Devotional, Prophecy, Health, Youth
    - 2-column book grid. Each book card:
      - Book cover: rich gradient background (different color per book), title in white on cover
      - Author name below cover
      - Small green/red availability dot
      - Category tag
      - Subtle shadow, 12px radius, hover lift effect
    - Books shown: "Steps to Christ", "The Great Controversy", "The Desire of Ages", etc.
    - Navy/blue/gold color scheme. Professional and clean.`,
  },
  {
    name: "book-detail",
    prompt: `A book detail page for a church library app. Mobile-first.
    - Back arrow link "Library" at top
    - Large hero section: gradient book cover (deep blue/indigo), category tag top-left, book title large white text, author name below
    - Availability bar: green background if available showing "3 of 4 copies available" with check icon
    - "About this book" section in white card with description text
    - Details grid: 2 cards showing Author and Copies, ISBN below
    - Large "Request to Borrow" button: full width, gold/primary color, 48px height
    - Professional typography, good spacing, navy/gold theme`,
  },
  {
    name: "dashboard",
    prompt: `An admin dashboard for a church library. Mobile-first.
    - Header: navy blue with gold icon, "Blessed Hope", admin user name
    - 4 stat cards in 2x2 grid with colored gradients:
      1. Blue gradient: "3 Pending Requests" with clock icon watermark
      2. Green gradient: "12 Active Loans" with book icon watermark
      3. Red gradient: "2 Overdue" with warning icon watermark
      4. Amber gradient: "1 New Members" with checkmark icon watermark
    - Each card has large number, label, and a subtle background icon
    - "Quick Actions" section with 4 action buttons in 2x2 grid:
      1. "Issue Book" with arrow icon, dashed blue border
      2. "Return Book" with rotate icon, dashed blue border
      3. "Reports" with chart icon, dashed blue border
      4. "Members" with people icon, dashed blue border
    - Bottom nav with Admin tab active
    - Professional, clean dashboard feel`,
  },
  {
    name: "profile",
    prompt: `A user profile page for a church library gamification system. Mobile-first.
    - User info card: name, phone, church name, role
    - XP & Level card: "750 XP" large text, "Lvl 4 — Library Champion" badge, progress bar to next level
    - 3 small stat cards in a row: Active loans (2), Streak (10 fire icon), Rank (#1 star)
    - Trust status card: green shield icon, "Established Member", "Can borrow up to 3 books"
    - Badges section: pill badges like "First Borrow", "Bookworm", "Trustworthy", "Streak Master"
    - Leaderboard card: "Top Readers" with ranked list (name + XP), current user highlighted
    - Sign out button at bottom
    - Navy/blue/gold theme, clean and modern`,
  },
];

async function main() {
  mkdirSync("scripts/stitch-output", { recursive: true });

  console.log("Creating Stitch project...");
  const result = await stitch.callTool("create_project", {
    title: "Blessed Hope Library UI",
  });
  console.log("Project created:", result);

  // Get project ID from result
  const projectMatch = JSON.stringify(result).match(/"projectId"\s*:\s*"(\d+)"/);
  if (!projectMatch) {
    console.error("Could not extract project ID from:", JSON.stringify(result));
    return;
  }
  const projectId = projectMatch[1];
  console.log("Project ID:", projectId);

  const project = stitch.project(projectId);

  for (const screen of SCREENS) {
    console.log(`\nGenerating: ${screen.name}...`);
    try {
      const generated = await project.generate(screen.prompt, "MOBILE");
      console.log(`  Screen generated: ${generated.id}`);

      const htmlUrl = await generated.getHtml();
      console.log(`  HTML URL: ${htmlUrl}`);

      // Download HTML
      const response = await fetch(htmlUrl);
      const html = await response.text();
      writeFileSync(`scripts/stitch-output/${screen.name}.html`, html);
      console.log(`  Saved: scripts/stitch-output/${screen.name}.html`);

      const imageUrl = await generated.getImage();
      console.log(`  Screenshot: ${imageUrl}`);
      writeFileSync(
        `scripts/stitch-output/${screen.name}-screenshot.txt`,
        imageUrl
      );
    } catch (error) {
      console.error(`  Error generating ${screen.name}:`, error);
    }
  }

  console.log("\nDone! Check scripts/stitch-output/");
}

main().catch(console.error);
