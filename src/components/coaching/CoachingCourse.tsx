"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Circle } from "lucide-react";
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

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card-[14px] border border-white/5 p-8"
      >
        <span className="rs-overline">BEHAVIORAL SALES COURSE</span>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mt-2">
          {courseTitle}
        </h1>
        <p className="text-gray-400 mt-2">{courseSubtitle}</p>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">
              {completedCount} / {lessons.length} completed
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-violet-500 rounded-full"
            />
          </div>
        </div>

        {/* Attribution */}
        <p className="text-xs text-gray-500 mt-6">{courseAttribution}</p>
      </motion.div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lesson Sidebar - Mobile: Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  currentLessonId === lesson.id
                    ? "bg-violet-500/20 text-white border border-violet-500"
                    : "bg-[#141417] text-gray-400 border border-white/5"
                }`}
              >
                {lesson.chapter}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson Sidebar - Desktop */}
        <div className="hidden lg:block lg:w-[320px] flex-shrink-0">
          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isActive = currentLessonId === lesson.id;

              return (
                <motion.button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`w-full text-left p-4 rounded-[14px] transition-all ${
                    isActive
                      ? "bg-violet-500/8 border-l-2 border-violet-500"
                      : "border border-white/5 hover:border-white/10"
                  }`}
                  layoutId="activeLesson"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="rs-overline text-xs">{lesson.chapter}</span>
                      <h4 className="text-white font-medium mt-1">{lesson.title}</h4>
                      <div className="flex items-center gap-1 mt-2 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{lesson.duration}</span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-violet-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 min-w-0">
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
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}