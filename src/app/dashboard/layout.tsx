"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  TrendingUp, 
  GraduationCap, 
  FileText, 
  DollarSign, 
  User, 
  Bell,
  Target,
  Megaphone,
  HelpCircle,
  Zap,
  Receipt,
  ChevronLeft,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { isAdminEmail, isAdminUserId } from "@/lib/admin";

const navItems = [
  // Dashboard
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, section: "dashboard" },
  // Pipeline
  { href: "/dashboard/deals", label: "Deals", icon: TrendingUp, section: "pipeline" },
  { href: "/dashboard/leads", label: "Leads", icon: Target, section: "pipeline" },
  // Finance
  { href: "/dashboard/commissions", label: "Commissions", icon: DollarSign, section: "finance" },
  { href: "/dashboard/invoice", label: "Invoice Generator", icon: Receipt, section: "finance" },
  // Growth
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone, section: "growth" },
  { href: "/dashboard/resources", label: "Resources", icon: FileText, section: "growth" },
  // Settings
  { href: "/dashboard/profile", label: "Profile", icon: User, section: "settings" },
  { href: "/dashboard/training", label: "Training", icon: GraduationCap, section: "settings" },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle, section: "settings" },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const registerAffiliate = useMutation(api.affiliates.registerAffiliate);
  const seedDemoData = useMutation(api.affiliates.seedDemoData);
  const seedAllData = useMutation(api.affiliates.seedAllData);
  
  // Get user email - using useMemo to ensure stability
  // Also log full user object to debug
  const userEmail = useMemo(() => {
    if (!user) {
      console.log("No user object");
      return "";
    }
    console.log("User object:", JSON.stringify(user));
    
    // Try different ways Clerk provides email
    const email = user.emailAddresses?.[0]?.emailAddress || 
           (user as any).primaryEmailAddress?.emailAddress ||
           "";
    console.log("Extracted email:", email);
    return email;
  }, [user]);

  // Check admin - use userId which is more reliable
  const isAdmin = useMemo(() => {
    if (!userId) return false;
    // Check both email and user ID for admin
    const emailAdmin = userEmail ? isAdminEmail(userEmail) : false;
    const idAdmin = isAdminUserId(userId);
    console.log("Admin check:", { userId, userEmail, emailAdmin, idAdmin });
    return emailAdmin || idAdmin;
  }, [userId, userEmail]);

  // Always pass a consistent argument to keep hooks stable
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );

  // Debug
  useEffect(() => {
    console.log("Dashboard:", { isLoaded, userId, userEmail, isAdmin, hasAffiliate: !!currentAffiliate });
  }, [isLoaded, userId, userEmail, isAdmin, currentAffiliate]);

  // Redirect admins to admin dashboard - only when fully loaded and confirmed admin
  useEffect(() => {
    if (isLoaded && userId && isAdmin) {
      console.log("Redirecting admin to admin dashboard");
      router.push("/admin");
    }
  }, [isLoaded, userId, isAdmin, router]);

  // Skip seeding for admin users
  useEffect(() => {
    if (isAdmin || !userEmail || !userId) return;
    
    if (isLoaded && currentAffiliate === null) {
      seedDemoData({ 
        clerkUserId: userId,
        firstName: user?.firstName || "Demo",
        lastName: user?.lastName || "User", 
        email: userEmail
      }).then(() => {
        seedAllData();
      });
    }
  }, [isLoaded, userId, currentAffiliate, user, isAdmin, userEmail]);

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
        animate={{ width: collapsed ? 80 : 230 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed top-0 left-0 z-50 h-full bg-[#0a0a0b] border-r border-white/5 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with logo - click to toggle collapse */}
          <div className="p-4 flex items-center justify-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 hover:bg-white/5 rounded-xl p-2 transition-colors"
            >
              <div className={`relative h-12 ${collapsed ? 'w-12' : 'w-[160px]'} flex-shrink-0 transition-all`}>
                <Image
                  src="/roventis-logo.png"
                  alt="Roventis"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pb-3 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const tierRequired = item.tier;
              const tierMet = !tierRequired || (currentAffiliate && (
                tierRequired === "platinum" ? currentAffiliate.tier === "platinum" :
                tierRequired === "gold" ? ["gold", "platinum"].includes(currentAffiliate.tier) :
                tierRequired === "silver" ? ["silver", "gold", "platinum"].includes(currentAffiliate.tier) :
                true
              ));

              if (!tierMet) return null;

              // Show section title when section changes
              const showSectionTitle = item.section && navItems.slice(0, index).every(i => i.section !== item.section);
              const sectionLabel = item.section === "dashboard" ? "Dashboard" : item.section === "pipeline" ? "Pipeline" : item.section === "finance" ? "Finance" : item.section === "growth" ? "Growth" : item.section === "settings" ? "Settings" : null;

              return (
                <Fragment key={item.href}>
                  {showSectionTitle && sectionLabel && !collapsed && (
                    <div className="pt-4 pb-2 px-3">
                      <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.12em]">
                        {sectionLabel}
                      </span>
                    </div>
                  )}
                <Link
                  href={item.href}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all relative ${
                    collapsed ? "justify-center px-1" : ""
                  } ${
                    isActive ? "text-white bg-white/[0.04]" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                    />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                  }`} />
                  <span className={`transition-all duration-200 ${collapsed ? 'w-0 opacity-0 hidden' : 'opacity-100'}`}>
                    {item.label}
                  </span>
                  {item.tier && !collapsed && (
                    <span className="ml-auto px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                      <Zap className="w-3 h-3 inline" />
                    </span>
                  )}
                </Link>
                </Fragment>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-3 ${collapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <>
                  <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                  </button>
                  <UserButton afterSignOutUrl="/" />
                </>
              )}
              {collapsed && (
                <div className="w-8 h-8">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 100 : 230 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 min-w-0"
      >
        <main className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#141417",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#f5f5f7",
                borderRadius: "12px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
              },
            }}
          />
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
