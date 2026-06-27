"use client";

import { useRef, useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show } from "@clerk/nextjs";
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react";
import { formatCurrency } from "@/lib/utils";
import { Footer } from "@/components/ui/footer-section";
import { Header } from "@/components/ui/header-2";

import "./landing.css";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [calculatorDeals, setCalculatorDeals] = useState(5);
  const [calculatorValue, setCalculatorValue] = useState(100000);
  const [calculatorTier, setCalculatorTier] = useState("bronze");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tierRates: Record<string, number> = {
    bronze: 5,
    silver: 7.5,
    gold: 10,
    platinum: 12,
  };

  const monthlyEarnings = Math.round(calculatorDeals * calculatorValue * (tierRates[calculatorTier] / 100));

  useEffect(() => {
    // Skip animation if returning from client-side navigation (same window context)
    if ((window as unknown as Record<string, boolean>).__rvLoaded) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(false);
      (window as unknown as Record<string, boolean>).__rvLoaded = true;
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

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
    { feature: "5% to 12% commission tiers", us: true, them: false, none: false },
  ];

  const faqItems = [
    { q: "Is this an MLM?", a: "No. This is a single-tier affiliate program. You earn on the deals you close, not by recruiting others." },
    { q: "How much can I realistically earn?", a: "There's no cap. Commissions range from 5% to 12% based on your tier. Top affiliates clear over R100,000/month." },
    { q: "Do I need sales experience?", a: "Helpful but not required. Our onboarding modules will get you ready to close in days." },
    { q: "How do I get paid?", a: "Commissions are paid monthly via EFT. Payments are typically processed within 5 days of deal closure." },
    { q: "What can I sell?", a: "Everything in the Roventis catalog: tactical gear, corporate merchandise, workwear, uniforms, and custom manufacturing." },
  ];

  const trustedBy = ["Velocity", "Nova Capital", "Apex", "Lumen Group", "Pinnacle", "Stratos", "Velocity", "Nova Capital", "Apex", "Lumen Group", "Pinnacle", "Stratos"];

  return (
    <>
      {/* === LOADING SCREEN === */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="loading-screen"
          >
            {/* Shader layers */}
            <MeshGradient
              className="absolute inset-0 w-full h-full"
              colors={["#faf9f7", "#e8eef9", "#cfe0fb", "#0071e3"]}
              speed={0.55}
              distortion={0.85}
              swirl={0.6}
              grainMixer={0.04}
              grainOverlay={0.02}
            />
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <DotOrbit
                className="w-full h-full"
                colors={["#0071e3", "#bcd4f5"]}
                colorBack="rgba(0,0,0,0)"
                speed={0.8}
                size={0.35}
                spreading={0.6}
              />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(250,249,247,0.7)_75%,_rgba(250,249,247,1)_100%)]" />

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="relative z-10 text-center"
            >
              <h1 className="loading-title">
                Roventis <span className="accent">Sourcing</span>
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="mt-6 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#0071e3] to-transparent origin-left"
              />
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
        <Header />

        {/* === HERO SECTION === */}
        <section className="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
          {/* Video Background */}
          <div className="hero-video-wrapper">
            <video
              className="hero-video"
              autoPlay
              muted
              playsInline
              preload="auto"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="hero-video-overlay" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
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
              className="hero-subhead max-w-xl mx-auto mb-10"
            >
              Verified buyers. Locked-in pricing. Up to 12% commission on every deal you close.
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
              className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 max-w-3xl mx-auto"
            >
              {[
                { value: "R23M+", label: "Deals closed" },
                { value: "200+", label: "Active affiliates" },
                { value: "5 days", label: "Avg. payout" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="hero-stat-number">{stat.value}</div>
                  <div className="text-[11px] text-[#6e6e73] mt-2 uppercase tracking-[0.1em]">{stat.label}</div>
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
                Every tool, every lead, every commission, engineered to remove friction so you can focus on closing.
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

            <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 md:gap-0 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <Fragment key={step.num}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center md:flex-1"
                  >
                    <div className="step-badge mb-5">{step.num}</div>
                    <h3 className="text-lg font-semibold mb-2 tracking-tight">{step.title}</h3>
                    <p className="text-[14px] text-[#6e6e73] max-w-[180px]">{step.desc}</p>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="step-connector hidden md:flex md:items-center md:self-center md:mx-2" />
                  )}
                </Fragment>
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
                I made R47,000 in my first 60 days. The leads were already qualified. I just had to close. Roventis built the rails, I just rode them.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071e3] to-[#0050a0]" />
                <div className="text-left">
                  <p className="text-[15px] font-medium text-[#1d1d1f]">Thabo M.</p>
                  <p className="text-[13px] text-[#6e6e73]">Platinum Affiliate, Cape Town</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* === FAQ === */}
        <section id="faq" className="relative py-32 px-6 z-10">
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
