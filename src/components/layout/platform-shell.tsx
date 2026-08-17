"use client";

import { motion } from "framer-motion";
import { GlobalControls, type ControlAxis } from "@/components/layout/global-controls";
import { ResearchHeader } from "@/components/layout/research-header";
import { ResearchSidebar } from "@/components/layout/research-sidebar";
import { PageHeader } from "@/components/common/page-header";
import { ModeContextBar } from "@/components/common/view-mode-section";
import { ErrorState, LoadingState } from "@/components/common/status";
import { BaselinePage } from "@/components/pages/baseline-page";
import { CultivationPage } from "@/components/pages/cultivation-page";
import { EvidencePage } from "@/components/pages/evidence-page";
import { StationPage } from "@/components/pages/station-page";
import { StrategicPage } from "@/components/pages/strategic-page";
import { TechnologyPage } from "@/components/pages/technology-page";
import { YunnanPage } from "@/components/pages/yunnan-page";
import { usePlatform } from "@/contexts/platform-context";
import type { PageSlug } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const pageComponents: Record<PageSlug, React.ComponentType> = {
  strategic: StrategicPage,
  baseline: BaselinePage,
  technology: TechnologyPage,
  station: StationPage,
  yunnan: YunnanPage,
  cultivation: CultivationPage,
  evidence: EvidencePage,
};

const pageControlAxes: Partial<Record<PageSlug, ControlAxis[]>> = {
  strategic: ["technology", "year", "scene", "scenario", "quantile"],
  technology: ["technology", "year", "scene", "scenario", "quantile"],
  station: ["technology", "year", "scene", "scenario", "quantile"],
  yunnan: ["technology", "year", "scene", "scenario", "quantile"],
  cultivation: ["technology", "year"],
};

export function PlatformShell({ page }: { page: PageSlug }) {
  const { sidebarCollapsed, loading, error } = usePlatform();
  const Page = pageComponents[page];
  const controlAxes = pageControlAxes[page];
  return (
    <div className={cn("platform-shell", sidebarCollapsed && "shell-collapsed") }>
      <ResearchSidebar page={page} />
      <div className="platform-main">
        <ResearchHeader />
        <motion.main key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" }}>
          <PageHeader page={page} />
          {controlAxes ? <GlobalControls axes={controlAxes} /> : null}
          <ModeContextBar />
          <div className="page-content-state" aria-busy={loading}>
            {error ? <ErrorState message={error} /> : <Page />}
            {loading ? <LoadingState /> : null}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
