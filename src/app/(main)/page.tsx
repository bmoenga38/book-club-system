import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import Link from "next/link";

const FONT = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <main className="px-6 pt-6 pb-32 max-w-md mx-auto space-y-8">
      {/* Hero Welcome Card */}
      <section className="relative w-full rounded-[16px] overflow-hidden shadow-xl shadow-[#04122e]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] to-[#2a4582] opacity-95" />
        <div className="relative z-10 p-6 flex flex-col justify-between min-h-[160px]">
          <div>
            <span className="text-[#828eb1] text-xs font-medium tracking-wide uppercase">Welcome back,</span>
            <h1
              className="text-white text-[28px] font-bold mt-1 leading-tight"
              style={FONT}
            >
              {firstName}
            </h1>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-white/60 text-xs font-medium">Blessed Hope Church Library</p>
            <div className="px-3 py-1 bg-[#ffdf9f] rounded-full">
              <span className="text-[#261a00] text-[10px] font-bold uppercase tracking-tighter">Member</span>
            </div>
          </div>
        </div>
        {/* Decorative light element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffdf9f]/10 blur-3xl rounded-full" />
      </section>

      {/* Library Services */}
      <section className="space-y-4">
        <h2 className="text-[#191c1e] dark:text-[#F5C400] font-bold text-lg tracking-tight px-1" style={FONT}>Library Services</h2>
        <div className="space-y-3">
          {/* Browse Books */}
          <Link href="/books" className="block">
            <div className="w-full group flex items-center p-4 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-[0px_12px_32px_rgba(25,28,30,0.06)] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.4)] dark:border dark:border-[#1A3058]/50 active:scale-[0.98] transition-all duration-200 text-left">
              <div className="w-12 h-12 rounded-full bg-[#1a2744]/10 dark:bg-[#F5C400]/15 flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-[#1a2744] dark:text-[#F5C400]">library_books</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#191c1e] dark:text-white font-bold text-base">Browse Books</h3>
                <p className="text-[#45464d] dark:text-[#A4A4A4] text-xs font-medium">Explore our catalog</p>
              </div>
              <span className="material-symbols-outlined text-[#c5c6ce] dark:text-[#A4A4A4] group-hover:text-[#1a2744] dark:group-hover:text-[#F5C400] transition-colors">chevron_right</span>
            </div>
          </Link>

          {/* My Borrowings */}
          <Link href="/borrowings" className="block">
            <div className="w-full group flex items-center p-4 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-[0px_12px_32px_rgba(25,28,30,0.06)] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.4)] dark:border dark:border-[#1A3058]/50 active:scale-[0.98] transition-all duration-200 text-left">
              <div className="w-12 h-12 rounded-full bg-[#fece65]/20 dark:bg-[#F5C400]/15 flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-[#795900] dark:text-[#F5C400]">import_contacts</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#191c1e] dark:text-white font-bold text-base">My Borrowings</h3>
                <p className="text-[#45464d] dark:text-[#A4A4A4] text-xs font-medium">Manage your loans</p>
              </div>
              <span className="material-symbols-outlined text-[#c5c6ce] dark:text-[#A4A4A4] group-hover:text-[#795900] dark:group-hover:text-[#F5C400] transition-colors">chevron_right</span>
            </div>
          </Link>

          {/* My Profile */}
          <Link href="/profile" className="block">
            <div className="w-full group flex items-center p-4 bg-white dark:bg-[#0F2444] rounded-[16px] shadow-[0px_12px_32px_rgba(25,28,30,0.06)] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.4)] dark:border dark:border-[#1A3058]/50 active:scale-[0.98] transition-all duration-200 text-left">
              <div className="w-12 h-12 rounded-full bg-[#d8e2fe]/30 dark:bg-[#F5C400]/15 flex items-center justify-center mr-4">
                <span className="material-symbols-outlined text-[#081327] dark:text-[#F5C400]">person</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[#191c1e] dark:text-white font-bold text-base">My Profile</h3>
                <p className="text-[#45464d] dark:text-[#A4A4A4] text-xs font-medium">Account settings</p>
              </div>
              <span className="material-symbols-outlined text-[#c5c6ce] dark:text-[#A4A4A4] group-hover:text-[#081327] dark:group-hover:text-[#F5C400] transition-colors">chevron_right</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Today's Spotlight */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[#191c1e] dark:text-[#F5C400] font-bold text-lg tracking-tight" style={FONT}>Today&apos;s Spotlight</h2>
          <Link href="/books" className="text-[#795900] dark:text-[#F5C400] font-bold text-xs uppercase tracking-wider">View All</Link>
        </div>
        <Link href="/books" className="block">
          <div className="bg-[#f2f4f7] dark:bg-[#0F2444] dark:border dark:border-[#1A3058]/50 rounded-[20px] p-5 flex gap-5 items-center">
            <div className="w-24 h-36 flex-shrink-0 shadow-lg shadow-black/20 rounded-md overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-300 bg-gradient-to-br from-[#1a2744] to-[#2a4582] flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-[#ffdf9f]/30">menu_book</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="px-2 py-0.5 bg-[#ffdf9f] w-fit rounded-full mb-1">
                <span className="text-[#261a00] text-[8px] font-extrabold uppercase tracking-widest">New Arrival</span>
              </div>
              <h3 className="text-[#191c1e] dark:text-white font-bold text-lg leading-tight" style={FONT}>Explore Collection</h3>
              <p className="text-[#45464d] dark:text-[#A4A4A4] text-xs italic">Blessed Hope Library</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#795900] dark:text-[#F5C400] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-[#191c1e] dark:text-white font-bold text-xs">Curated</span>
                <span className="text-[#75777e] dark:text-[#A4A4A4] text-[10px]">&#8226; Spirituality</span>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </main>
  );
}
