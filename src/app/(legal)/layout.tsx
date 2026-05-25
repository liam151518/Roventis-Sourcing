"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import "./legal.css";

const legalNav = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Agreement", href: "/affiliate-agreement" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#faf9f7] relative overflow-hidden">
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[#0071e3]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#0071e3]/[0.025] blur-[100px]" />
      </div>

      {/* Floating glass header */}
      <div className="sticky top-0 z-50 flex justify-center pointer-events-none pt-3 px-3">
        <header className="w-full max-w-[1100px] pointer-events-auto bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl border border-black/[0.06] rounded-full">
          <div className="flex items-center justify-between h-14 px-5">
            {/* Left: back + logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <ArrowLeft className="w-4 h-4 text-[#6e6e73] group-hover:text-[#1d1d1f] transition-all group-hover:-translate-x-0.5" />
              <Image
                src="/roventis-logo.png"
                alt="Roventis"
                width={100}
                height={24}
                className="h-5 w-auto"
              />
            </Link>

            {/* Center: nav pills */}
            <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
              {legalNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-[#1d1d1f] text-white"
                        : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: support link */}
            <Link
              href="/"
              className="text-[12px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors shrink-0 hidden sm:block"
            >
              Back to site
            </Link>
          </div>
        </header>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 py-14 sm:py-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/[0.04]">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#86868b]">
            © {new Date().getFullYear()} Roventis (Pty) Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[12px] text-[#86868b]">
            <Link href="/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1d1d1f] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[#1d1d1f] transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
