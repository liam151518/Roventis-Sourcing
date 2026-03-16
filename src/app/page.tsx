"use client";

import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Play, TrendingUp, Users, DollarSign, Award, Briefcase, Zap, MessageCircle, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
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

  // Refs for scroll animations
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const howItWorksRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const howItWorksInView = useInView(howItWorksRef, { once: true });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="aurora-wave aurora-wave-1" />
        <div className="aurora-wave aurora-wave-2" />
        <div className="aurora-wave aurora-wave-3" />
        <div className="floating-orb floating-orb-1" />
        <div className="light-beam light-beam-1" />
        <div className="light-beam light-beam-2" />
        <div className="ambient-dots">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ambient-dot" />
          ))}
        </div>
        <div className="floating-orb floating-orb-3" />
        <div className="bg-noise" />
      </div>

      {/* Navigation – Apple-style minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="relative w-full px-6 lg:px-12 xl:px-20 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-8 w-auto min-w-[32px]">
                <Image
                  src="/roventis-logo.png"
                  alt="Roventis"
                  width={140}
                  height={32}
                  className="h-8 w-auto object-contain object-left transition-transform duration-300 group-hover:scale-105"
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
                    className="relative text-[13px] text-gray-400 hover:text-white px-4 py-2 transition-all duration-300 group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-500 group-hover:w-[calc(100%-16px)] transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <Link href="/login" className="text-[13px] text-gray-400 hover:text-white transition-colors hidden sm:block relative group">
                  Sign In
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
                </Link>
                <Link href="/apply" className="btn-primary text-[13px] px-5 py-2.5 relative overflow-hidden group">
                  <span className="relative z-10">Apply Now</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="btn-primary text-[13px] px-5 py-2.5">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </Show>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero – Edge to edge with animated background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 w-full px-6 lg:px-12 xl:px-20 pt-28 pb-24 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-overline mb-6"
          >
            Affiliate Program
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05] mb-8"
          >
            Turn Your Network{" "}
            <span className="gradient-text">Into Income</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed"
          >
            Join South Africa’s fastest-growing product sourcing affiliate program.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/apply" className="btn-primary text-[15px] px-10 py-4 flex items-center gap-2">
              Start Earning
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-[15px] px-10 py-4 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Affiliate Login
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-28 grid grid-cols-3 gap-8 lg:gap-16 max-w-2xl mx-auto"
          >
            {[
              { value: "50+", label: "Active Affiliates" },
              { value: "R2M+", label: "Sales Generated" },
              { value: "R500K+", label: "Commissions Paid" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-semibold tracking-tight gradient-text">{stat.value}</div>
                <div className="text-gray-500 text-[13px] mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="py-28 md:py-44 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-purple-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="section-overline mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
              Start earning in four simple steps
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Apply, train, access materials, and earn.</p>
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative flex"
              >
                <div className="w-full h-[260px] flex flex-col rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6 text-center">
                  <div className="w-11 h-11 mx-auto mb-4 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-[11px] font-medium uppercase tracking-widest mb-1.5 flex-shrink-0">Step {item.step}</p>
                  <h3 className="text-white font-semibold text-[15px] mb-2 flex-shrink-0 leading-tight">{item.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-snug flex-1 min-h-0">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 transform translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section id="calculator" className="py-28 md:py-44 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-blue-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="section-overline mb-3">Earnings</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
              Calculate your earnings
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See how much you could earn based on your effort
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-8"
            >
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gray-300 font-medium">Deals per month</label>
                  <span className="text-blue-400 font-semibold">{calculatorDeals}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={calculatorDeals}
                  onChange={(e) => setCalculatorDeals(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gray-300 font-medium">Average deal size</label>
                  <span className="text-blue-400 font-semibold">{formatCurrency(calculatorValue)}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={calculatorValue}
                  onChange={(e) => setCalculatorValue(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-gray-300 font-medium">Your tier</label>
                  <span className="text-blue-400 font-semibold capitalize">{calculatorTier}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["bronze", "silver", "gold", "platinum"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setCalculatorTier(tier)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium capitalize transition-all ${
                        calculatorTier === tier
                          ? tier === "bronze" ? "bg-amber-500 text-black" :
                            tier === "silver" ? "bg-gray-400 text-black" :
                            tier === "gold" ? "bg-yellow-400 text-black" :
                            "bg-blue-500 text-white"
                          : "bg-white/10 text-gray-400 hover:bg-white/20"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Rates: Bronze 5% • Silver 7.5% • Gold 10% • Platinum 12%
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600/90 to-indigo-600/90 rounded-2xl p-8 text-white border border-white/10"
            >
              <h3 className="text-[17px] font-semibold mb-6 tracking-tight">Your potential earnings</h3>
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 rounded-xl p-5">
                  <div className="text-blue-200/90 text-[13px] mb-1">Monthly</div>
                  <div className="text-4xl font-semibold tracking-tight">{formatCurrency(monthlyEarnings)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-5">
                  <div className="text-blue-200/90 text-[13px] mb-1">Annual</div>
                  <div className="text-4xl font-semibold tracking-tight">{formatCurrency(annualEarnings)}</div>
                </div>
              </div>
              <p className="text-blue-200/80 text-[13px] mb-6">Top affiliates earn over R100,000/month</p>
              <Link
                href="/apply"
                className="block w-full py-3.5 bg-white text-black rounded-full font-medium text-[15px] text-center hover:bg-gray-100 transition-colors"
              >
                Start earning today
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-28 md:py-44 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-purple-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="section-overline mb-3">What you get</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Tools, catalogs, support, and growth.</p>
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
                transition={{ delay: index * 0.06 }}
                className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 hover:bg-[#111] hover:border-white/[0.12] transition-colors duration-300"
              >
                <div className="w-10 h-10 bg-white/[0.08] rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-gray-300" />
                </div>
                <h3 className="text-[17px] font-semibold tracking-tight mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-28 md:py-44 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-blue-950/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-overline mb-3">Who it’s for</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-4">
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
                transition={{ delay: index * 0.06 }}
                className="group"
              >
                <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 text-center hover:bg-[#111] hover:border-white/[0.12] transition-colors duration-300 h-full flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4 group-hover:bg-white/[0.12] transition-colors">
                    <person.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1 tracking-tight">{person.title}</h3>
                  <p className="text-gray-500 text-[13px] leading-snug">{person.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-28 md:py-44 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-purple-950/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="section-overline mb-3">Support</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Questions?
            </h2>
          </motion.div>

          <div className="space-y-2">
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
                transition={{ delay: index * 0.05 }}
                className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0d0d0d] hover:bg-[#111] transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="font-medium text-[15px]">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
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
                      <div className="px-6 pb-4 text-gray-500 text-[14px] leading-relaxed">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
