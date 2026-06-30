"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  CheckCircle,
  Play,
  Clock,
  ChevronRight,
  BookOpen,
  Award,
  Video,
  FileText,
  Brain,
  X,
  ArrowRight,
  Lock,
  Sparkles,
  LifeBuoy,
  Circle,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import CoachingCourse from "@/components/coaching/CoachingCourse";

type ModuleStatus = "completed" | "in-progress" | "not-started" | "locked";

const getModuleIcon = (content: string) => {
  if (content?.includes("video") || content?.includes("Watch")) return Video;
  if (content?.includes("quiz") || content?.includes("Test")) return Award;
  return BookOpen;
};

const formatTime = (mins: number): string => {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export default function TrainingPage() {
  const { userId } = useAuth();
  const trainingModules = useQuery(api.training.getTrainingModules);
  const currentAffiliate = useQuery(
    api.affiliates.getCurrentAffiliate,
    { clerkUserId: userId || undefined }
  );
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showCoaching, setShowCoaching] = useState(false);

  // ---- LOADING STATE ----
  if (trainingModules === undefined || currentAffiliate === undefined || currentAffiliate === null) {
    return (
      <div className="space-y-6">
        <div className="rs-skeleton h-8 w-48" />
        <div className="rs-skeleton h-4 w-96" />
        <div className="rs-skeleton h-32 w-full" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rs-skeleton h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ---- DERIVED STATE ----
  const requiredModules = trainingModules.filter((m: any) => m.isRequired);
  const optionalModules = trainingModules.filter((m: any) => !m.isRequired);

  const isCoachingDone = typeof currentAffiliate.coachingCourseCompletedAt === "number";
  const coachingProgress = (currentAffiliate.coachingCompletedLessonIds ?? []) as string[];
  // We don't know the total lesson count from the affiliate row alone, but
  // the coaching content module exports it. Fetching that constant here via
  // dynamic import would create a cycle, so we just show a relative label.
  const coachingProgressLabel = isCoachingDone
    ? "Course complete"
    : coachingProgress.length > 0
      ? "In progress"
      : "Not started";

  // Today trainingCompleted is a single boolean across all modules.
  // Per-module completion would be a schema change; for now we
  // derive a sensible per-module status from that global flag.
  const isAnyTrainingDone = currentAffiliate.trainingCompleted;
  const completedModuleIds = new Set<string>(
    isAnyTrainingDone ? trainingModules.map((m: any) => m._id) : []
  );

  const completedRequired = requiredModules.filter((m: any) => completedModuleIds.has(m._id)).length;
  const completedOptional = optionalModules.filter((m: any) => completedModuleIds.has(m._id)).length;

  const totalItems = 1 + trainingModules.length;
  const completedItems = (isCoachingDone ? 1 : 0) + (isAnyTrainingDone ? trainingModules.length : 0);
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const totalTimeMinutes = trainingModules.reduce((sum: number, m: any) => sum + (m.estimatedMinutes ?? 0), 0);
  const completedTimeMinutes = isAnyTrainingDone ? totalTimeMinutes : 0;

  // Stepper state for the "Approved to claim leads" journey
  type Step = { key: string; label: string };
  const STEPS: Step[] = [
    { key: "coaching", label: "Physical Test Program" },
    { key: "modules", label: "Core Modules" },
    { key: "approved", label: "Approved to Sell" },
  ];
  const currentStepIndex = isCoachingDone
    ? isAnyTrainingDone
      ? 2
      : 1
    : 0;

  // ---- HANDLERS ----
  const getModuleStatus = (module: any): ModuleStatus => {
    if (completedModuleIds.has(module._id)) return "completed";
    if (!module.isRequired && isAnyTrainingDone) return "not-started";
    if (module.isRequired && !isCoachingDone) return "locked";
    return "not-started";
  };

  // ---- RENDER ----
  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="rs-overline">Training Center</span>
          <span className="rs-status-pill rs-status-pill--neutral">
            {progress}% complete
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Become approved to claim leads
        </h1>
        <p className="text-[var(--rs-text-secondary)] max-w-2xl text-[15px] leading-relaxed">
          Complete the program below to unlock the lead pool. The Physical Test
          Program is required first, then any outstanding core training modules.
        </p>
      </motion.div>

      {/* ===== JOURNEY STEPPER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rs-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[var(--rs-text-secondary)] uppercase tracking-wider font-medium">
            Your journey
          </span>
          <span className="text-xs text-[var(--rs-text-secondary)]">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
        </div>
        <div className="rs-stepper">
          {STEPS.map((step, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                <div
                  className={`rs-stepper-dot ${
                    done ? "rs-stepper-dot--done" : active ? "rs-stepper-dot--active" : ""
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <div className="ml-2 mr-3 hidden md:block">
                  <div className={`text-sm font-medium ${active ? "text-white" : "text-[var(--rs-text-secondary)]"}`}>
                    {step.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`rs-stepper-line ${done ? "rs-stepper-line--done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="md:hidden mt-3 text-sm font-medium text-white">
          {STEPS[currentStepIndex].label}
        </div>
      </motion.div>

      {/* ===== STAT ROW ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <div className="rs-stat-tile">
          <span className="text-xs text-[var(--rs-text-secondary)] uppercase tracking-wider font-medium">
            Required done
          </span>
          <span className="text-2xl font-semibold text-white">
            {completedRequired + (isCoachingDone ? 1 : 0)}
            <span className="text-[var(--rs-text-secondary)] text-base font-normal">
              {" "}/ {requiredModules.length + 1}
            </span>
          </span>
          <span className="text-xs text-[var(--rs-text-secondary)]">
            Coaching + required modules
          </span>
        </div>
        <div className="rs-stat-tile">
          <span className="text-xs text-[var(--rs-text-secondary)] uppercase tracking-wider font-medium">
            Optional done
          </span>
          <span className="text-2xl font-semibold text-white">
            {completedOptional}
            <span className="text-[var(--rs-text-secondary)] text-base font-normal">
              {" "}/ {optionalModules.length}
            </span>
          </span>
          <span className="text-xs text-[var(--rs-text-secondary)]">
            Extra credit modules
          </span>
        </div>
        <div className="rs-stat-tile">
          <span className="text-xs text-[var(--rs-text-secondary)] uppercase tracking-wider font-medium">
            Time invested
          </span>
          <span className="text-2xl font-semibold text-white">
            {formatTime(completedTimeMinutes)}
            <span className="text-[var(--rs-text-secondary)] text-base font-normal">
              {" "}/ {formatTime(totalTimeMinutes)}
            </span>
          </span>
          <span className="text-xs text-[var(--rs-text-secondary)]">
            Across all completed modules
          </span>
        </div>
      </motion.div>

      {/* ===== PHYSICAL TEST PROGRAM (hero card) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        onClick={() => setShowCoaching(true)}
        className="rs-gradient-border rs-violet-glow cursor-pointer transition-transform hover:scale-[1.005] hover:-translate-y-0.5"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  isCoachingDone
                    ? "bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)]"
                    : "bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.25)]"
                }`}
              >
                {isCoachingDone ? (
                  <Trophy className="w-7 h-7 text-[var(--rs-success)]" />
                ) : (
                  <Brain className="w-7 h-7 text-[var(--rs-text-accent)]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--rs-text-accent)]">
                    Physical Test Program
                  </span>
                  <span className="rs-status-pill rs-status-pill--danger" style={{ padding: "0.125rem 0.5rem", fontSize: "0.625rem" }}>
                    Required
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                  The Roventis Behavioral Sales Manual
                </h2>
                <p className="text-[var(--rs-text-secondary)] mt-1.5 text-[15px] max-w-2xl">
                  A behaviorally engineered framework for high-ticket sourcing.
                  Master the psychology behind every closed deal.
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2">
              <span
                className={`rs-status-pill ${
                  isCoachingDone
                    ? "rs-status-pill--success"
                    : coachingProgress.length > 0
                      ? "rs-status-pill--progress"
                      : "rs-status-pill--neutral"
                }`}
              >
                {coachingProgressLabel}
              </span>
            </div>
          </div>

          {/* Inline progress strip */}
          {!isCoachingDone && coachingProgress.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs text-[var(--rs-text-secondary)] mb-1.5">
                <span>Lessons complete</span>
                <span>{coachingProgress.length}+</span>
              </div>
              <div className="h-1.5 bg-[var(--rs-bg-base)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (coachingProgress.length / 7) * 100)}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-[var(--rs-accent)] to-[var(--rs-text-accent)] rounded-full"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-sm text-[var(--rs-text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                60+ min
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Behavioral frameworks
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                7 chapters
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isCoachingDone
                  ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  : "bg-[var(--rs-accent)] text-white hover:bg-[var(--rs-accent-light)]"
              }`}
            >
              {isCoachingDone ? (
                <>
                  Review program
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : coachingProgress.length > 0 ? (
                <>
                  Continue program
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Start program
                  <Play className="w-4 h-4" />
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== CORE TRAINING MODULES SECTION ===== */}
      {trainingModules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="rs-overline">Core Modules</span>
              <h2 className="text-xl font-semibold text-white mt-1">
                Product & process training
              </h2>
            </div>
            {requiredModules.length > 0 && !isCoachingDone && (
              <div className="flex items-center gap-2 text-xs text-[var(--rs-warning)]">
                <Lock className="w-3.5 h-3.5" />
                Complete the Physical Test Program first
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingModules.map((module: any, index: number) => {
              const Icon = getModuleIcon(module.content);
              const status = getModuleStatus(module);
              const isLocked = status === "locked";
              const isCompleted = status === "completed";
              const isInProgress = status === "in-progress";

              return (
                <motion.button
                  key={module._id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                  onClick={() => !isLocked && setSelectedModule(module)}
                  disabled={isLocked}
                  className={`group relative rs-card p-5 text-left transition-all ${
                    isLocked
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
                  } ${isCompleted ? "ring-1 ring-[rgba(16,185,129,0.20)]" : ""}`}
                >
                  {/* Status bar on the left */}
                  <div
                    className={`absolute top-4 right-4 ${
                      isCompleted
                        ? "rs-status-pill rs-status-pill--success"
                        : isInProgress
                          ? "rs-status-pill rs-status-pill--progress"
                          : isLocked
                            ? "rs-status-pill rs-status-pill--warning"
                            : "rs-status-pill rs-status-pill--neutral"
                    }`}
                    style={{ padding: "0.125rem 0.5rem", fontSize: "0.625rem" }}
                  >
                    {isCompleted
                      ? "Completed"
                      : isInProgress
                        ? "In progress"
                        : isLocked
                          ? "Locked"
                          : "Not started"}
                  </div>

                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isCompleted
                        ? "bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.25)]"
                        : "bg-[rgba(124,58,237,0.10)] border border-[rgba(124,58,237,0.25)]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-[var(--rs-success)]" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-[var(--rs-warning)]" />
                    ) : (
                      <Icon className="w-6 h-6 text-[var(--rs-text-accent)]" />
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-[var(--rs-text-accent)] transition-colors pr-16">
                    {module.title}
                  </h3>
                  <p className="text-sm text-[var(--rs-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--rs-border)]">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--rs-text-secondary)]">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(module.estimatedMinutes ?? 0)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--rs-text-accent)]">
                      {isCompleted
                        ? "Review"
                        : isInProgress
                          ? "Resume"
                          : isLocked
                            ? "Locked"
                            : "Start"}
                      {!isLocked && <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {trainingModules.length === 0 && isCoachingDone && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rs-card p-12 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.25)] flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-[var(--rs-success)]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">All caught up</h3>
          <p className="text-[var(--rs-text-secondary)] max-w-md mx-auto">
            You&apos;ve completed the Physical Test Program. There are no
            additional core modules right now — you can claim leads from the
            Leads page whenever you&apos;re ready.
          </p>
        </motion.div>
      )}

      {/* ===== FOOTER HINT ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rs-card p-4 flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
            <LifeBuoy className="w-4 h-4 text-[var(--rs-text-secondary)]" />
          </div>
          <div>
            <div className="text-sm text-white font-medium">Stuck on a module?</div>
            <div className="text-xs text-[var(--rs-text-secondary)]">
              Reach out and we&apos;ll help you get unstuck.
            </div>
          </div>
        </div>
        <a
          href="mailto:support@roventissourcing.com"
          className="text-sm font-medium text-[var(--rs-text-accent)] hover:text-white transition-colors inline-flex items-center gap-1"
        >
          Contact support
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </motion.div>

      {/* ===== MODULE DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="rs-card border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[var(--rs-border)] flex items-start justify-between gap-4">
                <div>
                  <span className="rs-overline">Training Module</span>
                  <h2 className="text-xl font-semibold text-white mt-1">
                    {selectedModule.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-[var(--rs-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(selectedModule.estimatedMinutes ?? 0)}
                    </span>
                    {selectedModule.isRequired && (
                      <span className="rs-status-pill rs-status-pill--danger" style={{ padding: "0.125rem 0.5rem", fontSize: "0.625rem" }}>
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-2 text-[var(--rs-text-secondary)] hover:text-white rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-medium text-[var(--rs-text-secondary)] uppercase tracking-wider mb-2">
                    About this module
                  </h3>
                  <p className="text-[var(--rs-text-primary)] leading-relaxed">
                    {selectedModule.description}
                  </p>
                </div>

                <div className="bg-[var(--rs-bg-base)] rounded-2xl p-6 flex items-center justify-center">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rs-btn-primary font-medium transition-colors">
                    <Play className="w-5 h-5" />
                    Start Module
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-[var(--rs-bg-base)] rounded-xl p-4">
                    <div className="text-xs text-[var(--rs-text-secondary)] mb-1">
                      Module
                    </div>
                    <div className="text-white font-medium">
                      #{selectedModule.orderIndex + 1}
                    </div>
                  </div>
                  <div className="bg-[var(--rs-bg-base)] rounded-xl p-4">
                    <div className="text-xs text-[var(--rs-text-secondary)] mb-1">
                      Type
                    </div>
                    <div className="text-white font-medium">Video & Quiz</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== COACHING COURSE MODAL ===== */}
      <AnimatePresence>
        {showCoaching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
            onClick={() => setShowCoaching(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowCoaching(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rs-card hover:bg-[var(--rs-bg-overlay)] transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
              <CoachingCourse />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
