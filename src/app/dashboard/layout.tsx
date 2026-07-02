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
  Sparkles,
  HelpCircle,
  Zap,
  Receipt,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { isAdmin } from "@/lib/admin";

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
  { href: "/dashboard/marketing", label: "Advisor", icon: Sparkles, section: "growth" },
  { href: "/dashboard/resources", label: "Resources", icon: FileText, section: "growth" },
  // Settings
  { href: "/dashboard/profile", label: "Profile", icon: User, section: "settings" },
  { href: "/dashboard/training", label: "Training", icon: GraduationCap, section: "settings" },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle, section: "settings" },
];

const sectionLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pipeline: "Pipeline",
  finance: "Finance",
  growth: "Growth",
  settings: "Settings",
};

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const registerAffiliate = useMutation(api.affiliates.registerAffiliate);

  // Get user email - using useMemo to ensure stability
  const userEmail = useMemo(() => {
    if (!user) return "";
    return (
      user.emailAddresses?.[0]?.emailAddress ||
      (user as any).primaryEmailAddress?.emailAddress ||
      ""
    );
  }, [user]);

  const isAdminUser = useMemo(() => {
    if (!userId) return false;
    return isAdmin(user, userEmail);
  }, [userId, user, userEmail]);

  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );

  // Redirect admins to admin dashboard - only when fully loaded and confirmed admin
  useEffect(() => {
    if (isLoaded && userId && isAdminUser) {
      router.push("/admin");
    }
  }, [isLoaded, userId, isAdminUser, router]);

  // First-login provisioning: if a signed-in user has no affiliate row yet,
  // create a clean pending record. No demo data, no takeover of existing rows.
  useEffect(() => {
    if (isAdminUser || !userEmail || !userId) return;
    if (!isLoaded) return;
    if (currentAffiliate === undefined) return;
    if (currentAffiliate !== null) return;

    registerAffiliate({
      clerkUserId: userId,
      firstName: user?.firstName || user?.username || "New",
      lastName: user?.lastName || "Affiliate",
      email: userEmail,
    }).catch((err) => {
      console.error("Failed to provision affiliate on first login:", err);
    });
  }, [isLoaded, userId, currentAffiliate, user, isAdminUser, userEmail, registerAffiliate]);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--rs-bg-base)" }}>
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
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed top-0 left-0 z-50 h-full lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "var(--rs-bg-raised)",
          borderRight: "1px solid var(--rs-border)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header with logo - click to toggle collapse */}
          <div
            className="h-14 flex items-center justify-center border-b"
            style={{ borderColor: "var(--rs-border)" }}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-2 hover:bg-white/5 rounded-lg p-1.5 transition-colors"
            >
              <div
                className={`relative h-9 ${collapsed ? "w-9" : "w-[150px]"} flex-shrink-0 transition-all`}
              >
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
          <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-0.5">
            {navItems.map((item: any, index) => {
              const isActive = pathname === item.href;
              const tierRequired = item.tier;
              const tierMet =
                !tierRequired ||
                (currentAffiliate &&
                  (tierRequired === "platinum"
                    ? currentAffiliate.tier === "platinum"
                    : tierRequired === "gold"
                      ? ["gold", "platinum"].includes(currentAffiliate.tier)
                      : tierRequired === "silver"
                        ? ["silver", "gold", "platinum"].includes(currentAffiliate.tier)
                        : true));

              if (!tierMet) return null;

              const showSectionTitle =
                item.section &&
                navItems.slice(0, index).every((i) => i.section !== item.section);
              const sectionLabel = item.section ? sectionLabels[item.section] : null;

              return (
                <Fragment key={item.href}>
                  {showSectionTitle && sectionLabel && (
                    <div className="pt-3 pb-1.5 px-2.5 first:pt-0">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          collapsed ? "hidden" : ""
                        }`}
                        style={{ color: "var(--rs-text-muted)" }}
                      >
                        {sectionLabel}
                      </span>
                    </div>
                  )}
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`rs-sidebar-item ${
                      isActive ? "rs-sidebar-item--active" : ""
                    } ${collapsed ? "justify-center px-1" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                        style={{ background: "var(--rs-text-accent)" }}
                      />
                    )}
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-violet-400" : ""
                      }`}
                      style={isActive ? undefined : { color: "var(--rs-text-muted)" }}
                    />
                    <span
                      className={`flex-1 transition-all duration-200 ${
                        collapsed ? "w-0 opacity-0 hidden" : "opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.tier && !collapsed && (
                      <Zap className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    )}
                  </Link>
                </Fragment>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-2.5 border-t`} style={{ borderColor: "var(--rs-border)" }}>
            <div
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!collapsed && (
                <>
                  <button
                    className="relative p-1.5 rounded-md transition-colors"
                    style={{ color: "var(--rs-text-secondary)" }}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  </button>
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "w-7 h-7" },
                    }}
                  />
                </>
              )}
              {collapsed && (
                <div className="w-7 h-7">
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "w-7 h-7" },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content - sidebar is the only persistent chrome */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 80 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-1 min-w-0"
      >
        <main className="p-6 lg:p-8 min-h-screen">
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
                borderRadius: "10px",
                boxShadow:
                  "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
                fontSize: "0.8125rem",
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
