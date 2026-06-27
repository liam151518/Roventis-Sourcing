"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import "./about.css";

export default function AboutPage() {
  return (
    <div className="about-page min-h-screen bg-[#faf9f7] relative overflow-hidden">
      {/* Ambient blurs (matches legal layout) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[#0071e3]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#0071e3]/[0.025] blur-[100px]" />
      </div>

      {/* Floating glass header */}
      <div className="sticky top-0 z-50 flex justify-center pointer-events-none pt-3 px-3">
        <header className="w-full max-w-[1100px] pointer-events-auto bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl border border-black/[0.06] rounded-full">
          <div className="flex items-center justify-between h-14 px-5">
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
            <span className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-[#1d1d1f] text-white">
              About
            </span>
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
        <header className="about-hero">
          <span className="about-eyebrow">About Roventis</span>
          <h1>
            We turn sourcing<br />into a real income.
          </h1>
          <p className="about-lede">
            Roventis (Pty) Ltd is a South African sourcing platform that
            connects vetted affiliates with serious buyers &mdash; and pays
            you up to 12% commission on every deal you close.
          </p>
        </header>

        <section>
          <h2>What we do</h2>
          <p>
            Roventis sits between <strong>vetted South African suppliers</strong>
            and the <strong>affiliates</strong> who bring buyers to them.
            We handle the sourcing side of the deal &mdash; verified pricing,
            locked-in quotes, supplier vetting, order tracking &mdash; so
            you can focus on what you do best: closing.
          </p>
          <p>
            You bring the lead. We bring the inventory, the credibility, and
            the payout. The result is a business you can run from anywhere,
            on your own schedule, with the full backing of an operations
            team.
          </p>
        </section>

        <section>
          <h2>How it works</h2>
          <div className="about-grid">
            <div className="about-card">
              <h3>1. Apply</h3>
              <p>
                Book a short intro call. We&apos;re invite-only to keep the
                network quality high.
              </p>
            </div>
            <div className="about-card">
              <h3>2. Train</h3>
              <p>
                Finish onboarding and unlock your dashboard, lead pool and
                pricing sheets.
              </p>
            </div>
            <div className="about-card">
              <h3>3. Earn</h3>
              <p>
                Match buyers to inventory, close deals, and receive monthly
                payouts.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>Why affiliates choose us</h2>
          <p>
            <strong>Verified buyers, real demand.</strong> Every lead in your
            pool has been qualified &mdash; not cold-scraped. Time spent on
            real conversations, not dead ends.
          </p>
          <p>
            <strong>Locked-in pricing.</strong> Quotes don&apos;t drift mid-deal.
            The price you quote is the price your buyer pays, and the basis
            for your commission.
          </p>
          <p>
            <strong>Monthly payouts.</strong> Commissions are tracked
            transparently in your dashboard and paid out on a predictable
            monthly schedule &mdash; no chasing, no surprises.
          </p>
          <p>
            <strong>Tiered upside.</strong> Climb from Affiliate to Platinum
            and unlock higher commission rates, priority leads, and a deeper
            supplier catalogue as you go.
          </p>
        </section>

        <section>
          <h2>Where we operate</h2>
          <p>
            Roventis is built and operated from South Africa. We work with
            local suppliers and serve buyers across the country, with the
            legal structure of a registered <strong>(Pty) Ltd</strong> and
            full POPIA compliance.
          </p>
        </section>

        <div className="about-cta">
          <h2>Want to know more?</h2>
          <p>
            Drop us a line at{" "}
            <strong>
              <a
                href="mailto:roventis.io@gmail.com"
                className="text-[#0071e3] hover:underline"
              >
                roventis.io@gmail.com
              </a>
            </strong>
            , or apply for an invite below.
          </p>
          <div className="about-cta-links">
            <Link href="/apply" className="about-pill about-pill-primary">
              Apply now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a href="mailto:roventis.io@gmail.com" className="about-pill">
              <Mail className="w-3.5 h-3.5" />
              Email us
            </a>
            <Link href="/disclaimer" className="about-pill">
              Disclaimer
            </Link>
          </div>
        </div>
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