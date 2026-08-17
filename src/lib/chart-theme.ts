import type { EChartsOption } from "echarts";
import type { ThemeMode } from "@/types/data";

export const chartColors = {
  primary: "#2563EB",
  psc: "#14A66F",
  pscConservative: "#7CBBA0",
  pscTarget: "#2C9D72",
  pscAdvanced: "#146C4D",
  csi: "#3E73A8",
  bess: "#2BAED1",
  economics: "#C58A30",
  carbon: "#4F9275",
  uncertainty: "#8393A7",
  risk: "#C95C5C",
  market: "#6B7E93",
  transition: "#0B8F7C",
  acceleration: "#D18A22",
} as const;

export const scenarioColors = {
  市场约束: chartColors.market,
  基准转型: chartColors.transition,
  政策加速: chartColors.acceleration,
} as const;

export function linearGradient(start: string, end: string, vertical = false) {
  return {
    type: "linear" as const,
    x: 0,
    y: 0,
    x2: vertical ? 0 : 1,
    y2: vertical ? 1 : 0,
    colorStops: [
      { offset: 0, color: start },
      { offset: 1, color: end },
    ],
  };
}

export function chartTheme(mode: ThemeMode): EChartsOption {
  const dark = mode === "dark";
  const text = dark ? "#D9E3EC" : "#26384A";
  const muted = dark ? "#8EA1B5" : "#758398";
  const line = dark ? "rgba(170,200,220,0.09)" : "rgba(80,100,120,0.10)";
  const tooltipBg = dark ? "rgba(9,29,48,0.92)" : "rgba(255,255,255,0.90)";

  return {
    backgroundColor: "transparent",
    color: [chartColors.primary, chartColors.psc, chartColors.csi, chartColors.bess],
    animation: true,
    animationDuration: 320,
    animationEasing: "cubicOut",
    textStyle: {
      color: text,
      fontFamily: "Inter, Geist, Segoe UI, Microsoft YaHei, sans-serif",
      fontSize: 14,
    },
    legend: {
      top: 0,
      textStyle: { color: muted, fontSize: 13 },
      itemWidth: 18,
      itemHeight: 8,
      itemGap: 18,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: tooltipBg,
      borderColor: dark ? "rgba(105,180,220,0.22)" : "rgba(255,255,255,0.78)",
      borderWidth: 1,
      padding: [11, 13],
      textStyle: { color: text, fontSize: 13 },
      extraCssText: "backdrop-filter:blur(14px) saturate(120%);border-radius:12px;box-shadow:0 12px 34px rgba(23,47,72,.14)",
    },
    grid: { left: 68, right: 40, top: 58, bottom: 58, containLabel: true },
    xAxis: {
      axisLine: { lineStyle: { color: muted } },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 13 },
      splitLine: { show: false },
      nameTextStyle: { color: muted, fontSize: 13 },
    },
    yAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 13 },
      splitLine: { lineStyle: { color: line } },
      nameTextStyle: { color: muted, fontSize: 13 },
    },
  };
}
