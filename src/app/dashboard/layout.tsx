"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  TrendingUp, 
  GraduationCap, 
  FileText, 
  DollarSign, 
  User, 
  Menu, 
  X, 
  Bell, 
  LogOut,
  ChevronRight,
} from "lucide-react";
import { DemoDataProvider, Affiliate } from "@/lib/demo-data";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/deals", label: "Deals", icon: TrendingUp },
  { href: "/dashboard/training", label: "Training", icon: GraduationCap },
  { href: "/dashboard/resources", label: "Resources", icon: FileText },
  { href: "/dashboard/commissions", label: "Commissions", icon: DollarSign },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const tierColors: Record<string, string> = {
  bronze: "bg-amber-500",
  silver: "bg-gray-400",
  gold: "bg-yellow-400",
  platinum: "bg-blue-500",
};

// Demo user for display
const demoUser: Affiliate = {
  id: "aff-001",
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@email.com",
  affiliateCode: "ROV-JSMITH-001",
  referralLink: "https://roventis.co.za/?ref=ROV-JSMITH-001",
  tier: "gold",
  status: "approved",
  trainingCompleted: true,
  trainingScore: 92,
  totalSales: 450000,
  totalCommissionEarned: 45000,
  totalCommissionPaid: 35000,
  createdAt: new Date(),
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const currentUser = demoUser;

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#0D0D0F] border-r border-white/10 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link href="/" className="flex items-center">
              <Image
                src="/roventis-logo.png"
                alt="Roventis"
                width={140}
                height={36}
                className="h-9 w-auto object-contain object-left"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.firstName[0]}{currentUser.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs text-black font-medium capitalize ${tierColors[currentUser.tier]}`}>
                    {currentUser.tier}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <header className="bg-[#0D0D0F] border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
              
              {/* Admin Link */}
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoDataProvider>
      <DashboardContent>{children}</DashboardContent>
    </DemoDataProvider>
  );
}
