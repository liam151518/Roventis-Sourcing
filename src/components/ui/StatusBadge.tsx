"use client";

import { cn } from "@/lib/utils";

type Tone = "pending" | "approved" | "paid" | "rejected" | "neutral" | "active" | "won" | "lost";

const toneClasses: Record<Tone, string> = {
  pending: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  approved: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  paid: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  won: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  active: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  rejected: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  lost: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  neutral: "bg-white/5 text-gray-300 ring-white/10",
};

const toneDotClasses: Record<Tone, string> = {
  pending: "bg-amber-400",
  approved: "bg-blue-400",
  paid: "bg-emerald-400",
  won: "bg-emerald-400",
  active: "bg-blue-400",
  rejected: "bg-rose-400",
  lost: "bg-rose-400",
  neutral: "bg-gray-400",
};

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ring-1 ring-inset",
        toneClasses[tone],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", toneDotClasses[tone])} />
      {children}
    </span>
  );
}