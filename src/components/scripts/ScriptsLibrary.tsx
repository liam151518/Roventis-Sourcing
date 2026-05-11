"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Lightbulb, HelpCircle } from "lucide-react";
import { 
  libraryTitle, 
  librarySubtitle, 
  goldenRule, 
  libraryAttribution, 
  stages, 
  allScripts,
  type Script 
} from "./scriptsContent";
import ScriptCard, { ScriptDetail } from "./ScriptCard";

export default function ScriptsLibrary() {
  const [selectedScript, setSelectedScript] = useState<Script>(allScripts[0]);
  const [expandedStage, setExpandedStage] = useState<string>("stage-1");
  const [showAttribution, setShowAttribution] = useState(false);

  const toggleStage = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? "" : stageId);
  };

  const handleSelectScript = (script: Script) => {
    setSelectedScript(script);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rs-card-[14px] border border-white/5 p-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <ScrollText className="w-5 h-5 text-violet-400" />
          <span className="rs-overline text-xs">SCRIPTS LIBRARY</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mt-2">
          {libraryTitle}
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl">{librarySubtitle}</p>

        {/* Golden Rule */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Golden Rule</span>
              <p className="text-amber-100 text-sm mt-1">{goldenRule}</p>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-6 relative">
          <button
            onClick={() => setShowAttribution(!showAttribution)}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Attribution</span>
          </button>
          <AnimatePresence>
            {showAttribution && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-8 left-0 mt-2 p-4 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl max-w-[400px] z-50"
              >
                <p className="text-xs text-gray-400 leading-relaxed">{libraryAttribution.text}</p>
                <a
                  href={libraryAttribution.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-400 hover:text-violet-300 mt-2 inline-block"
                >
                  {libraryAttribution.linkLabel}
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Stage Sidebar - Mobile: Horizontal Scroll */}
        <div className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => toggleStage(stage.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  expandedStage === stage.id
                    ? "bg-violet-500/20 text-white border border-violet-500"
                    : "bg-[#141417] text-gray-400 border border-white/5"
                }`}
              >
                Stage {stage.number}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Sidebar - Desktop */}
        <div className="hidden lg:block lg:w-[320px] flex-shrink-0">
          <div className="space-y-4">
            {stages.map((stage) => {
              const isExpanded = expandedStage === stage.id;
              return (
                <div key={stage.id}>
                  <button
                    onClick={() => toggleStage(stage.id)}
                    className="w-full text-left p-4 rounded-[14px] transition-all border border-white/5 hover:border-white/10"
                  >
                    <span className="rs-overline text-xs">Stage {stage.number}</span>
                    <h4 className="text-white font-medium mt-1">{stage.title}</h4>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{stage.subtitle}</p>
                  </button>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2 pl-2"
                    >
                      {stage.scripts.map((script) => (
                        <ScriptCard
                          key={script.id}
                          script={script}
                          isActive={selectedScript.id === script.id}
                          onClick={() => handleSelectScript(script)}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Script Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selectedScript && (
              <ScriptDetail key={selectedScript.id} script={selectedScript} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}