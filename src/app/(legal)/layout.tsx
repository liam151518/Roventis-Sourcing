import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import "./legal.css";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="sticky top-0 z-50 bg-[#faf9f7]/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft className="w-4 h-4 text-[#6e6e73] group-hover:text-[#1d1d1f] transition-colors group-hover:-translate-x-0.5 transition-transform" />
            <Image
              src="/roventis-logo.png"
              alt="Roventis Sourcing"
              width={100}
              height={24}
              className="h-5 w-auto"
            />
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-[12px] text-[#6e6e73]">
            <Link href="/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1d1d1f] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[#1d1d1f] transition-colors">Cookies</Link>
            <Link href="/affiliate-agreement" className="hover:text-[#1d1d1f] transition-colors">Agreement</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16">
        {children}
      </main>
      <footer className="border-t border-black/5 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#86868b]">
          <p>© {new Date().getFullYear()} Roventis Sourcing (Pty) Ltd. All rights reserved.</p>
          <p>Registered in South Africa</p>
        </div>
      </footer>
    </div>
  );
}
