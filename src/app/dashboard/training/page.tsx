"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Award,
  ChevronRight,
  FileText,
  Video
} from "lucide-react";
import { useDemoData } from "@/lib/demo-data";

export default function TrainingPage() {
  const { trainingModules, trainingProgress } = useDemoData();
  const [selectedModule, setSelectedModule] = useState<typeof trainingModules[0] | null>(null);
  
  // Using first affiliate as demo user
  const affiliateId = "aff-001";
  const userProgress = trainingProgress.filter(p => p.affiliateId === affiliateId);
  
  const completedCount = userProgress.filter(p => p.status === "completed").length;
  const progressPercent = Math.round((completedCount / trainingModules.length) * 100);

  const getModuleStatus = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.status || "not_started";
  };

  const getModuleScore = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.quizScore;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Training Center</h1>
          <p className="text-gray-500">Complete required modules to unlock all features</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Your Progress</h2>
            <p className="text-gray-500 text-sm">{completedCount} of {trainingModules.length} modules completed</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-600">{progressPercent}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-3 rounded-full"
          />
        </div>
        {progressPercent === 100 && (
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <Award className="w-5 h-5" />
            <span className="font-medium">Congratulations! You've completed all training modules.</span>
          </div>
        )}
      </div>

      {/* Module List */}
      <div className="grid gap-4">
        {trainingModules.map((module, index) => {
          const status = getModuleStatus(module.id);
          const score = getModuleScore(module.id);
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${
                status === "not_started" ? "opacity-75" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Module Number */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  status === "completed" 
                    ? "bg-green-100" 
                    : status === "in_progress"
                    ? "bg-amber-100"
                    : "bg-gray-100"
                }`}>
                  {status === "completed" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : status === "in_progress" ? (
                    <Play className="w-6 h-6 text-amber-600" />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">{index + 1}</span>
                  )}
                </div>

                {/* Module Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{module.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">{module.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm flex-shrink-0">
                      <Clock className="w-4 h-4" />
                      {module.estimatedMinutes} min
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    {module.isRequired && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Required
                      </span>
                    )}
                    {score && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Score: {score}%
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedModule(module)}
                      className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        status === "completed"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : status === "in_progress"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-primary text-white hover:bg-primary-light"
                      }`}
                    >
                      {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModule(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-primary">{selectedModule.title}</h2>
              <p className="text-gray-500 mt-1">{selectedModule.description}</p>
            </div>
            
            <div className="p-6">
              {/* Video Placeholder */}
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Video content would play here</p>
                  <p className="text-sm text-gray-400">Loom / Mux integration</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-primary mb-2">Module Content</h3>
                <p className="text-gray-600">{selectedModule.content}</p>
              </div>

              {/* Resources */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-primary mb-3">Downloadable Resources</h4>
                <div className="space-y-2">
                  <button className="flex items-center gap-3 w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Module Notes (PDF)</span>
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">Quick Reference Guide</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setSelectedModule(null)}
                className="px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-5 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-400">
                Take Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
