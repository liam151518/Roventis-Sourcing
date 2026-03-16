"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  CheckCircle, 
  Play, 
  Clock,
  ChevronRight,
  BookOpen,
  Award,
  Video,
  FileText
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TrainingPage() {
  const trainingModules = useQuery(api.training.getTrainingModules);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  const [selectedModule, setSelectedModule] = useState<typeof trainingModules[0] | null>(null);
  
  if (!trainingModules || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const completedModules = currentAffiliate.trainingCompleted ? trainingModules.length : 0;
  const progress = trainingModules.length > 0 ? Math.round((completedModules / trainingModules.length) * 100) : 0;

  const getModuleIcon = (content: string) => {
    if (content.includes("video") || content.includes("Watch")) return Video;
    if (content.includes("quiz") || content.includes("Test")) return Award;
    return BookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">Training Center</h1>
          <p className="text-gray-500 mt-1">Complete training modules to boost your sales</p>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#141417] rounded-2xl border border-white/5 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Your Progress</h2>
              <p className="text-gray-500 text-sm">{completedModules} of {trainingModules.length} modules completed</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 md:w-48 h-3 bg-[#0a0a0b] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <span className="text-2xl font-bold text-white">{progress}%</span>
          </div>
        </div>
      </motion.div>

      {/* Training Modules Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainingModules.map((module, index) => {
          const Icon = getModuleIcon(module.content);
          const isCompleted = currentAffiliate.trainingCompleted;
          
          return (
            <motion.div
              key={module._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedModule(module)}
              className={`group bg-[#141417] rounded-2xl border border-white/5 p-6 cursor-pointer hover:border-white/10 transition-all hover:shadow-lg hover:shadow-black/20 ${
                isCompleted ? "opacity-75" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isCompleted ? "bg-emerald-500/10" : "bg-blue-500/10"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <Icon className="w-7 h-7 text-blue-400" />
                  )}
                </div>
                {module.isRequired && (
                  <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">Required</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
                {module.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {module.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {module.estimatedMinutes} min
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isCompleted ? "text-emerald-400" : "text-blue-400"
                }`}>
                  {isCompleted ? "Completed" : "Start"} 
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedModule(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#141417] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedModule.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedModule.estimatedMinutes} min
                    </span>
                    {selectedModule.isRequired && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">Required</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">About this module</h3>
                <p className="text-gray-300">{selectedModule.description}</p>
              </div>
              
              <div className="bg-[#0a0a0b] rounded-xl p-6">
                <div className="flex items-center justify-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
                    <Play className="w-5 h-5" />
                    Start Module
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-[#0a0a0b] rounded-xl p-4">
                  <div className="text-gray-500 mb-1">Module</div>
                  <div className="text-white font-medium">#{selectedModule.orderIndex + 1}</div>
                </div>
                <div className="bg-[#0a0a0b] rounded-xl p-4">
                  <div className="text-gray-500 mb-1">Type</div>
                  <div className="text-white font-medium">Video & Quiz</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
