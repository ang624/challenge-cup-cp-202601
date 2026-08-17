"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { chartTheme } from "@/lib/chart-theme";
import type { ThemeMode } from "@/types/data";

type AxisRecord = Record<string, unknown>;

function asAxisRecords(value: unknown): AxisRecord[] {
  if (Array.isArray(value)) return value as AxisRecord[];
  return value && typeof value === "object" ? [value as AxisRecord] : [];
}

function mergeAxisRecord(base: AxisRecord, local: AxisRecord, direction: "x" | "y", index: number): AxisRecord {
  const hasName = typeof local.name === "string" && local.name.length > 0;
  const baseNameStyle = (base.nameTextStyle as AxisRecord | undefined) ?? {};
  const localNameStyle = (local.nameTextStyle as AxisRecord | undefined) ?? {};

  return {
    ...base,
    ...local,
    axisLine: { ...((base.axisLine as AxisRecord | undefined) ?? {}), ...((local.axisLine as AxisRecord | undefined) ?? {}) },
    axisTick: { ...((base.axisTick as AxisRecord | undefined) ?? {}), ...((local.axisTick as AxisRecord | undefined) ?? {}) },
    axisLabel: { ...((base.axisLabel as AxisRecord | undefined) ?? {}), ...((local.axisLabel as AxisRecord | undefined) ?? {}) },
    splitLine: { ...((base.splitLine as AxisRecord | undefined) ?? {}), ...((local.splitLine as AxisRecord | undefined) ?? {}) },
    ...(hasName && direction === "x" ? {
      nameLocation: local.nameLocation ?? "middle",
      nameGap: local.nameGap ?? 34,
      nameTextStyle: {
        ...baseNameStyle,
        ...localNameStyle,
        align: localNameStyle.align ?? "center",
        verticalAlign: localNameStyle.verticalAlign ?? "top",
        padding: localNameStyle.padding ?? [8, 0, 0, 0],
      },
    } : {}),
    ...(hasName && direction === "y" ? {
      nameLocation: local.nameLocation ?? "end",
      nameGap: local.nameGap ?? 18,
      nameTextStyle: {
        ...baseNameStyle,
        ...localNameStyle,
        align: localNameStyle.align ?? (local.position === "right" || index > 0 ? "right" : "left"),
        verticalAlign: localNameStyle.verticalAlign ?? "bottom",
        padding: localNameStyle.padding ?? [0, 0, 5, 0],
      },
    } : {}),
  };
}

function mergeAxes(baseValue: unknown, localValue: unknown, direction: "x" | "y") {
  const baseAxes = asAxisRecords(baseValue);
  const localAxes = asAxisRecords(localValue);
  const merged = localAxes.map((axis, index) => mergeAxisRecord(baseAxes[index] ?? baseAxes[0] ?? {}, axis, direction, index));
  return Array.isArray(localValue) ? merged : merged[0];
}

function safeGridValue(value: unknown, minimum: number): number | string {
  if (typeof value === "number") return Math.max(value, minimum);
  return typeof value === "string" ? value : minimum;
}

function axisHasName(value: unknown) {
  return asAxisRecords(value).some((axis) => typeof axis.name === "string" && axis.name.length > 0);
}

function mergeOptions(base: EChartsOption, local: EChartsOption): EChartsOption {
  const usesCartesianAxes = local.xAxis !== undefined || local.yAxis !== undefined;
  const localGrid = (local.grid as AxisRecord | undefined) ?? {};
  const baseGrid = (base.grid as AxisRecord | undefined) ?? {};
  return {
    ...base,
    ...local,
    textStyle: { ...(base.textStyle as object), ...(local.textStyle as object) },
    tooltip: { ...(base.tooltip as object), ...(local.tooltip as object) },
    legend: local.legend ?? base.legend,
    grid: usesCartesianAxes ? {
      ...baseGrid,
      ...localGrid,
      left: safeGridValue(localGrid.left, 68),
      right: safeGridValue(localGrid.right, 40),
      top: axisHasName(local.yAxis) ? safeGridValue(localGrid.top, 50) : safeGridValue(localGrid.top ?? baseGrid.top, 30),
      bottom: safeGridValue(localGrid.bottom, 58),
      containLabel: true,
    } : undefined,
    xAxis: usesCartesianAxes ? mergeAxes(base.xAxis, local.xAxis ?? base.xAxis, "x") : undefined,
    yAxis: usesCartesianAxes ? mergeAxes(base.yAxis, local.yAxis ?? base.yAxis, "y") : undefined,
  };
}

export function DecisionChart({ option, height = 340, ariaLabel }: { option: EChartsOption; height?: number; ariaLabel: string }) {
  const { resolvedTheme } = useTheme();
  const mode: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";
  const merged = useMemo(() => {
    const themed = mergeOptions(chartTheme(mode), option);
    const radar = themed.radar as { axisName?: Record<string, unknown> } | undefined;
    if (!radar || Array.isArray(radar)) return themed;
    return {
      ...themed,
      radar: {
        ...radar,
        axisName: {
          ...radar.axisName,
          color: mode === "dark" ? "#C2CEDA" : "#536579",
          fontSize: 13,
          fontWeight: 500,
        },
      },
    };
  }, [mode, option]);
  return (
    <div className="decision-chart" role="img" aria-label={ariaLabel}>
      <ReactECharts option={merged} notMerge lazyUpdate style={{ height }} opts={{ renderer: "canvas" }} />
    </div>
  );
}
