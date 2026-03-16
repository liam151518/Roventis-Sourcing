"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, CheckCircle, Play, FileText } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function TrainingPage() {
  const trainingModules = useQuery(api.training.getTrainingModules);
  const currentAffiliate = useQuery(api.affiliates.getCurrentAffiliate);
  
  if (!trainingModules || !currentAffiliate) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="text-gray-400">Complete required training modules</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(trainingModules || []).map((module: any, index: number) => (
          <motion.div
            key={module._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{module.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-500">{module.estimatedMinutes} min</span>
                  {module.isRequired && (
                    <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Required</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
