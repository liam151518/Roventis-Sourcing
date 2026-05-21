"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Check, Users, Award, Briefcase, Database, Lock, FileText, BarChart3, HeartHandshake, DollarSign, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Show } from "@clerk/nextjs";
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
  const benefitsRef = useRef(null);
  const specsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const calculatorRef = useRef(null);
  const testimonialRef = useRef(null);
  const ctaRef = useRef(null);

  const navLinks = [
    { label: "Benefits", href: "#benefits" },
    { label: "Specs", href: "#specs" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
  ];

  const companyLogos = ["Velocity Trading", "Nova Capital", "Apex Holdings", "Lumen Group", "Pinnacle Co.", "Stratos Ventures"];

  const benefits = [
    {
      icon: Database,
      title: "Verified Lead Pool",
      desc: "Pre-qualified buyers across hospitality, corporate, and retail. Refreshed weekly."
    },
    {
      icon: Lock,
      title: "Lead Exclusivity",
      desc: "Claim a lead and it's yours. Nobody else can contact it. 72-hour conversion window."
    },
    {
      icon: FileText,
      title: "Invoice Generator",
      desc: "Drag-and-drop product mockups. Branded PDFs in seconds."
    },
    {
      icon: TrendingUp,
      title: "Tier Progression",
      desc: "Bronze to Platinum. Higher tiers unlock more leads, higher commissions, and faster payouts."
    }
  ];

  const specs = [
    { feature: "Verified buyer leads", roventis: true, others: [false, false] },
    { feature: "Lead exclusivity", roventis: true, others: [false, false] },
    { feature: "Invoice generator", roventis: true, others: [false, false] },
    { feature: "Real-time dashboard", roventis: true, others: [true, false] },
    { feature: "Commission tracking", roventis: true, others: [true, false] },
    { feature: "Training resources", roventis: true, others: [true, true] },
  ];

  const steps = [
    { step: 1, title: "Get Started", desc: "Complete your application in 5 minutes." },
    { step: 2, title: "Customize & Configure", desc: "Finish onboarding modules to unlock your dashboard." },
    { step: 3, title: "Grow Your Business", desc: "Access verified leads and close deals." },
  ];

  const faqItems = [
    { q: "Is this an MLM?", a: "No, this is a single-tier affiliate program. You earn commissions on deals you close, not from recruiting others." },
    { q: "How much can I earn?", a: "There's no cap! Commission rates range from 5% to 12% based on your tier. Top affiliates earn over R100,000/month." },
    { q: "Do I need sales experience?", a: "Experience is preferred but not required. We provide comprehensive training and resources." },
    { q: "How do I get paid?", a: "Commissions are paid monthly via EFT. Payments are processed within 5 days of deal closure." },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1d1d1f]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/roventis-logo.png" alt="Roventis Sourcing" width={120} height={28} className="h-7 w-auto" />
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link href="/login" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] hidden sm:block">Sign in</Link>
              <Link href="/apply" className="bg-[#1d1d1f] text-white text-[13px] font-medium px-5 py-2 rounded-full hover:bg-[#2d2d2f] transition-colors">
                Apply now
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="bg-[#1d1d1f] text-white text-[13px] font-medium px-5 py-2 rounded-full hover:bg-[#2d2d2f] transition-colors">
                Dashboard
              </Link>
            </Show>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[#6e6e73] text-sm font-medium">Trusted by 200+ affiliates in South Africa</span>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mt-6 mb-6 text-[#1d1d1f]">
            Build a real income<br />from sourcing.
          </h1>

          <p className="text-xl text-[#6e6e73] max-w-2xl mx-auto mb-10 leading-relaxed">
            Roventis Sourcing connects ambitious South Africans with verified buyers across hospitality, corporate, and retail. Earn up to 15% commission on every deal you close.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/apply" className="bg-[#1d1d1f] text-white px-8 py-4 rounded-full text-[15px] font-medium flex items-center gap-2 hover:bg-[#2d2d2f] transition-colors">
              Apply now <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="bg-white border border-black/10 text-[#1d1d1f] px-8 py-4 rounded-full text-[15px] font-medium hover:bg-[#f5f5f5] transition-colors">
              How it works
            </a>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
            {[
              { value: "R23M+", label: "Total deals closed" },
              { value: "200+", label: "Active affiliates" },
              { value: "5 days", label: "Average payout" },
              { value: "98%", label: "Satisfaction rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">{stat.value}</div>
                <div className="text-sm text-[#6e6e73] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Product Image */}
          <div className="relative">
            <div className="bg-gradient-to-b from-[#e8e8e8] to-[#faf9f7] rounded-3xl p-8">
              <Image src="/dashboard-view.png" alt="Roventis Dashboard" width={1200} height={750} className="w-full rounded-2xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" ref={benefitsRef} className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#0071e3] text-sm font-semibold tracking-wide uppercase">Benefits</span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 text-[#1d1d1f]">
              We've cracked the code.
            </h2>
            <p className="text-xl text-[#6e6e73] mt-4 max-w-xl mx-auto">
              Roventis provides real insights, without the data overload.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-black/5"
              >
                <div className="w-12 h-12 bg-[#0071e3]/10 rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-6 h-6 text-[#0071e3]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1d1d1f]">{benefit.title}</h3>
                <p className="text-[#6e6e73] leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border border-black/5"
            >
              <div className="w-12 h-12 bg-[#0071e3]/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-[#0071e3]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#1d1d1f]">Real-time Dashboard</h3>
              <p className="text-[#6e6e73] leading-relaxed">Track every lead, deal, and commission in one place.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 border border-black/5"
            >
              <div className="w-12 h-12 bg-[#0071e3]/10 rounded-2xl flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6 text-[#0071e3]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#1d1d1f]">Done-for-you Support</h3>
              <p className="text-[#6e6e73] leading-relaxed">Dedicated account manager. Pricing locked by Roventis. You just sell.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 border border-black/5"
            >
              <div className="w-12 h-12 bg-[#0071e3]/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-[#0071e3]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#1d1d1f]">Verified Buyers</h3>
              <p className="text-[#6e6e73] leading-relaxed">100% verified buyer database. Every lead is pre-qualified.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE / SPECS */}
      <section id="specs" ref={specsRef} className="py-24 px-6 bg-[#1d1d1f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#6e6e73] text-sm font-semibold tracking-wide uppercase">Specs</span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 text-white">
              Why Choose Roventis?
            </h2>
            <p className="text-xl text-[#6e6e73] mt-4 max-w-xl mx-auto">
              You need a solution that keeps up. That's why we built Roventis.
            </p>
          </div>

          <div className="bg-[#272727] rounded-3xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/10">
              <div className="text-[#6e6e73] text-sm">Feature</div>
              <div className="text-white text-sm font-semibold">Roventis</div>
              <div className="text-[#6e6e73] text-sm">Others</div>
              <div className="text-[#6e6e73] text-sm">None</div>
            </div>
            {specs.map((spec, index) => (
              <div key={spec.feature} className="grid grid-cols-4 gap-4 p-6 border-b border-white/5">
                <div className="text-white text-sm">{spec.feature}</div>
                <div>{spec.roventis ? <Check className="w-5 h-5 text-[#34c759]" /> : null}</div>
                <div>{spec.others[0] ? <Check className="w-5 h-5 text-[#34c759]" /> : null}</div>
                <div>{spec.others[1] ? <Check className="w-5 h-5 text-[#34c759]" /> : null}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="#how-it-works" className="text-white text-sm font-medium hover:text-[#0071e3] transition-colors">
              Learn more about our features <span className="ml-1">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" ref={howItWorksRef} className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#0071e3] text-sm font-semibold tracking-wide uppercase">How it works</span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 text-[#1d1d1f]">
              Map Your Success
            </h2>
            <p className="text-xl text-[#6e6e73] mt-4">Three steps to your first commission.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#1d1d1f] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-semibold">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#1d1d1f]">{step.title}</h3>
                <p className="text-[#6e6e73]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EARNINGS CALCULATOR */}
      <section id="calculator" ref={calculatorRef} className="py-24 px-6 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#0071e3] text-sm font-semibold tracking-wide uppercase">Earnings</span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 text-[#1d1d1f]">
              Calculate your potential.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 md:p-10">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[#1d1d1f] font-medium">Deals per month</label>
                  <span className="text-[#0071e3] font-semibold">{calculatorDeals}</span>
                </div>
                <input
                  type="range" min="1" max="20" value={calculatorDeals}
                  onChange={(e) => setCalculatorDeals(Number(e.target.value))}
                  className="w-full h-2 bg-[#e5e5e5] rounded-full appearance-none cursor-pointer accent-[#0071e3]"
                />
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[#1d1d1f] font-medium">Average deal size</label>
                  <span className="text-[#0071e3] font-semibold">{formatCurrency(calculatorValue)}</span>
                </div>
                <input
                  type="range" min="10000" max="500000" step="10000" value={calculatorValue}
                  onChange={(e) => setCalculatorValue(Number(e.target.value))}
                  className="w-full h-2 bg-[#e5e5e5] rounded-full appearance-none cursor-pointer accent-[#0071e3]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[#1d1d1f] font-medium">Your tier</label>
                  <span className="text-[#0071e3] font-semibold capitalize">{calculatorTier}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["bronze", "silver", "gold", "platinum"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setCalculatorTier(tier)}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all ${
                        calculatorTier === tier
                          ? "bg-[#0071e3] text-white"
                          : "bg-[#f5f5f5] text-[#6e6e73] hover:bg-[#e5e5e5]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 flex flex-col justify-center">
              <p className="text-[#6e6e73] text-sm mb-4">Estimated monthly earnings</p>
              <div className="text-5xl font-semibold text-[#0071e3] tracking-tight mb-8">
                {formatCurrency(monthlyEarnings)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(tierRates).map(([tier, rate]) => (
                  <div key={tier} className="bg-[#f5f5f5] rounded-xl p-3 text-center">
                    <p className="capitalize text-xs text-[#6e6e73]">{tier}</p>
                    <p className="text-[#1d1d1f] font-semibold">{rate}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section ref={testimonialRef} className="py-24 px-6 bg-[#1d1d1f]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#6e6e73] text-7xl leading-none mb-6">"</p>
          <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed tracking-tight mb-8">
            "I made R47,000 in my first 60 days. The leads were already qualified. I just had to close. Roventis built the rails — I just rode them."
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071e3] to-[#0050a0]" />
            <div className="text-left">
              <p className="text-white font-medium">Thabo M.</p>
              <p className="text-[#6e6e73] text-sm">Platinum Affiliate, Cape Town</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[#faf9f7]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#0071e3] text-sm font-semibold tracking-wide uppercase">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 text-[#1d1d1f]">
              Questions? Answers.
            </h2>
          </div>

          <div className="divide-y divide-black/5">
            {faqItems.map((faq, index) => (
              <motion.div key={index}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full py-6 text-left text-lg font-medium text-[#1d1d1f] flex items-center justify-between"
                >
                  {faq.q}
                  <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-[#6e6e73]" />
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
                      <p className="pb-6 text-[#6e6e73] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="contact" ref={ctaRef} className="py-24 px-6 bg-[#0071e3]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            Ready to start earning?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Apply in 5 minutes. We review applications within 48 hours.
          </p>
          <Link href="/apply" className="inline-block bg-white text-[#0071e3] px-8 py-4 rounded-full text-[15px] font-medium hover:bg-[#f5f5f5] transition-colors">
            Apply now
          </Link>
          <p className="text-sm text-white/60 mt-6">Free forever. No credit card required.</p>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}