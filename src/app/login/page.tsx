"use client";

import Link from "next/link";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import { MeshGradient } from "@paper-design/shaders-react";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — shader + brand */}
      <div className="relative hidden lg:flex lg:w-[52%] overflow-hidden items-center justify-center">
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          colors={["#0071e3", "#1a8cff", "#004aad", "#faf9f7"]}
          speed={0.35}
          distortion={0.7}
          swirl={0.5}
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

          <h2 className="text-[clamp(2rem,3.5vw,2.75rem)] font-semibold tracking-[-0.035em] text-white leading-[1.15]">
            Your next deal is
            <br />
            waiting for you.
          </h2>

          <p className="mt-5 text-[15px] text-white/70 leading-relaxed max-w-sm">
            Access verified buyers, track commissions in real time, and grow your sourcing business with Roventis.
          </p>

          {/* Floating stats */}
          <div className="mt-12 flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4">
              <div className="text-[22px] font-semibold text-white">R23M+</div>
              <div className="text-[12px] text-white/60 mt-0.5">Deals closed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4">
              <div className="text-[22px] font-semibold text-white">200+</div>
              <div className="text-[12px] text-white/60 mt-0.5">Active affiliates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4">
              <div className="text-[22px] font-semibold text-white">12%</div>
              <div className="text-[12px] text-white/60 mt-0.5">Max commission</div>
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute bottom-8 left-16 text-[12px] text-white/40">
          © {new Date().getFullYear()} Roventis Sourcing
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative flex-1 flex flex-col bg-[#faf9f7] min-h-screen lg:min-h-0">
        {/* Mobile shader background */}
        <div className="absolute inset-0 lg:hidden">
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-[0.06]"
            colors={["#0071e3", "#1a8cff", "#004aad", "#faf9f7"]}
            speed={0.25}
            distortion={0.5}
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
            href="/apply"
            className="text-[13px] font-medium text-[#0071e3] hover:text-[#0050a0] transition-colors"
          >
            Create account
          </Link>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 pb-12">
          <div className="w-full max-w-[380px]">
            <div className="mb-8">
              <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                Sign in
              </h1>
              <p className="mt-2 text-[15px] text-[#6e6e73]">
                Welcome back to your dashboard
              </p>
            </div>

            <SignIn
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0 gap-6",
                  header: "hidden",
                  socialButtonsBlockButton:
                    "bg-white border border-black/[0.08] text-[#1d1d1f] hover:bg-[#f5f5f7] hover:border-black/[0.12] rounded-[14px] h-[46px] transition-all font-medium shadow-sm",
                  socialButtonsBlockButtonText: "text-[#1d1d1f] font-medium text-[14px]",
                  dividerLine: "bg-black/[0.06]",
                  dividerText: "text-[#86868b] text-[13px] px-4",
                  formFieldLabel: "text-[#1d1d1f] font-medium text-[13px] mb-1.5",
                  formFieldInput:
                    "bg-white border border-black/[0.08] text-[#1d1d1f] rounded-[14px] h-[46px] px-4 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/10 transition-all placeholder:text-[#86868b] shadow-sm",
                  formButtonPrimary:
                    "bg-[#1d1d1f] hover:bg-[#333] text-white rounded-[14px] h-[46px] font-medium transition-all shadow-sm hover:shadow-md",
                  footerActionLink: "text-[#0071e3] hover:text-[#0050a0] font-medium",
                  footer: "hidden",
                  formFieldInputShowPasswordButton: "text-[#6e6e73] hover:text-[#1d1d1f]",
                  identityPreviewEditButton: "text-[#0071e3]",
                  formResendCodeLink: "text-[#0071e3]",
                  otpCodeFieldInput: "border-black/[0.08] text-[#1d1d1f] rounded-[10px]",
                  formFieldAction: "text-[#0071e3] text-[13px]",
                  alertText: "text-[#1d1d1f] text-[13px]",
                }
              }}
              routing="hash"
            />

            <p className="text-center text-[13px] text-[#86868b] mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/apply" className="text-[#0071e3] hover:text-[#0050a0] font-medium transition-colors">
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
