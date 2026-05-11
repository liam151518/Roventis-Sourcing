"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Target, Quote, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson } from "./coachingContent";

interface LessonViewProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isCompleted: boolean;
  currentIndex: number;
  totalLessons: number;
}

export default function LessonView({
  lesson,
  onComplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isCompleted,
  currentIndex,
  totalLessons,
}: LessonViewProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setCheckedItems(new Set());
  }, [lesson.id]);

  const allChecked = checkedItems.size === lesson.drill.checklist.length;

  const toggleChecklistItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleComplete = () => {
    if (allChecked) {
      setShowSuccess(true);
      setTimeout(() => {
        onComplete(lesson.id);
        setShowSuccess(false);
      }, 1500);
    }
  };

  return (
    <motion.div
      key={lesson.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-[760px] mx-auto"
    >
      {/* Lesson Header */}
      <div className="mb-10">
        <span className="rs-overline text-[10px] tracking-widest text-violet-400/80">{lesson.chapter}</span>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-2">
          {lesson.title}
        </h2>
        <p className="text-base lg:text-lg text-gray-400 mt-2 leading-relaxed">{lesson.subtitle}</p>
        <div className="flex items-center gap-2 mt-4 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{lesson.duration}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-6 mb-10">
        {lesson.cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3, ease: "easeInOut" }}
          >
            {card.type === "concept" && (
              <div className="bg-[#141417] border border-white/5 rounded-[14px] p-6 hover:border-white/10 transition-all duration-300">
                {card.title && (
                  <span className="rs-overline text-[10px] tracking-widest text-violet-400/70 mb-3 block">{card.title}</span>
                )}
                <p className="text-gray-300 leading-relaxed text-[15px]">{card.body}</p>
              </div>
            )}

            {card.type === "callout" && (
              <div className="bg-violet-500/[0.07] border-l-4 border-violet-500/50 rounded-r-[14px] p-6 relative overflow-hidden">
                <div className="absolute top-3 right-4 opacity-10">
                  <Quote className="w-10 h-10 text-violet-300" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="rs-overline text-[10px] tracking-widest text-violet-400">{card.title}</span>
                </div>
                <p className="text-violet-100 leading-relaxed text-[15px] font-medium">
                  {card.body}
                </p>
              </div>
            )}

            {card.type === "example" && (
              <div className="bg-[#141417] border border-white/5 rounded-[14px] p-6 hover:border-white/10 transition-all duration-300">
                <p className="text-gray-300 mb-6 text-base leading-relaxed">{card.body}</p>
                {card.example && (card.example.weak || card.example.strong) && (
                  <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                    {card.example.weak && (
                      <div className="border border-red-500/25 rounded-[10px] p-4 bg-red-500/[0.06]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-bold">✗</span>
                          <span className="text-red-400 text-xs font-semibold tracking-wide">WEAK</span>
                        </div>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                          {card.example.weak}
                        </p>
                      </div>
                    )}
                    {card.example.strong && (
                      <div className="border border-violet-500/30 rounded-[10px] p-4 bg-violet-500/[0.07]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-[10px] font-bold">✓</span>
                          <span className="text-violet-400 text-xs font-semibold tracking-wide">STRONG</span>
                        </div>
                        <p className="text-gray-200 text-sm italic leading-relaxed font-medium">
                          {card.example.strong}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {card.example?.context && (
                  <p className="text-sm text-gray-500 italic mt-6 pl-4 border-l-2 border-gray-600/30">
                    {card.example.context}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Practice Drill Section */}
      <div className="mb-10">
        <div className="border-t border-white/5 py-6 text-center">
          <span className="rs-overline text-xs tracking-widest text-gray-500">PRACTICE DRILL</span>
        </div>

        <div className="bg-[#141417] border border-white/5 rounded-[14px] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent pointer-events-none rounded-[14px]" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-violet-500/15 flex items-center justify-center">
              <Target className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              {lesson.drill.title}
            </h3>
          </div>

          <p className="text-gray-400 leading-relaxed text-base mt-3">
            {lesson.drill.instructions}
          </p>

          {/* Checklist */}
          <div className="mt-6 space-y-3">
            {lesson.drill.checklist.map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: "easeInOut" }}
                onClick={() => toggleChecklistItem(index)}
                className="w-full flex items-start gap-3 p-3 rounded-[10px] hover:bg-white/[0.04] transition-all duration-200 text-left group"
              >
                {checkedItems.has(index) ? (
                  <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0 transition-all duration-200" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0 group-hover:text-gray-400 transition-all duration-200" />
                )}
                <span
                  className={`text-sm leading-relaxed transition-colors duration-200 ${
                    checkedItems.has(index)
                      ? "text-gray-500 line-through"
                      : "text-gray-300"
                  }`}
                >
                  {item}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Complete Button */}
          <motion.button
            onClick={handleComplete}
            disabled={!allChecked || isCompleted}
            className={`w-full mt-8 py-3 text-base font-semibold rounded-[14px] transition-all relative overflow-hidden ${
              allChecked && !isCompleted
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-violet-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.span
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Great Work!
                </motion.span>
              ) : isCompleted ? (
                <span key="completed" className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Completed
                </span>
              ) : (
                <span key="default">Complete Lesson</span>
              )}
            </AnimatePresence>
            
            {/* Success Glow Animation */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.6, 0], scale: [0.5, 2, 2.5] }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-violet-500 rounded-full blur-2xl"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between gap-4 pt-4 border-t border-white/5">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-200 ${
            hasPrevious
              ? "bg-[#141417] text-gray-300 border border-white/8 hover:border-white/15 hover:text-white"
              : "bg-transparent text-gray-700 border border-white/5 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-center text-sm text-gray-500">
          Lesson {currentIndex + 1} of {totalLessons}
        </div>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-200 ${
            hasNext
              ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
              : "bg-violet-600/30 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}