import { LoginForm } from "@/components/domain/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* White Card */}
      <div
        className="bg-white rounded-2xl p-8 flex flex-col items-center w-full"
        style={{ boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}
      >
        {/* Icon/Logo Section */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#ffdf9f] rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#261a00] text-2xl">
              menu_book
            </span>
          </div>
          <h1
            className="text-[#0d1b37] font-bold text-[28px] leading-tight tracking-tight"
            style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
          >
            Blessed Hope
          </h1>
          <p className="text-[#45464d] text-[14px] font-medium tracking-wide">
            Church Library
          </p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Library Context Visual (decorative, hidden on small screens) */}
        <div className="mt-8 overflow-hidden rounded-xl w-full aspect-video relative hidden sm:block">
          <img
            alt="Sanctuary library"
            className="object-cover w-full h-full opacity-20 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkHGFDaI8hXsbwlhgXyfXpAQk-7C_z4Kwcevgwx5LNq_t71zLqbSLAMnUFytJD8txklkcfa_oCsY89YZ1zj20pjfxbmAMnDJqbN_8bqGRLAUoHPgQfnQIsJq8MFVnUVc7vZ9FhsBOGpSzQIIhFovBjZK1bbkwlDb5XxWydAG4l6UShFVEAc8U2pYL-6tLTW8woUzunFypSR8HTS5XO7zS4XBy9uoli4m-wkY5aVAn9jD_iCKtAdzMUhQIUdZVezKoC7pEpFeVlYSh9"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 px-4 text-center">
        <p className="text-[#828eb1]/60 text-[11px] font-medium leading-relaxed max-w-[280px] mx-auto">
          By signing in, you agree to the Blessed Hope Borrowing Policy and
          Terms of Grace.
        </p>
        {/* Support Link */}
        <Link
          href="#"
          className="inline-block mt-4 text-[#ffdf9f] text-[12px] font-bold hover:underline decoration-[#ffdf9f]/30 underline-offset-4"
        >
          Need assistance?
        </Link>
      </footer>
    </div>
  );
}
