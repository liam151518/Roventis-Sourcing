"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown, ChevronDown, Check, Play, TrendingUp, Zap, ShieldCheck, Users, Award, Briefcase, Database, Lock, FileText, BarChart3, HeartHandshake, DollarSign, Target, Clock, Building } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { Footer } from "@/components/ui/footer-section";

import "./landing.css";

export default function LandingPage() {
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

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const darkInterludeRef = useRef(null);
  const howItWorksRef = useRef(null);
  const calculatorRef = useRef(null);
  const benefitsRef = useRef(null);
  const testimonialRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Earnings", href: "#calculator" },
    { label: "Benefits", href: "#benefits" },
    { label: "FAQ", href: "#faq" },
  ];

  const statItems = [
    { icon: TrendingUp, value: "15%", label: "Top commission rate" },
    { icon: Zap, value: "5 days", label: "Average payout time" },
    { icon: ShieldCheck, value: "100%", label: "Verified buyer leads" },
    { icon: Users, value: "200+", label: "Active affiliates" },
  ];

  const steps = [
    { step: 1, title: "Apply", desc: "Complete your application and get verified by our team.", icon: Users },
    { step: 2, title: "Train", desc: "Complete the onboarding modules to unlock your dashboard.", icon: Award },
    { step: 3, title: "Sell", desc: "Access verified leads and close deals with your customers.", icon: Briefcase },
    { step: 4, title: "Earn", desc: "Track commissions and receive monthly payouts.", icon: DollarSign },
  ];

  const benefits = [
    { icon: Database, title: "Verified lead pool", desc: "Pre-qualified buyers across hospitality, corporate, and retail. Refreshed weekly." },
    { icon: Lock, title: "Lead exclusivity", desc: "Claim a lead and it's yours. Nobody else can contact it. 72-hour conversion window." },
    { icon: FileText, title: "Invoice generator", desc: "Drag-and-drop product mockups. Branded PDFs in seconds." },
    { icon: TrendingUp, title: "Tier progression", desc: "Bronze to Platinum. Higher tiers unlock more leads, higher commissions, and faster payouts." },
    { icon: BarChart3, title: "Real-time dashboard", desc: "Track every lead, deal, and commission in one place." },
    { icon: HeartHandshake, title: "Done-for-you support", desc: "Dedicated account manager. Pricing locked by Roventis. You just sell." },
  ];

  const faqItems = [
    { q: "Is this an MLM?", a: "No, this is a single-tier affiliate program. You earn commissions on deals you close, not from recruiting others." },
    { q: "How much can I earn?", a: "There's no cap! Commission rates range from 5% to 12% based on your tier. Top affiliates earn over R100,000/month." },
    { q: "Do I need sales experience?", a: "Experience is preferred but not required. We provide comprehensive training and resources." },
    { q: "How do I get paid?", a: "Commissions are paid monthly via EFT. Payments are processed within 5 days of deal closure." },
    { q: "What products can I sell?", a: "Everything in the Roventis catalog: tactical gear, corporate merchandise, workwear, uniforms, and custom manufacturing." },
  ];

  const companyNames = ["Velocity Trading", "Nova Capital", "Apex Holdings", "Lumen Group", "Pinnacle Co.", "Stratos Ventures"];

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* SECTION 1: TOP NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0b]/70 border-b border-white/[0.06] h-16">
        <div className="w-full px-6 lg:px-12 h-full">
          <div className="flex items-center justify-between max-w-7xl mx-auto h-full">
            <Link href="/" className="flex items-center">
              <Image src="/roventis-logo.png" alt="Roventis Sourcing" width={140} height={32} className="h-8 w-auto" />
            </Link>

            <ul className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-slate-400 hover:text-white px-4 py-2 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-6 h-0.5 bg-white transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

            <div className="hidden lg:flex items-center gap-3">
              <Show when="signed-out">
                <Link href="/login" className="text-sm text-slate-400 hover:text-white hidden sm:block">Sign in</Link>
                <Link href="/apply" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-[13px] font-medium px-5 py-2 rounded-full glow-pill">
                  Apply now
                </Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-[13px] font-medium px-5 py-2 rounded-full glow-pill">
                  Go to dashboard
                </Link>
              </Show>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0a0a0b] border-b border-white/[0.06] lg:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-slate-400 hover:text-white py-2 px-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2: HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center topo-bg pt-16">
        <div className="absolute inset-0 bg-radial-gradient from-violet-950/30 via-transparent to-transparent" />
        
        <div className="relative z-10 w-full px-6 py-24 text-center max-w-[880px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
              <span className="text-[11px] tracking-widest uppercase font-semibold text-violet-300">TRUSTED BY 50+ AFFILIATES IN SOUTH AFRICA</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[88px] font-extrabold tracking-[-0.04em] leading-[0.95] mb-8"
          >
            Build a{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">real</span>
            {" "}income from sourcing.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed mb-12"
          >
            Roventis Sourcing connects ambitious South Africans with verified buyers across hospitality, corporate, and retail. Earn up to 15% commission on every deal you close.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/apply" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white px-7 py-3.5 rounded-full text-[15px] font-medium flex items-center gap-2 glow-pill">
              Apply now <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="border border-white/15 text-slate-300 hover:border-white/30 hover:text-white px-6 py-3.5 rounded-full text-sm font-medium">
              How it works
            </a>
          </motion.div>

          {/* Hero Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:flex items-center justify-center gap-6 sm:gap-8 lg:gap-16 mt-16 sm:mt-20"
          >
            {[
              { value: "R23M+", label: "Total deals closed" },
              { value: "200+", label: "Active affiliates" },
              { value: "5 days", label: "Average payout" },
              { value: "98%", label: "Affiliate satisfaction" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center relative">
                <div className="hero-stat-number">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
                {index < 3 && <div className="hidden lg:block absolute w-px h-8 bg-white/10" style={{ marginLeft: '4rem' }} />}
              </div>
            ))}
          </motion.div>

          {/* Browser Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 sm:mt-20"
          >
            <div className="browser-frame max-w-[880px] xl:max-w-[1100px] mx-auto">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <div className="browser-dots">
                  <div className="browser-dot bg-red-500" />
                  <div className="browser-dot bg-yellow-500" />
                  <div className="browser-dot bg-green-500" />
                </div>
                <span className="browser-url">app.roventis.co.za</span>
              </div>
              <div className="aspect-[16/10] bg-gradient-to-br from-violet-950/30 to-[#0a0a0b] relative flex items-center justify-center">
                <Image src="/dashboard-view.png" alt="Roventis Dashboard" width={1600} height={1000} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#0a0a0b] to-transparent" />
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ArrowDown className="w-6 h-6 text-slate-600" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: LOGO STRIP */}
      <section className="py-12 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-8">Affiliates already earning with Roventis</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap justify-center gap-6 lg:gap-12">
            {companyNames.map((name) => (
              <span key={name} className="text-xl sm:text-2xl font-semibold text-slate-600 hover:text-slate-400 transition">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: STATS GRID */}
      <section ref={statsRef} className="py-24 md:py-32">
        <div className="max-w-6xl 2xl:max-w-[1440px] mx-auto px-6 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-5xl font-bold text-white mt-6">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="#how-it-works" className="text-violet-400 hover:text-violet-300 text-sm">
              Explore the full benefits below <span className="ml-1">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 5: DARK INTERLUDE BAND */}
      <section ref={darkInterludeRef} className="py-24 md:py-32 relative topo-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b] via-[#0f0a1f] to-[#0a0a0b]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-violet-400 mb-4">BUILT FOR HUSTLERS</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6">
                Sourcing made simple. Earnings made serious.
              </h2>
              <p className="text-slate-400 text-lg mb-4">
                We've built the infrastructure. The CRM, the lead pool, the verified buyers, the invoice generator, the commission engine. You just close deals.
              </p>
              <a href="#benefits" className="text-violet-400 hover:text-violet-300 text-sm">
                Learn more <span>→</span>
              </a>
            </div>
            <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
              {[
                "✓ Verified buyer database — refreshed weekly",
                "✓ Built-in CRM with deal pipeline", 
                "✓ Auto-generated invoices in your branding"
              ].map((item) => (
                <div key={item} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-slate-300">
                  <span className="text-violet-400 mr-2">✓</span>{item.replace("✓ ", "")}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: HOW IT WORKS */}
      <section id="how-it-works" ref={howItWorksRef} className="py-24 md:py-32 bg-[#0a0a0b]">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 2xl:px-16">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-violet-400 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-4">From application to first commission in 14 days.</h2>
            <p className="text-slate-400 text-lg">Four steps. No surprises.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 min-h-[220px] md:min-h-[260px] flex flex-col relative"
              >
                <span className="step-number-ghost absolute top-4 right-6">{step.step}</span>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mt-4 mb-4">
                  <step.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: EARNINGS CALCULATOR */}
      <section id="calculator" ref={calculatorRef} className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-radial-gradient from-violet-950/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 2xl:px-16">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-violet-400 mb-3">Earnings</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-4">Calculate your potential.</h2>
            <p className="text-slate-400 text-lg">Move the sliders. See what you'd earn at every tier.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-[#0d0d12] border border-white/[0.06] rounded-3xl p-6 sm:p-10 md:p-14">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-300 font-medium">Deals per month</label>
                  <span className="text-violet-400 font-semibold">{calculatorDeals}</span>
                </div>
                <input
                  type="range" min="1" max="20" value={calculatorDeals}
                  onChange={(e) => setCalculatorDeals(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-violet-500"
                />
              </div>
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-300 font-medium">Average deal size</label>
                  <span className="text-violet-400 font-semibold">{formatCurrency(calculatorValue)}</span>
                </div>
                <input
                  type="range" min="10000" max="500000" step="10000" value={calculatorValue}
                  onChange={(e) => setCalculatorValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-violet-500"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-300 font-medium">Your tier</label>
                  <span className="text-violet-400 font-semibold capitalize">{calculatorTier}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["bronze", "silver", "gold", "platinum"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setCalculatorTier(tier)}
                      className={`flex-1 sm:flex-none py-3 px-2 sm:px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                        calculatorTier === tier
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                          : "text-slate-400 hover:text-white bg-white/[0.06]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0d0d12] border border-white/[0.06] rounded-3xl p-6 sm:p-10 md:p-14 flex flex-col justify-center">
              <p className="text-slate-400 text-[13px] mb-4">Monthly earnings estimate</p>
              <div className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
                {formatCurrency(monthlyEarnings)}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tierRates).map(([tier, rate]) => (
                  <div key={tier} className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <p className="capitalize text-xs text-slate-400">{tier}</p>
                    <p className="text-white font-semibold">{rate}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: BENEFITS GRID */}
      <section id="benefits" ref={benefitsRef} className="py-24 md:py-32 bg-[#0a0a0b]">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 2xl:px-16">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-violet-400 mb-3">Why Roventis</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-4">Everything you need to scale, nothing you don't.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-7"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: TESTIMONIAL */}
      <section ref={testimonialRef} className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-[#0d0d12] border border-white/[0.06] rounded-3xl p-8 md:p-16 text-center">
            <p className="text-[#8b5cf6] text-[6rem] leading-[0.5] mb-6 font-serif">"</p>
            <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed tracking-tight mb-8">
              "I made R47,000 in my first 60 days. The leads were already qualified. I just had to close. Roventis built the rails — I just rode them."
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
              <div className="text-left">
                <p className="text-white font-medium">Thabo M.</p>
                <p className="text-slate-400 text-sm">Platinum Affiliate, Cape Town</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-6">Numbers are real. Names changed for privacy.</p>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section id="faq" ref={faqRef} className="py-24 md:py-32 bg-[#0a0a0b]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-widest text-violet-400 mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em]">Everything else.</h2>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {faqItems.map((faq, index) => (
              <motion.div key={index}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full py-6 text-lg font-medium text-white flex items-center justify-between"
                >
                  {faq.q}
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: FINAL CTA BAND */}
      <section ref={ctaRef} className="py-24 md:py-32 relative overflow-hidden topo-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-[#0a0a0b] to-indigo-900/30" />
        <div className="relative max-w-4xl 2xl:max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] mb-6">Stop trading time for low rates.</h2>
          <p className="text-slate-400 text-lg mb-10">Apply in 5 minutes. We review applications within 48 hours.</p>
          <Link href="/apply" className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white px-8 py-4 rounded-full text-[15px] font-medium glow-pill">
            Apply now
          </Link>
          <p className="text-xs text-slate-500 mt-6">Free forever. No card required.</p>
        </div>
      </section>

      {/* SECTION 12: FOOTER */}
      <Footer />
    </div>
  );
}