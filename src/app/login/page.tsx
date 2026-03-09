import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
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
            <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your affiliate dashboard</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🔐</span>
              </div>
              <p className="text-gray-400 mb-6">
                Demo mode - No authentication required
              </p>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Go to Admin Panel
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account? <Link href="/apply" className="text-blue-400 hover:underline">Apply now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
