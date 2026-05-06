"use client";

import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Play, TrendingUp, Users, DollarSign, Award, Briefcase, Zap, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { Footer } from "@/components/ui/footer-section";

export default function LandingPage() {
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
  const annualEarnings = monthlyEarnings * 12;

  const heroRef = useRef(null);
  const howItWorksRef = useRef(null);
  const calculatorRef = useRef(null);
  const benefitsRef = useRef(null);
  const faqRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const howItWorksInView = useInView(howItWorksRef, { once: true });
  const calculatorInView = useInView(calculatorRef, { once: true });
  const benefitsInView = useInView(benefitsRef, { once: true });
  const faqInView = useInView(faqRef, { once: true });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Navigation - sticky with backdrop blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050508]/80 border-b border-white/[0.04]">
        <div className="w-full px-6 lg:px-12 py-5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-8 w-auto">
                <Image
                  src="/roventis-logo.png"
                  alt="Roventis"
                  width={140}
                  height={32}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            <ul className="hidden lg:flex items-center gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Earnings", href: "#calculator" },
                { label: "Benefits", href: "#benefits" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[13px] text-slate-400 hover:text-white px-4 py-2 transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link href="/apply" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-[13px] font-medium px-5 py-2 rounded-full transition-all duration-200">
                  Apply Now
                </Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-[13px] font-medium px-5 py-2 rounded-full transition-all duration-200">
                  Dashboard
                </Link>
                <UserButton />
              </Show>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center topo-bg overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(124,58,237,0.15) 0%, transparent 60%)"
          }}
        />
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 w-full px-6 pt-28 pb-24 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[11px] font-semibold tracking-widest uppercase mb-6"
          >
            Affiliate Program
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] leading-[0.95] mb-8"
            style={{
              background: "linear-gradient(135deg, #C4B5FD 0%, #93C5FD 50%, #7DD3FC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Turn Your Network Into Income
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-14"
          >
            Join South Africa's fastest-growing product sourcing affiliate program.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/apply" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-[15px] font-medium px-8 py-4 rounded-full transition-all duration-200 flex items-center gap-2">
              Start Earning
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="border border-white/15 text-slate-300 hover:border-white/30 hover:text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Affiliate Login
            </Link>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-28 flex items-center justify-center gap-8 lg:gap-16"
          >
            {[
              { value: "50+", label: "ACTIVE AFFILIATES" },
              { value: "R2M+", label: "SALES GENERATED" },
              { value: "R500K+", label: "COMMISSIONS PAID" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
                {index < 2 && <div className="hidden lg:block absolute w-px h-8 bg-white/10" style={{ marginLeft: '4rem' }} />}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-slate-600" />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-28 md:py-44 relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-400 mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white mb-4">
              Start earning in four simple steps
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Apply, train, access materials, and earn.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { step: 1, title: "Apply & Get Approved", desc: "Complete your application and get verified", icon: Users },
              { step: 2, title: "Complete Training", desc: "Watch video modules and pass the quiz", icon: Award },
              { step: 3, title: "Access Materials", desc: "Get catalogs, pricing, and sales tools", icon: Zap },
              { step: 4, title: "Earn Commission", desc: "Close deals and watch your income grow", icon: TrendingUp },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="bg-[#0D0D12] border border-white/[0.06] rounded-2xl p-8 h-[260px] flex flex-col">
                  <span className="font-mono text-6xl font-black text-white/[0.04] absolute top-4 right-6">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center mb-4 mt-4">
                    <item.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight mb-2">{item.desc}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-auto">{item.title}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 transform translate-x-full -translate-y-1/2 z-10 pointer-events-none">
                    <ArrowRight className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator Section */}
      <section id="calculator" ref={calculatorRef} className="py-28 md:py-44 relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-400 mb-3">Earnings</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white mb-4">
              Calculate your earnings
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              See how much you could earn based on your effort
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0D0D12] border border-white/[0.06] rounded-3xl p-8 md:p-12"
            >
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-300 font-medium">Deals per month</label>
                  <span className="text-violet-400 font-semibold">{calculatorDeals}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={calculatorDeals}
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
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={calculatorValue}
                  onChange={(e) => setCalculatorValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-slate-300 font-medium">Your tier</label>
                  <span className="text-violet-400 font-semibold capitalize">{calculatorTier}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["bronze", "silver", "gold", "platinum"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setCalculatorTier(tier)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        calculatorTier === tier
                          ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                          : "text-slate-400 hover:text-white bg-white/[0.06]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Rates: Bronze 5% • Silver 7.5% • Gold 10% • Platinum 12%
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0D0D12] border border-white/[0.06] rounded-3xl p-8 md:p-12"
            >
              <h3 className="text-[17px] font-semibold text-slate-400 mb-6 tracking-tight">Your potential earnings</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white/[0.04] rounded-2xl p-6">
                  <div className="text-slate-400 text-[13px] mb-1">Monthly</div>
                  <div 
                    className="font-mono text-5xl md:text-7xl font-extrabold text-white tracking-tight"
                    style={{ textShadow: "0 0 40px rgba(16,185,129,0.3)" }}
                  >
                    {formatCurrency(monthlyEarnings)}
                  </div>
                </div>
                <div className="bg-white/[0.04] rounded-2xl p-6">
                  <div className="text-slate-400 text-[13px] mb-1">Annual</div>
                  <div className="font-mono text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    {formatCurrency(annualEarnings)}
                  </div>
                </div>
              </div>
              <p className="text-slate-500 text-[13px] mb-6">Top affiliates earn over R100,000/month</p>
              <Link
                href="/apply"
                className="block w-full py-4 bg-white text-black rounded-full font-semibold text-[15px] text-center hover:bg-gray-100 transition-colors"
              >
                Start earning today
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" ref={benefitsRef} className="py-28 md:py-44 relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-400 mb-3">What you get</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Tools, catalogs, support, and growth.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Briefcase, title: "Professional Tools", desc: "Sales scripts, objection handling guides, and closing techniques" },
              { icon: Zap, title: "Exclusive Catalogs", desc: "Full access to our entire product range with wholesale pricing" },
              { icon: MessageCircle, title: "Dedicated Support", desc: "Direct access to our team for quotes and client support" },
              { icon: TrendingUp, title: "Real-time Tracking", desc: "Dashboard to monitor your deals, commissions, and progress" },
              { icon: DollarSign, title: "Fast Payouts", desc: "Monthly commissions paid directly to your bank account" },
              { icon: Award, title: "Growth Path", desc: "Tier upgrades unlock higher commission rates and perks" },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-[#0D0D12] border border-white/[0.06] hover:border-violet-500/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.08)]"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/15 to-blue-600/15 border border-violet-500/15 group-hover:border-violet-500/30 flex items-center justify-center transition-all duration-300 mb-4">
                  <benefit.icon className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-[17px] font-semibold tracking-tight mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-28 md:py-44 relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-400 mb-3">Who it's for</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] text-white">
              Our affiliate program is perfect for
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Sales Professionals", desc: "Leverage your existing network", icon: TrendingUp },
              { title: "Entrepreneurs", desc: "Build additional revenue", icon: Briefcase },
              { title: "Consultants", desc: "Offer sourcing to clients", icon: MessageCircle },
              { title: "Industry Experts", desc: "Turn knowledge into income", icon: Award },
            ].map((person, index) => (
              <motion.div
                key={person.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#0D0D12] border-l-2 border-violet-500/40 rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-1">{person.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{person.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" ref={faqRef} className="py-28 md:py-44 relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent absolute top-0 left-0 right-0" />
        <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-400 mb-3">Support</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
              Questions?
            </h2>
          </motion.div>

          <div className="divide-y divide-white/[0.06]">
            {[
              { q: "Is this an MLM?", a: "No, this is a single-tier affiliate program. You earn commissions on deals you close, not from recruiting others." },
              { q: "How much can I earn?", a: "There's no cap! Commission rates range from 5% to 12% based on your tier. Top affiliates earn over R100,000/month." },
              { q: "Do I need sales experience?", a: "Experience is preferred but not required. We provide comprehensive training and resources." },
              { q: "How do I get paid?", a: "Commissions are paid monthly via EFT. Payments are processed within 30 days of deal closure." },
              { q: "What products can I sell?", a: "Everything in the Roventis catalog: tactical gear, corporate merchandise, workwear, uniforms, and custom manufacturing." },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full py-5 text-base font-medium text-white flex items-center justify-between hover:text-violet-300 transition-colors duration-200"
                >
                  {faq.q}
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="pb-5 text-sm text-slate-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-blue-900/20 to-cyan-900/20" />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)"
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-violet-400 mb-4">
            Ready to start earning?
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Join South Africa's fastest-growing sourcing affiliate network.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Apply in 2 minutes. Start earning commission on your first deal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apply" className="px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-500/20">
              Apply Now — It's Free
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-full border border-white/15 text-slate-300 hover:border-white/30 hover:text-white text-sm font-medium transition-all duration-200">
              Already a member? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}