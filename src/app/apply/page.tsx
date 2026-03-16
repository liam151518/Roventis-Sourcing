import Link from "next/link";
import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/roventis-logo.png"
              alt="Roventis"
              width={140}
              height={36}
              className="h-9 w-auto object-contain object-left"
            />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2">Apply Now</h1>
            <p className="text-gray-400">Join the Roventis affiliate program</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <SignUp
              fallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                  headerTitle: "text-white",
                  headerSubtitle: "text-gray-400",
                  socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
                  formFieldLabel: "text-gray-300",
                  formFieldInput: "bg-white/10 border-white/20 text-white",
                  formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
                  footerActionLink: "text-blue-400 hover:text-blue-300",
                }
              }}
              routing="hash"
            />
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
