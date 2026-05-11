"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, MessageSquare, Lightbulb, Zap } from "lucide-react";
import type { Script } from "./scriptsContent";

interface ScriptCardProps {
  script: Script;
  isActive: boolean;
  onClick: () => void;
}

export default function ScriptCard({ script, isActive, onClick }: ScriptCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-[14px] transition-all border ${
        isActive
          ? "bg-violet-500/8 border-l-2 border-violet-500"
          : "border-white/5 hover:border-white/10 bg-[#141417]"
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm ${isActive ? "text-white" : "text-gray-300"}`}>
            {script.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{script.trigger}</p>
        </div>
        {isActive && (
          <MessageSquare className="w-4 h-4 text-violet-400 flex-shrink-0 mt-1" />
        )}
      </div>
    </motion.button>
  );
}

interface ScriptDetailProps {
  script: Script;
}

export function ScriptDetail({ script }: ScriptDetailProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <span className="rs-overline text-xs">{script.title}</span>
        <p className="text-gray-400 mt-2 text-sm">{script.trigger}</p>
      </div>

      {/* Lead Says */}
      <div className="rs-card-[14px] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500 uppercase tracking-wider">Lead Says</span>
        </div>
        <p className="text-gray-300 text-sm italic">"{script.leadSays}"</p>
      </div>

      {/* Your Script */}
      <div className="rs-card-[14px] border border-violet-500/20 bg-violet-500/[0.05] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-violet-400 uppercase tracking-wider">Your Script</span>
          </div>
          <button
            onClick={() => handleCopy(script.yourScript, "script")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            {copied === "script" ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <p className="text-white text-sm leading-relaxed">{script.yourScript}</p>
        {script.delivery && (
          <p className="text-violet-300 text-xs mt-3 italic">{script.delivery}</p>
        )}
      </div>

      {/* Why It Works */}
      <div className="rs-card-[14px] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-400 uppercase tracking-wider">Why It Works</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{script.whyItWorks}</p>
      </div>

      {/* Techniques */}
      <div className="flex flex-wrap gap-2">
        {script.techniques.map((technique, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300"
          >
            {technique}
          </span>
        ))}
      </div>
    </motion.div>
  );
}