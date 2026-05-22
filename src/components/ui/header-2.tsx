"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Show } from "@clerk/nextjs";

const navLinks = [
  { label: "Benefits", href: "#benefits" },
  { label: "Compare", href: "#compare" },
  { label: "How it works", href: "#how" },
  { label: "Earnings", href: "#earnings" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      const sections = navLinks.map((l) => l.href.replace("#", ""));
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection("");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        <div
          className={`mt-3 mx-3 w-full max-w-[1100px] pointer-events-auto transition-all duration-500 ${
            scrolled
              ? "bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl border border-black/[0.06] rounded-full"
              : "bg-white/40 backdrop-blur-xl border border-white/40 rounded-full"
          }`}
        >
          <div className="flex items-center justify-between h-14 px-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image
                src="/roventis-logo.png"
                alt="Roventis Sourcing"
                width={110}
                height={26}
                className="h-6 w-auto"
                priority
              />
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((item) => {
                const isActive = activeSection === item.href.replace("#", "");
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="relative px-4 py-2 text-[13px] font-medium text-[#1d1d1f]/75 hover:text-[#1d1d1f] transition-colors rounded-full"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 bg-[#1d1d1f]/[0.06] rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Show when="signed-out">
                <Link
                  href="/login"
                  className="text-[13px] font-medium text-[#1d1d1f]/75 hover:text-[#1d1d1f] px-3 py-2 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/apply"
                  className="group inline-flex items-center gap-1.5 bg-[#1d1d1f] text-white text-[13px] font-medium pl-4 pr-3 py-2 rounded-full hover:bg-[#2d2d2f] transition-all"
                >
                  Apply now
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-1.5 bg-[#1d1d1f] text-white text-[13px] font-medium pl-4 pr-3 py-2 rounded-full hover:bg-[#2d2d2f] transition-all"
                >
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Show>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-[#1d1d1f]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-[#faf9f7]/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-20 left-3 right-3 z-50 bg-white rounded-3xl shadow-2xl border border-black/5 p-3 md:hidden"
            >
              <div className="flex flex-col">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#1d1d1f]/[0.04] rounded-2xl transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="h-px bg-black/5 my-2" />
                <Show when="signed-out">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#1d1d1f]/[0.04] rounded-2xl transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 bg-[#1d1d1f] text-white text-[14px] font-medium px-4 py-3 rounded-2xl"
                  >
                    Apply now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 inline-flex items-center justify-center gap-1.5 bg-[#1d1d1f] text-white text-[14px] font-medium px-4 py-3 rounded-2xl"
                  >
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Show>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
