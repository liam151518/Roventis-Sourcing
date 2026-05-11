"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Circle, HelpCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { courseTitle, courseSubtitle, courseAttribution, lessons, type Lesson } from "./coachingContent";
import LessonView from "./LessonView";

const STORAGE_KEY = "roventis_coaching_progress";

interface ProgressData {
  completedLessonIds: string[];
}

export default function CoachingCourse() {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>(lessons[0]?.id || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ProgressData = JSON.parse(stored);
        setCompletedLessonIds(data.completedLessonIds || []);
        
        // Find first incomplete lesson or start with first
        const firstIncomplete = lessons.find(
          (l) => !data.completedLessonIds?.includes(l.id)
        );
        if (firstIncomplete) {
          setCurrentLessonId(firstIncomplete.id);
        } else if (lessons.length > 0) {
          setCurrentLessonId(lessons[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
    setIsLoaded(true);
  }, []);

  // Close tooltip on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    if (showTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  // Save progress to localStorage
  const saveProgress = useCallback((completed: string[]) => {
    try {
      const data: ProgressData = { completedLessonIds: completed };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, []);

  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = lessons[currentIndex] || lessons[0];

  const handleComplete = (lessonId: string) => {
    if (!completedLessonIds.includes(lessonId)) {
      const newCompleted = [...completedLessonIds, lessonId];
      setCompletedLessonIds(newCompleted);
      saveProgress(newCompleted);
    }

    // Auto-advance to next lesson
    const nextIndex = currentIndex + 1;
    if (nextIndex < lessons.length) {
      setCurrentLessonId(lessons[nextIndex].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(lessons[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentLessonId(lessons[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && currentIndex > 0) {
        setCurrentLessonId(lessons[currentIndex - 1].id);
      } else if (e.key === "ArrowDown" && currentIndex < lessons.length - 1) {
        setCurrentLessonId(lessons[currentIndex + 1].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  if (!isLoaded) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const completedCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const progress = (completedCount / lessons.length) * 100;
  const isLastLesson = currentIndex === lessons.length - 1;
  const lastLessonCompleted = completedLessonIds.includes(currentLesson?.id);

  return (
    <div className="min-h-screen">
      {/* Hero Header - Sticky */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-gradient-to-b from-[#0a0a0b] to-[#141417] border-b border-white/5"
      >
        <div className="max-w-[900px] mx-auto py-8 px-6 lg:px-12">
          <span className="rs-overline text-xs tracking-widest">BEHAVIORAL SALES COURSE</span>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mt-2">
            {courseTitle}
          </h1>
          <p className="text-base lg:text-lg text-gray-400 mt-3 leading-relaxed max-w-[700px]">
            {courseSubtitle}
          </p>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {completedCount} of {lessons.length} lessons completed
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
              />
            </div>
          </div>

          {/* Attribution Link */}
          <div className="mt-6 flex items-center gap-2 relative" ref={tooltipRef}>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              <span>About this course</span>
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-6 left-0 mt-2 p-4 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl max-w-[300px] z-50"
                >
                  <p className="text-sm text-gray-300">{courseAttribution.text}</p>
                  <a
                    href={courseAttribution.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-violet-400 hover:text-violet-300 mt-2 inline-block"
                  >
                    {courseAttribution.linkText}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Lesson Selector - Horizontal Scroll */}
      <div className="bg-[#141417]/50 backdrop-blur-sm border-b border-white/5 sticky top-[calc(100%+1px)] z-30">
        <div className="max-w-[900px] mx-auto py-4 px-6 lg:px-12">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isActive = currentLessonId === lesson.id;

              return (
                <motion.button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`flex-shrink-0 snap-center flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-inOut ${
                    isActive
                      ? "bg-violet-500/15 border border-violet-500/40 text-violet-100 shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                      : "border border-white/10 text-gray-400 bg-transparent hover:border-white/20 hover:text-gray-300"
                  }`}
                >
                  <span className="rs-overline text-xs">{index + 1}.</span>
                  <span className="text-sm whitespace-nowrap">{lesson.title}</span>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lesson Content Area */}
      <main className="max-w-[900px] mx-auto py-12 px-6 lg:px-12">
        <AnimatePresence mode="wait">
          {currentLesson && (
            <LessonView
              key={currentLesson.id}
              lesson={currentLesson}
              onComplete={handleComplete}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={currentIndex > 0}
              hasNext={currentIndex < lessons.length - 1}
              isCompleted={completedLessonIds.includes(currentLesson.id)}
              currentIndex={currentIndex}
              totalLessons={lessons.length}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer - Sticky */}
      <footer className="sticky bottom-0 z-40 bg-[#0a0a0b]/80 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-[900px] mx-auto py-4 px-6 lg:px-12">
          <div className="flex justify-between items-center">
            {/* Previous */}
            <div className="flex-1">
              {currentIndex > 0 ? (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium bg-[#141417] text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Lesson Counter */}
            <div className="text-center text-sm text-gray-500">
              Lesson {currentIndex + 1} of {lessons.length}
            </div>

            {/* Next */}
            <div className="flex-1 flex justify-end">
              {currentIndex < lessons.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : lastLessonCompleted ? (
                <span className="text-sm text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Course Complete
                </span>
              ) : (
                <span className="text-sm text-gray-500">Final Lesson</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}