export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(180deg, #1a2744 0%, #0f1a2e 100%)" }}
    >
      {/* Background Decorative Blur Circles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1a2744] rounded-full blur-[120px] opacity-40" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#ffdf9f] rounded-full blur-[140px] opacity-10" />
      </div>
      {/* Content */}
      <main className="relative z-10 w-full max-w-[400px] flex flex-col items-center justify-center min-h-screen">
        {children}
      </main>
    </div>
  );
}
