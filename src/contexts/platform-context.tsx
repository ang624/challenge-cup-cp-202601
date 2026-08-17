"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getPlatformSnapshot } from "@/services/api/platform";
import { validPageSlugs, type PageSlug } from "@/lib/navigation";
import type {
  DevelopmentScenario,
  PlatformSnapshot,
  Quantile,
  ScenarioSelection,
  TechnologyCode,
  TrafficScene,
  ViewMode,
} from "@/types/data";

const TECHNOLOGIES: TechnologyCode[] = ["PSC_C", "PSC_T", "PSC_A"];
const SCENES: TrafficScene[] = ["全部场景", "屋顶", "车棚", "边坡", "声屏障"];
const SCENARIOS: DevelopmentScenario[] = ["市场约束", "基准转型", "政策加速"];
const QUANTILES: Quantile[] = ["P10", "P50", "P90"];
const VIEW_MODES: ViewMode[] = ["strategy", "research"];
const VIEW_STORAGE_KEY = "cp-202601-view-mode";
const VIEW_STORAGE_EVENT = "cp-202601-view-mode-change";

const defaultSelection: ScenarioSelection = {
  region: "云南省",
  year: 2035,
  technology: "PSC_T",
  scene: "全部场景",
  scenario: "基准转型",
  quantile: "P50",
};

interface PlatformContextValue {
  snapshot: PlatformSnapshot | null;
  loading: boolean;
  error: string | null;
  selection: ScenarioSelection;
  updateSelection: (patch: Partial<ScenarioSelection>) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

function validValue<T extends string>(value: string | null, options: T[], fallback: T): T {
  return value && options.includes(value as T) ? (value as T) : fallback;
}

function subscribeViewPreference(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(VIEW_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(VIEW_STORAGE_EVENT, callback);
  };
}

function getStoredViewPreference(): ViewMode {
  return window.localStorage.getItem(VIEW_STORAGE_KEY) === "research" ? "research" : "strategy";
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState<PlatformSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const storedViewMode = useSyncExternalStore<ViewMode>(subscribeViewPreference, getStoredViewPreference, () => "strategy");
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("cp-202601-sidebar") === "collapsed");

  const selection = useMemo<ScenarioSelection>(() => {
    const yearValue = Number(searchParams.get("year"));
    return {
      region: searchParams.get("region") || defaultSelection.region,
      year: Number.isInteger(yearValue) && yearValue >= 2025 && yearValue <= 2060 ? yearValue : defaultSelection.year,
      technology: validValue(searchParams.get("technology"), TECHNOLOGIES, defaultSelection.technology),
      scene: validValue(searchParams.get("scene"), SCENES, defaultSelection.scene),
      scenario: validValue(searchParams.get("scenario"), SCENARIOS, defaultSelection.scenario),
      quantile: validValue(searchParams.get("quantile"), QUANTILES, defaultSelection.quantile),
    };
  }, [searchParams]);
  const selectionRef = useRef(selection);
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const page = pathname.split("/").filter(Boolean)[0] as PageSlug | undefined;
  const selectionKey = `${page}/${selection.region}/${selection.year}/${selection.technology}/${selection.scene}/${selection.scenario}/${selection.quantile}`;
  const [loadedKey, setLoadedKey] = useState("");

  useEffect(() => {
    if (!page || !validPageSlugs.has(page)) return;
    const controller = new AbortController();
    getPlatformSnapshot(page, selection, controller.signal)
      .then((nextSnapshot) => {
        setSnapshot(nextSnapshot);
        setLoadedKey(selectionKey);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "发布数据加载失败");
      });
    return () => controller.abort();
  }, [page, selection, selectionKey]);

  const viewMode = validValue<ViewMode>(searchParams.get("view"), VIEW_MODES, storedViewMode);

  useEffect(() => {
    if (searchParams.has("view")) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", storedViewMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, storedViewMode]);

  const updateSelection = useCallback(
    (patch: Partial<ScenarioSelection>) => {
      const next = { ...selectionRef.current, ...patch };
      selectionRef.current = next;
      const params = new URLSearchParams(searchParams.toString());
      params.set("region", next.region);
      params.set("year", String(next.year));
      params.set("technology", next.technology);
      params.set("scene", next.scene);
      params.set("scenario", next.scenario);
      params.set("quantile", next.quantile);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setViewMode = useCallback((mode: ViewMode) => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    window.dispatchEvent(new Event(VIEW_STORAGE_EVENT));
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setSidebarCollapsedState(value);
    window.localStorage.setItem("cp-202601-sidebar", value ? "collapsed" : "expanded");
  }, []);

  const currentSnapshot = loadedKey === selectionKey ? snapshot : null;
  const value = useMemo(
    () => ({
      snapshot: currentSnapshot,
      loading: !currentSnapshot && !error,
      error,
      selection,
      updateSelection,
      viewMode,
      setViewMode,
      sidebarCollapsed,
      setSidebarCollapsed,
    }),
    [currentSnapshot, error, selection, setSidebarCollapsed, setViewMode, sidebarCollapsed, updateSelection, viewMode],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): PlatformContextValue {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform必须在PlatformProvider中使用");
  return context;
}
