"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
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
  KeyRound,
} from "lucide-react";
import { useAuth, useUser, UserButton, SignInButton, useClerk } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin";

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
  { href: "/admin/advisor-codes", label: "Advisor Codes", icon: KeyRound, section: "support" },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const userEmail = useMemo(() => {
    if (!user) return "";
    return user.emailAddresses?.[0]?.emailAddress || 
           (user as any).primaryEmailAddress?.emailAddress ||
           "";
  }, [user]);

  const isAdminUser = useMemo(() => {
    if (!userId) return false;
    return isAdmin(user, userEmail);
  }, [userId, user, userEmail]);

  useEffect(() => {
    if (isLoaded && userId && !isAdminUser) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, isAdminUser, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--rs-accent)" }} />
      </div>
    );
  }

  if (isLoaded && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="text-center rs-card p-8 max-w-md">
          <div className="rs-icon-tile rs-icon-tile--accent mx-auto mb-4 w-12 h-12">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">Admin Access Required</h1>
          <p className="text-sm mb-6" style={{ color: "var(--rs-text-secondary)" }}>
            Please sign in to access the admin dashboard.
          </p>
          <SignInButton mode="modal">
            <button className="rs-btn-primary w-full justify-center">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (isLoaded && userId && !isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--rs-bg-base)" }}>
        <div className="text-center rs-card p-8 max-w-md">
          <div className="rs-icon-tile rs-icon-tile--danger mx-auto mb-4 w-12 h-12">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-white mb-2">Access Denied</h1>
          <p className="text-sm mb-6" style={{ color: "var(--rs-text-secondary)" }}>
            You do not have permission to access this page.
          </p>
          <Link href="/dashboard" className="rs-btn-primary w-full justify-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--rs-bg-base)" }}>
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
        className={`fixed top-0 left-0 z-50 h-full lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: 'var(--rs-bg-raised)', borderRight: '1px solid var(--rs-border)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header with logo - click to toggle collapse */}
          <div className="p-4 flex items-center justify-center border-b" style={{ borderColor: 'var(--rs-border)' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-white/5"
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
                  {showSectionTitle && sectionLabel && (
                    <div className={`pt-4 pb-2 px-3 ${collapsed ? "invisible" : ""}`}>
                      <span className="rs-overline text-[10px]">{sectionLabel}</span>
                    </div>
                  )}
                  <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`rs-sidebar-item group flex items-center gap-2 font-medium transition-all relative ${
                    collapsed ? "justify-center px-1" : ""
                  } ${
                    isActive ? "is-active" : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="adminActiveNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                      style={{ background: "var(--rs-accent)", boxShadow: "0 0 12px rgba(124,58,237,0.55)" }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? "" : ""
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
                  <button className="rs-btn-ghost p-2 relative" aria-label="Notifications">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "var(--rs-accent)" }} />
                  </button>
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="rs-btn-ghost flex items-center gap-2 text-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              )}
              {collapsed && (
                <div className="w-8 h-8">
                  <UserButton />
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
        <main className="p-6 lg:p-8" style={{ background: 'var(--rs-bg-base)', minHeight: '100vh' }}>
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
                background: "var(--rs-bg-raised)",
                border: "1px solid var(--rs-border)",
                color: "var(--rs-text-primary)",
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
