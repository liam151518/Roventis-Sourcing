"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { courseTitle, courseSubtitle, courseAttribution, lessons } from "./coachingContent";
import LessonView from "./LessonView";

const STORAGE_KEY = "roventis_coaching_progress";

interface ProgressData {
  completedLessonIds: string[];
}

export default function CoachingCourse() {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>(lessons[0]?.id || "");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ProgressData = JSON.parse(stored);
        setCompletedLessonIds(data.completedLessonIds || []);
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

  const saveProgress = useCallback((completed: string[]) => {
    try {
      const data: ProgressData = { completedLessonIds: completed };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, []);

  const handleSelectLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = (lessonId: string) => {
    if (!completedLessonIds.includes(lessonId)) {
      const updated = [...completedLessonIds, lessonId];
      setCompletedLessonIds(updated);
      saveProgress(updated);
    }
    const currentIndex = lessons.findIndex((l) => l.id === lessonId);
    if (currentIndex < lessons.length - 1) {
      setTimeout(() => {
        setCurrentLessonId(lessons[currentIndex + 1].id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1500);
    }
  };

  const currentLesson = lessons.find((l) => l.id === currentLessonId);
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleSelectLesson(lessons[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      handleSelectLesson(lessons[currentIndex + 1].id);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const completedCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const progress = (completedCount / lessons.length) * 100;
  const isCourseCompleted = completedCount === lessons.length;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card-[14px] border border-white/5 p-8"
      >
        <span className="rs-overline">BEHAVIORAL SALES COURSE</span>
        {isCourseCompleted && (
          <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </span>
        )}
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

        {/* Subtle Attribution Dropdown */}
        <details className="mt-6 group w-fit">
          <summary className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer list-none flex items-center gap-2 transition-colors">
            <span className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-gray-400 flex items-center justify-center text-[10px] transition-colors">?</span>
            <span>Source attribution</span>
          </summary>
          <p className="text-xs text-gray-500 mt-2 pl-6 max-w-md leading-relaxed">
            {courseAttribution.text}{" "}
            <a
              href={courseAttribution.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400/70 hover:text-violet-400 underline underline-offset-2 transition-colors"
            >
              {courseAttribution.linkText}
            </a>
          </p>
        </details>
      </motion.div>

      {/* Lesson Navigation - Horizontal Scroll */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isActive = currentLessonId === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-violet-500/20 text-white border border-violet-500"
                    : "bg-[#141417] text-gray-400 border border-white/5 hover:border-white/10"
                }`}
              >
                <span className="text-xs text-gray-500">{index + 1}.</span>
                <span>{lesson.chapter}</span>
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson Content - Full Width */}
      <div className="w-full">
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
  );
}