import Link from "next/link";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#0071e3]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#0071e3]/[0.03] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Image
              src="/roventis-logo.png"
              alt="Roventis"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[420px]">
          {/* Title area */}
          <div className="text-center mb-8">
            <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-[#6e6e73]">
              Sign in to your affiliate dashboard
            </p>
          </div>

          {/* Glass card */}
          <div className="bg-white/60 backdrop-blur-2xl border border-black/[0.06] rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.04)]">
            <SignIn
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-white border border-black/[0.08] text-[#1d1d1f] hover:bg-[#f5f5f7] hover:border-black/[0.12] rounded-xl transition-all font-medium",
                  socialButtonsBlockButtonText: "text-[#1d1d1f] font-medium text-[14px]",
                  dividerLine: "bg-black/[0.06]",
                  dividerText: "text-[#86868b] text-[13px]",
                  formFieldLabel: "text-[#1d1d1f] font-medium text-[13px]",
                  formFieldInput:
                    "bg-[#faf9f7] border border-black/[0.08] text-[#1d1d1f] rounded-xl focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/20 transition-all placeholder:text-[#86868b]",
                  formButtonPrimary:
                    "bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white rounded-xl font-medium transition-all shadow-sm",
                  footerActionLink: "text-[#0071e3] hover:text-[#0050a0] font-medium",
                  footer: "hidden",
                  formFieldInputShowPasswordButton: "text-[#6e6e73] hover:text-[#1d1d1f]",
                  identityPreviewEditButton: "text-[#0071e3]",
                  formResendCodeLink: "text-[#0071e3]",
                  otpCodeFieldInput: "border-black/[0.08] text-[#1d1d1f]",
                }
              }}
              routing="hash"
            />
          </div>

          {/* Footer link */}
          <p className="text-center text-[13px] text-[#86868b] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/apply" className="text-[#0071e3] hover:text-[#0050a0] font-medium transition-colors">
              Apply now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
