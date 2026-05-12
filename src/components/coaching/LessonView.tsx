"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
}

export default function LessonView({
  lesson,
  onComplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isCompleted,
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
      className="max-w-4xl mx-auto"
    >
      {/* Lesson Header */}
      <div className="mb-8">
        <span className="rs-overline">{lesson.chapter}</span>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-2">
          {lesson.title}
        </h2>
        <p className="text-lg text-gray-400 mt-2">{lesson.subtitle}</p>
        <div className="flex items-center gap-2 mt-4 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{lesson.duration}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4 mb-8">
        {lesson.cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {card.type === "concept" && (
              <div className="rs-card-[14px] border border-white/5 p-6">
                {card.title && (
                  <span className="rs-overline mb-2 block">{card.title}</span>
                )}
                <p className="text-gray-300 leading-relaxed text-base">{card.body}</p>
              </div>
            )}
            {card.type === "callout" && (
              <div className="rs-card-[14px] bg-violet-500/6 border-l-2 border-violet-500/40 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="w-4 h-4 text-violet-400" />
                  <span className="rs-overline text-violet-400">{card.title}</span>
                </div>
                <p className="text-violet-100 leading-relaxed">{card.body}</p>
              </div>
            )}
            {card.type === "example" && (
              <div className="rs-card-[14px] border border-white/5 p-6">
                <p className="text-gray-300 mb-4">{card.body}</p>
                {card.example && (card.example.weak || card.example.strong) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {card.example.weak && (
                      <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-400 text-xs font-bold">WEAK</span>
                        </div>
                        <p className="text-gray-400 text-sm italic leading-relaxed">
                          {card.example.weak}
                        </p>
                      </div>
                    )}
                    {card.example.strong && (
                      <div className="border border-violet-500/20 rounded-lg p-4 bg-violet-500/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-violet-400 text-xs font-bold">STRONG</span>
                        </div>
                        <p className="text-gray-200 text-sm italic leading-relaxed">
                          {card.example.strong}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {card.example?.context && (
                  <p className="text-sm text-gray-500 italic mt-4">
                    {card.example.context}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Practice Drill Section */}
      <div className="mb-8">
        <div className="border-t border-white/5 py-4 text-center">
          <span className="rs-overline">PRACTICE DRILL</span>
        </div>
        <div className="rs-card-[14px] border border-white/5 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">{lesson.drill.title}</h3>
          </div>
          <p className="text-gray-400 mb-6">{lesson.drill.instructions}</p>

          {/* Checklist */}
          <div className="space-y-3 mb-6">
            {lesson.drill.checklist.map((item, index) => (
              <button
                key={index}
                onClick={() => toggleChecklistItem(index)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                {checkedItems.has(index) ? (
                  <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    checkedItems.has(index)
                      ? "text-gray-400 line-through"
                      : "text-gray-300"
                  }`}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={!allChecked || isCompleted}
            className={`w-full py-3 rounded-[14px] font-medium transition-all ${
              allChecked && !isCompleted
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-violet-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isCompleted ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Completed
              </span>
            ) : showSuccess ? (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Great Work
              </motion.span>
            ) : (
              "Complete Lesson"
            )}
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`flex items-center gap-2 px-4 py-3 rounded-[14px] font-medium transition-all ${
            hasPrevious
              ? "bg-[#141417] text-white border border-white/5 hover:border-white/10"
              : "bg-[#141417] text-gray-600 border border-white/5 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous lesson
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex items-center gap-2 px-4 py-3 rounded-[14px] font-medium transition-all ${
            hasNext
              ? "bg-violet-600 text-white hover:bg-violet-700"
              : "bg-violet-600/50 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next lesson
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}