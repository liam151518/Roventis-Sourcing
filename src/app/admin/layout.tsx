"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users,
  FileText,
  Ticket,
  Trophy,
  DollarSign,
  Package,
  ChevronLeft,
  LogOut,
  Bell,
  Target,
  Tag,
  Receipt,
} from "lucide-react";
import { useAuth, useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { isAdminEmail, isAdminUserId } from "@/lib/admin";

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, section: "dashboard" },
  { href: "/admin/users", label: "Users", icon: Users, section: "people" },
  { href: "/admin/leads", label: "Leads", icon: Target, section: "sales" },
  { href: "/admin/orders", label: "Orders", icon: Package, section: "sales" },
  { href: "/admin/payouts", label: "Payouts", icon: DollarSign, section: "finance" },
  { href: "/admin/pricing", label: "Pricing", icon: Tag, section: "finance" },
  { href: "/admin/invoices", label: "Invoice Settings", icon: Receipt, section: "finance" },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy, section: "performance" },
  { href: "/admin/tickets", label: "Support Tickets", icon: Ticket, section: "support" },
  { href: "/admin/resources", label: "Resources", icon: FileText, section: "support" },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userId, isLoaded, user } = useAuth();
  
  const userEmail = useMemo(() => {
    if (!user) return "";
    return user.emailAddresses?.[0]?.emailAddress || 
           (user as any).primaryEmailAddress?.emailAddress ||
           "";
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!userId) return false;
    const emailAdmin = userEmail ? isAdminEmail(userEmail) : false;
    const idAdmin = isAdminUserId(userId);
    return emailAdmin || idAdmin;
  }, [userId, userEmail]);

  useEffect(() => {
    if (isLoaded && userId && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, isAdmin, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isLoaded && !userId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">Please sign in to access the admin dashboard</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (isLoaded && userId && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You do not have permission to access this page</p>
          <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
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

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {adminNavItems.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));

              // Show section title when section changes
              const showSectionTitle = item.section && (index === 0 || adminNavItems[index - 1].section !== item.section);
              const sectionLabel = item.section === "dashboard" ? "Dashboard" : item.section === "people" ? "People" : item.section === "sales" ? "Sales" : item.section === "finance" ? "Finance" : item.section === "performance" ? "Performance" : item.section === "support" ? "Support" : null;

              return (
                <Fragment key={item.href}>
                  {showSectionTitle && sectionLabel && !collapsed && (
                    <div className="pt-4 pb-2 px-3">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        {sectionLabel}
                      </span>
                    </div>
                  )}
                  <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all relative ${
                    collapsed ? "justify-center px-1" : ""
                  } ${
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
                </Fragment>
              );
            })}
          </nav>

          <div className={`p-3 ${collapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <>
                  <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Exit Admin</span>
                  </Link>
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

      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 100 : 230 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 min-w-0"
      >
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
