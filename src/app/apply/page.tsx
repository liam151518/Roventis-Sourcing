"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowLeft, Check, Clock, ShieldCheck } from "lucide-react";

const perks = [
  "Access to 500+ verified buyers",
  "Up to 12% commission per deal",
  "5-day average payout turnaround",
  "Full training and deal support",
];

const steps = [
  { num: "01", label: "Book a call" },
  { num: "02", label: "Quick vetting chat" },
  { num: "03", label: "Get your invite" },
];

const CALENDLY_URL = "https://calendly.com/roventis-io/30min";

export default function ApplyPage() {
  // Load Calendly's embed stylesheet + widget script on mount
  useEffect(() => {
    const linkId = "calendly-widget-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }

    const scriptId = "calendly-widget-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — shader + brand */}
      <div className="relative hidden lg:flex lg:w-[52%] overflow-hidden items-center justify-center">
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          colors={["#004aad", "#0071e3", "#3399ff", "#faf9f7"]}
          speed={0.3}
          distortion={0.8}
          swirl={0.4}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />

        {/* Brand content */}
        <div className="relative z-10 px-16 max-w-lg">
          <Image
            src="/roventis-logo.png"
            alt="Roventis Sourcing"
            width={160}
            height={38}
            className="h-9 w-auto mb-12 brightness-0 invert"
          />

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[12px] text-white/90 font-medium mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Invite-only application
          </span>

          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-semibold tracking-[-0.035em] text-white leading-[1.15]">
            Join Roventis
            <br />
            by introduction.
          </h2>

          <p className="mt-5 text-[15px] text-white/70 leading-relaxed max-w-sm">
            We personally meet every new affiliate before granting access. Book a short call so we can learn about your network and goals.
          </p>

          {/* 3-step process */}
          <div className="mt-10 space-y-4">
            {steps.map((step) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-[12px] font-semibold text-white tracking-wide shrink-0">
                  {step.num}
                </div>
                <span className="text-[14px] text-white/90">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Perks list */}
          <div className="mt-12 space-y-3.5">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-[14px] text-white/85">{perk}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30"
                  />
                ))}
              </div>
              <div className="text-[13px] text-white/60">
                <span className="text-white/90 font-medium">200+</span> affiliates already earning
              </div>
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute bottom-8 left-16 text-[12px] text-white/40">
          © {new Date().getFullYear()} Roventis Sourcing
        </div>
      </div>

      {/* Right panel — Calendly embed */}
      <div className="relative flex-1 flex flex-col bg-[#faf9f7] min-h-screen lg:min-h-0">
        {/* Mobile shader background */}
        <div className="absolute inset-0 lg:hidden">
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-[0.06]"
            colors={["#004aad", "#0071e3", "#3399ff", "#faf9f7"]}
            speed={0.2}
            distortion={0.4}
          />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
          <Link href="/" className="lg:hidden">
            <Image
              src="/roventis-logo.png"
              alt="Roventis"
              width={100}
              height={24}
              className="h-6 w-auto"
            />
          </Link>
          <Link
            href="/login"
            className="text-[13px] font-medium text-[#0071e3] hover:text-[#0050a0] transition-colors"
          >
            Sign in instead
          </Link>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex flex-col px-6 sm:px-10 pb-12">
          <div className="w-full max-w-[560px] mx-auto">
            <div className="mb-6">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                Book a vetting call
              </h1>
              <p className="mt-2 text-[15px] text-[#6e6e73]">
                Pick a 20-minute slot below. Once we approve you on the call, we&apos;ll send a sign-up link to your inbox.
              </p>
            </div>

            {/* Trust strip */}
            <div className="flex items-center gap-4 mb-5 text-[13px] text-[#6e6e73]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>~20 minutes</span>
              </div>
              <div className="w-px h-3 bg-black/10" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>No payment required</span>
              </div>
            </div>

            {/* Calendly inline embed */}
            <div
              className="calendly-inline-widget rounded-2xl overflow-hidden border border-black/[0.08] bg-white shadow-sm"
              data-url={CALENDLY_URL}
              style={{ minWidth: "320px", height: "640px" }}
            />

            <p className="text-center text-[13px] text-[#86868b] mt-6">
              Already approved?{" "}
              <Link href="/login" className="text-[#0071e3] hover:text-[#0050a0] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}