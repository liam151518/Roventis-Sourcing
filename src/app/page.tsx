"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Check,
  X,
  Database,
  Lock,
  FileText,
  TrendingUp,
  BarChart3,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { Footer } from "@/components/ui/footer-section";

import "./landing.css";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [calculatorDeals, setCalculatorDeals] = useState(5);
  const [calculatorValue, setCalculatorValue] = useState(100000);
  const [calculatorTier, setCalculatorTier] = useState("bronze");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tierRates: Record<string, number> = {
    bronze: 5,
    silver: 7.5,
    gold: 10,
    platinum: 12,
  };

  const monthlyEarnings = Math.round(calculatorDeals * calculatorValue * (tierRates[calculatorTier] / 100));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { label: "Benefits", href: "#benefits" },
    { label: "Compare", href: "#compare" },
    { label: "How it works", href: "#how" },
    { label: "Earnings", href: "#earnings" },
  ];

  const benefits = [
    {
      icon: Database,
      title: "Verified Lead Pool",
      desc: "Pre-qualified buyers across hospitality, corporate, and retail. Refreshed weekly.",
    },
    {
      icon: Lock,
      title: "Lead Exclusivity",
      desc: "Claim a lead and it's yours. Nobody else can contact it. 72-hour window.",
    },
    {
      icon: FileText,
      title: "Invoice Generator",
      desc: "Drag-and-drop product mockups. Branded PDFs in seconds, every time.",
    },
    {
      icon: TrendingUp,
      title: "Tier Progression",
      desc: "Bronze to Platinum. Higher tiers unlock more leads and higher commissions.",
    },
    {
      icon: BarChart3,
      title: "Real-time Dashboard",
      desc: "Track every lead, deal, and commission in one beautiful place.",
    },
    {
      icon: HeartHandshake,
      title: "Done-for-you Support",
      desc: "Dedicated account manager. Pricing locked by Roventis. You just sell.",
    },
  ];

  const steps = [
    { num: "01", title: "Apply", desc: "Complete your 5-minute application." },
    { num: "02", title: "Train", desc: "Finish onboarding to unlock your dashboard." },
    { num: "03", title: "Earn", desc: "Close deals and receive monthly payouts." },
  ];

  const compareRows = [
    { feature: "Verified buyer leads", us: true, them: false, none: false },
    { feature: "Lead exclusivity", us: true, them: false, none: false },
    { feature: "Built-in CRM pipeline", us: true, them: true, none: false },
    { feature: "Branded invoice generator", us: true, them: false, none: false },
    { feature: "Real-time commission tracking", us: true, them: true, none: false },
    { feature: "Dedicated account manager", us: true, them: false, none: false },
    { feature: "5% – 12% commission tiers", us: true, them: false, none: false },
  ];

  const faqItems = [
    { q: "Is this an MLM?", a: "No. This is a single-tier affiliate program. You earn on the deals you close — not by recruiting others." },
    { q: "How much can I realistically earn?", a: "There's no cap. Commissions range from 5% to 12% based on your tier. Top affiliates clear over R100,000/month." },
    { q: "Do I need sales experience?", a: "Helpful but not required. Our onboarding modules will get you ready to close in days." },
    { q: "How do I get paid?", a: "Commissions are paid monthly via EFT. Payments are typically processed within 5 days of deal closure." },
    { q: "What can I sell?", a: "Everything in the Roventis catalog — tactical gear, corporate merchandise, workwear, uniforms, and custom manufacturing." },
  ];

  const trustedBy = ["Velocity", "Nova Capital", "Apex", "Lumen Group", "Pinnacle", "Stratos", "Velocity", "Nova Capital", "Apex", "Lumen Group", "Pinnacle", "Stratos"];

  return (
    <>
      {/* === LOADING SCREEN === */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="loading-screen"
          >
            <div className="loading-shader" />
            <div className="loading-pulse" />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center"
            >
              <h1 className="loading-title">
                Roventis <span className="accent">Sourcing</span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="landing-bg min-h-screen text-[#1d1d1f] relative overflow-x-hidden"
      >
        {/* === NAVIGATION === */}
        <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/roventis-logo.png"
                alt="Roventis Sourcing"
                width={120}
                height={28}
                className="h-7 w-auto"
              />
            </Link>

            <ul className="hidden md:flex items-center gap-9">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[13px] text-[#1d1d1f]/80 hover:text-[#1d1d1f] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`w-5 h-px bg-[#1d1d1f] transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-1" : ""}`} />
              <span className={`w-5 h-px bg-[#1d1d1f] transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-px bg-[#1d1d1f] transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-1" : ""}`} />
            </button>

            <div className="hidden md:flex items-center gap-4">
              <Show when="signed-out">
                <Link href="/login" className="text-[13px] text-[#1d1d1f]/80 hover:text-[#1d1d1f]">
                  Sign in
                </Link>
                <Link
                  href="/apply"
                  className="bg-[#1d1d1f] text-white text-[13px] font-medium px-5 py-2 rounded-full hover:bg-[#2d2d2f] transition-colors"
                >
                  Apply now
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="bg-[#1d1d1f] text-white text-[13px] font-medium px-5 py-2 rounded-full hover:bg-[#2d2d2f] transition-colors"
                >
                  Dashboard
                </Link>
              </Show>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="md:hidden bg-[#faf9f7] border-b border-black/5"
              >
                <div className="px-6 py-4 flex flex-col gap-3">
                  {navLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm text-[#1d1d1f]/80 py-2"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="pt-3 border-t border-black/5 flex flex-col gap-3">
                    <Link href="/login" className="text-sm text-[#1d1d1f]/80">Sign in</Link>
                    <Link href="/apply" className="btn-apple text-center justify-center">
                      Apply now
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* === HERO SECTION === */}
        <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
          {/* Video Background */}
          <div className="hero-video-wrapper">
            <video
              className="hero-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="hero-video-overlay" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 12 : 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              <span className="text-[11px] font-medium tracking-wide text-[#1d1d1f]">
                Trusted by 200+ affiliates across South Africa
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 20 : 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="hero-headline mb-6"
            >
              Build a <span className="accent">real income</span><br />
              from sourcing.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 20 : 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hero-subhead max-w-2xl mx-auto mb-10"
            >
              Roventis Sourcing connects ambitious South Africans with verified buyers across hospitality, corporate, and retail. Earn up to 12% commission on every deal you close.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 16 : 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
            >
              <Link href="/apply" className="btn-apple-blue btn-apple">
                Apply now <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how" className="btn-ghost">
                See how it works
              </a>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: loading ? 0 : 1, y: loading ? 24 : 0 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-3xl mx-auto"
            >
              {[
                { value: "R23M+", label: "Deals closed" },
                { value: "200+", label: "Active affiliates" },
                { value: "5 days", label: "Avg. payout" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="big-number">{stat.value}</div>
                  <div className="text-[12px] text-[#6e6e73] mt-2 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <span>Scroll</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </section>

        {/* === LOGO STRIP === */}
        <section className="relative py-12 z-10">
          <p className="text-center text-[11px] tracking-widest uppercase text-[#6e6e73] mb-8">
            Affiliates earning with Roventis
          </p>
          <div className="logo-strip fade-edges">
            <div className="logo-strip-inner">
              {[...trustedBy, ...trustedBy].map((name, i) => (
                <span key={i} className="logo-item">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* === PRODUCT PREVIEW === */}
        <section className="relative py-20 px-6 z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="product-frame"
            >
              <Image
                src="/dashboard-view.png"
                alt="Roventis Dashboard"
                width={1600}
                height={1000}
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </section>

        {/* === BENEFITS === */}
        <section id="benefits" className="relative py-32 px-6 z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-16 max-w-2xl mx-auto"
            >
              <span className="section-eyebrow">Benefits</span>
              <h2 className="section-headline mt-4 mb-5">
                We've cracked <span className="accent">the code.</span>
              </h2>
              <p className="hero-subhead">
                Every tool, every lead, every commission — engineered to remove friction so you can focus on closing.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card p-8"
                >
                  <div className="feature-icon-glow mb-6">
                    <benefit.icon className="w-6 h-6 text-[#0071e3]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 tracking-tight">{benefit.title}</h3>
                  <p className="text-[15px] text-[#6e6e73] leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === COMPARE / DARK VOID === */}
        <section id="compare" className="relative dark-void pt-32 pb-32 px-6 z-10">
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-16 max-w-2xl mx-auto"
            >
              <span className="section-eyebrow" style={{ color: "#2997ff" }}>Why Roventis</span>
              <h2 className="section-headline mt-4 mb-5 text-white">
                Built different. <span className="accent">By design.</span>
              </h2>
              <p className="text-[#a1a1a6] text-lg">
                Compare what we offer against generic affiliate programs and freelance sourcing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card-dark overflow-hidden"
            >
              {/* Table header */}
              <div className="comparison-row border-b border-white/10">
                <div className="text-[13px] uppercase tracking-wider text-[#86868b] font-medium">
                  Feature
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071e3]/15 border border-[#0071e3]/30">
                    <span className="text-[13px] font-semibold text-[#2997ff]">Roventis</span>
                  </div>
                </div>
                <div className="text-center text-[13px] uppercase tracking-wider text-[#86868b] font-medium">
                  Others
                </div>
                <div className="text-center text-[13px] uppercase tracking-wider text-[#86868b] font-medium">
                  Freelance
                </div>
              </div>

              {compareRows.map((row, i) => (
                <div key={i} className="comparison-row">
                  <div className="text-white text-[15px]">{row.feature}</div>
                  <div className="flex justify-center">
                    {row.us ? <span className="check-icon"><Check className="w-4 h-4" strokeWidth={3} /></span> : <span className="x-icon"><X className="w-4 h-4" /></span>}
                  </div>
                  <div className="flex justify-center">
                    {row.them ? <span className="check-icon"><Check className="w-4 h-4" strokeWidth={3} /></span> : <span className="x-icon"><X className="w-4 h-4" /></span>}
                  </div>
                  <div className="flex justify-center">
                    {row.none ? <span className="check-icon"><Check className="w-4 h-4" strokeWidth={3} /></span> : <span className="x-icon"><X className="w-4 h-4" /></span>}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* === HOW IT WORKS === */}
        <section id="how" className="relative py-32 px-6 z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-20 max-w-2xl mx-auto"
            >
              <span className="section-eyebrow">How it works</span>
              <h2 className="section-headline mt-4 mb-5">
                Three steps. <span className="accent">First payout in 14 days.</span>
              </h2>
            </motion.div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.num} className="flex items-center flex-1 w-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div className="step-badge mb-5">{step.num}</div>
                    <h3 className="text-lg font-semibold mb-2 tracking-tight">{step.title}</h3>
                    <p className="text-[14px] text-[#6e6e73] max-w-[180px]">{step.desc}</p>
                  </motion.div>
                  {index < steps.length - 1 && <div className="step-connector hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === EARNINGS CALCULATOR === */}
        <section id="earnings" className="relative py-32 px-6 z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-16 max-w-2xl mx-auto"
            >
              <span className="section-eyebrow">Earnings</span>
              <h2 className="section-headline mt-4 mb-5">
                Calculate your <span className="accent">monthly potential.</span>
              </h2>
              <p className="hero-subhead">
                Move the sliders. See what you'd take home at every tier.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-8 md:p-10"
              >
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[15px] font-medium text-[#1d1d1f]">Deals per month</label>
                    <span className="text-[#0071e3] font-semibold text-lg tabular-nums">{calculatorDeals}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={calculatorDeals}
                    onChange={(e) => setCalculatorDeals(Number(e.target.value))}
                    className="apple-slider"
                  />
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[15px] font-medium text-[#1d1d1f]">Average deal size</label>
                    <span className="text-[#0071e3] font-semibold text-lg tabular-nums">{formatCurrency(calculatorValue)}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="10000"
                    value={calculatorValue}
                    onChange={(e) => setCalculatorValue(Number(e.target.value))}
                    className="apple-slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[15px] font-medium text-[#1d1d1f]">Your tier</label>
                    <span className="text-[#0071e3] font-semibold capitalize">{calculatorTier}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["bronze", "silver", "gold", "platinum"].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setCalculatorTier(tier)}
                        className={`py-3 px-3 rounded-xl text-[13px] font-medium capitalize transition-all ${
                          calculatorTier === tier
                            ? "bg-[#1d1d1f] text-white"
                            : "bg-white/50 text-[#6e6e73] hover:bg-white border border-black/5"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-8 md:p-10 flex flex-col justify-center"
              >
                <p className="text-[13px] uppercase tracking-wider text-[#6e6e73] mb-4">
                  Estimated monthly earnings
                </p>
                <div className="calc-display mb-10">
                  {formatCurrency(monthlyEarnings)}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(tierRates).map(([tier, rate]) => (
                    <div
                      key={tier}
                      className={`rounded-xl p-3 text-center transition-all ${
                        calculatorTier === tier
                          ? "bg-[#0071e3]/10 border border-[#0071e3]/20"
                          : "bg-white/40 border border-black/5"
                      }`}
                    >
                      <p className="capitalize text-[11px] text-[#6e6e73] mb-1">{tier}</p>
                      <p className="text-[#1d1d1f] font-semibold tabular-nums">{rate}%</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* === TESTIMONIAL === */}
        <section className="relative py-32 px-6 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="quote-glass mb-2">"</div>
              <p className="text-2xl md:text-3xl lg:text-[40px] font-medium leading-tight tracking-tight text-[#1d1d1f] mb-10 -mt-4">
                I made R47,000 in my first 60 days. The leads were already qualified. I just had to close. Roventis built the rails — I just rode them.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071e3] to-[#0050a0]" />
                <div className="text-left">
                  <p className="text-[15px] font-medium text-[#1d1d1f]">Thabo M.</p>
                  <p className="text-[13px] text-[#6e6e73]">Platinum Affiliate · Cape Town</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === FAQ === */}
        <section className="relative py-32 px-6 z-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mb-16"
            >
              <span className="section-eyebrow">FAQ</span>
              <h2 className="section-headline mt-4">
                Questions, <span className="accent">answered.</span>
              </h2>
            </motion.div>

            <div>
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="accordion-item"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="accordion-button"
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-[#0071e3] text-2xl leading-none font-light"
                    >
                      +
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-[16px] text-[#6e6e73] leading-relaxed pr-12">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* === FINAL CTA / PORTAL === */}
        <section className="relative py-32 px-6 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="section-headline mb-6">
                Stop trading time<br />for <span className="accent">low rates.</span>
              </h2>
              <p className="hero-subhead mb-12 max-w-xl mx-auto">
                Apply in 5 minutes. We review applications within 48 hours.
              </p>
              <Link href="/apply" className="portal-button">
                Apply now <ArrowUpRight className="w-4 h-4" />
              </Link>
              <p className="text-[13px] text-[#6e6e73] mt-8">
                Free forever. No credit card required.
              </p>
            </motion.div>
          </div>
        </section>

        {/* === FOOTER === */}
        <Footer />
      </motion.div>
    </>
  );
}
