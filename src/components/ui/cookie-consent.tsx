"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

const CONSENT_KEY = "roventis-cookie-consent";

type ConsentState = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  accepted: boolean;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    essential: true,
    functional: true,
    analytics: false,
    accepted: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    const consent = { essential: true, functional: true, analytics: true, accepted: true };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const acceptSelected = () => {
    const consent = { ...preferences, accepted: true };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const declineOptional = () => {
    const consent = { essential: true, functional: false, analytics: false, accepted: true };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 sm:p-6 pointer-events-none"
        >
          <div className="max-w-lg mx-auto sm:mx-0 sm:ml-6 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
              {/* Main content */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Cookie className="w-4.5 h-4.5 text-[#0071e3]" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Cookie preferences</h3>
                      <p className="mt-1 text-[13px] text-[#6e6e73] leading-relaxed">
                        We use cookies to keep you signed in and improve your experience.{" "}
                        <Link href="/cookies" className="text-[#0071e3] hover:underline">
                          Learn more
                        </Link>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={declineOptional}
                    className="text-[#86868b] hover:text-[#1d1d1f] transition-colors shrink-0"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Expandable details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3 pt-4 border-t border-black/5">
                        <CookieToggle
                          label="Essential"
                          description="Authentication and core functionality"
                          checked={true}
                          disabled
                        />
                        <CookieToggle
                          label="Functional"
                          description="Preferences and enhanced features"
                          checked={preferences.functional}
                          onChange={(v) => setPreferences((p) => ({ ...p, functional: v }))}
                        />
                        <CookieToggle
                          label="Analytics"
                          description="Anonymous usage data to improve the platform"
                          checked={preferences.analytics}
                          onChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={acceptAll}
                    className="flex-1 bg-[#1d1d1f] text-white text-[13px] font-medium py-2.5 px-4 rounded-xl hover:bg-[#333] transition-colors"
                  >
                    Accept all
                  </button>
                  {showDetails ? (
                    <button
                      onClick={acceptSelected}
                      className="flex-1 bg-transparent border border-black/[0.08] text-[#1d1d1f] text-[13px] font-medium py-2.5 px-4 rounded-xl hover:bg-black/[0.03] transition-colors"
                    >
                      Save preferences
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="flex-1 bg-transparent border border-black/[0.08] text-[#1d1d1f] text-[13px] font-medium py-2.5 px-4 rounded-xl hover:bg-black/[0.03] transition-colors"
                    >
                      Customise
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CookieToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] font-medium text-[#1d1d1f]">
          {label}
          {disabled && (
            <span className="ml-2 text-[11px] text-[#86868b] font-normal">Always on</span>
          )}
        </p>
        <p className="text-[12px] text-[#6e6e73]">{description}</p>
      </div>
      <button
        onClick={() => onChange?.(!checked)}
        disabled={disabled}
        className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${
          checked ? "bg-[#0071e3]" : "bg-black/10"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
