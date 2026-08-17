"use client";

import { motion } from "framer-motion";
import { BarChart3, FlaskConical } from "lucide-react";
import { usePlatform } from "@/contexts/platform-context";
import { cn } from "@/lib/utils";

export interface ViewModeSectionProps {
  strategy: React.ReactNode;
  research: React.ReactNode;
  shared?: React.ReactNode;
  className?: string;
}

export function ViewModeSection({ strategy, research, shared, className }: ViewModeSectionProps) {
  const { viewMode } = usePlatform();
  return (
    <div className={cn("view-mode-section", className)} data-view-mode={viewMode}>
      {shared}
      <motion.div
        key={viewMode}
        data-view-exclusive={viewMode}
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.19, ease: "easeOut" }}
      >
        {viewMode === "strategy" ? strategy : research}
      </motion.div>
    </div>
  );
}

export function ModeContextBar() {
  const { viewMode } = usePlatform();
  const strategy = viewMode === "strategy";
  const Icon = strategy ? BarChart3 : FlaskConical;
  return (
    <div className="mode-context-bar" role="status" aria-live="polite">
      <Icon aria-hidden="true" />
      <strong>{strategy ? "战略视图" : "研究视图"}</strong>
      <span>{strategy ? "面向评审与决策，突出结论、窗口和行动" : "面向专家核查，展示区间、边界、参数和证据"}</span>
    </div>
  );
}
