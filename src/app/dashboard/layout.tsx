"use client";

import { useState, useEffect } from "react";
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
  Bell,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/deals", label: "Deals", icon: TrendingUp },
  { href: "/dashboard/training", label: "Training", icon: GraduationCap },
  { href: "/dashboard/resources", label: "Resources", icon: FileText },
  { href: "/dashboard/commissions", label: "Commissions", icon: DollarSign },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const registerAffiliate = useMutation(api.affiliates.registerAffiliate);
  const seedDemoData = useMutation(api.affiliates.seedDemoData);
  const seedAllData = useMutation(api.affiliates.seedAllData);
  
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    userId ? { clerkUserId: userId } : {}
  );

  useEffect(() => {
    console.log("useEffect:", { isLoaded, userId, currentAffiliate });
    if (isLoaded && userId && currentAffiliate === null) {
      console.log("Calling seedDemoData for:", userId);
      seedDemoData({ 
        clerkUserId: userId,
        firstName: user?.firstName || "Demo",
        lastName: user?.lastName || "User", 
        email: user?.primaryEmailAddress?.emailAddress || "demo@roventis.co.za"
      }).then((result) => {
        console.log("seedDemoData result:", result);
        seedAllData();
      });
    }
  }, [isLoaded, userId, currentAffiliate, user]);

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
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 100 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed top-0 left-0 z-50 h-full bg-[#0a0a0b] border-r border-white/5 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/5">
            {/* Logo - Click to toggle collapse */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center hover:bg-white/5 rounded-xl p-2 transition-colors"
            >
              <Image
                src="/roventis-logo.png"
                alt="Roventis"
                width={577}
                height={247}
                className="h-8 w-auto"
                unoptimized
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all relative ${
                    isActive
                      ? "text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
                    />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"
                  }`} />
                  <span className={`transition-all duration-200 ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 100 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 min-w-0"
      >
      {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}
