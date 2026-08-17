import type { EChartsOption, LineSeriesOption } from "echarts";
import { chartColors, linearGradient, scenarioColors } from "@/lib/chart-theme";
import type {
  AnnualResult,
  DevelopmentScenario,
  PolicyAnnualResult,
  ProjectScenarioResult,
  ProjectSnapshot,
  Quantile,
  ScenePriority,
  TechnologyCode,
  TechnologyMaturityResult,
} from "@/types/data";

function rowsFor(results: AnnualResult[], scenario: DevelopmentScenario, quantile: "P10" | "P50" | "P90") {
  return results
    .filter((row) => row.development_scenario === scenario && row.quantile === quantile)
    .sort((a, b) => a.year - b.year);
}

function fixed(value: unknown, digits = 3) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(digits) : "—";
}

function metricUnit(metric: keyof AnnualResult) {
  if (metric === "generation_gwh") return "GWh";
  if (metric === "investment_million_cny") return "百万元";
  return "MWp";
}

export function scenarioTrajectoryOption(
  results: AnnualResult[],
  metric: keyof AnnualResult = "stock_capacity_mw",
  selectedScenario: DevelopmentScenario = "基准转型",
  selectedQuantile: Quantile = "P50",
  selectedYear?: number,
): EChartsOption {
  const scenarios: DevelopmentScenario[] = ["市场约束", "基准转型", "政策加速"];
  const series: LineSeriesOption[] = [];
  const selectedP10 = rowsFor(results, selectedScenario, "P10");
  const selectedP90 = rowsFor(results, selectedScenario, "P90");
  const unit = metricUnit(metric);
  for (const scenario of scenarios) {
    const selectedRows = rowsFor(results, scenario, selectedQuantile);
    if (!selectedRows.length) continue;
    const p10 = rowsFor(results, scenario, "P10");
    const p90 = rowsFor(results, scenario, "P90");
    const color = scenarioColors[scenario];
    const active = scenario === selectedScenario;
    series.push({
      name: scenario,
      type: "line",
      smooth: 0.24,
      showSymbol: false,
      data: selectedRows.map((row) => Number(row[metric]) || 0),
      lineStyle: {
        color: linearGradient(`${color}B8`, color),
        width: active ? 3.4 : 2,
        opacity: active ? 1 : 0.68,
        shadowBlur: active ? 5 : 0,
        shadowColor: active ? `${color}30` : "transparent",
      },
      itemStyle: { color },
      emphasis: { focus: "series" },
      markLine: active && selectedYear ? {
        silent: true,
        symbol: "none",
        label: { formatter: `${selectedYear}`, color: chartColors.primary },
        lineStyle: { color: chartColors.primary, type: "dashed", width: 1.2 },
        data: [{ xAxis: selectedYear }],
      } : undefined,
    });
    if (active && p10.length === selectedRows.length && p90.length === selectedRows.length) {
      series.unshift(
        {
          name: "中位区间下界",
          type: "line",
          stack: "uncertainty-band",
          symbol: "none",
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 },
          data: p10.map((row) => Number(row[metric]) || 0),
          silent: true,
        },
        {
          name: "P10—P90",
          type: "line",
          stack: "uncertainty-band",
          symbol: "none",
          lineStyle: { opacity: 0 },
          areaStyle: { color: linearGradient("rgba(20,166,111,.28)", "rgba(43,174,209,.04)", true) },
          data: p90.map((row, index) => Math.max(0, (Number(row[metric]) || 0) - (Number(p10[index][metric]) || 0))),
          silent: true,
        },
      );
    }
  }
  const base = rowsFor(results, selectedScenario, selectedQuantile);
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line", lineStyle: { color: "rgba(107,126,147,.42)", type: "dashed" } },
      formatter: (params) => {
        const values = (Array.isArray(params) ? params : [params]) as Array<{
          axisValue?: string | number;
          marker?: string;
          seriesName?: string;
          value?: unknown;
          dataIndex?: number;
        }>;
        const visible = values.filter((item) => scenarios.includes(item.seriesName as DevelopmentScenario));
        const index = visible[0]?.dataIndex ?? 0;
        const lines = visible.map((item) => `${item.marker ?? ""}${item.seriesName ?? ""}：${fixed(item.value)} ${unit}`);
        if (selectedP10[index] && selectedP90[index]) {
          lines.push(`${selectedScenario}区间：${fixed(selectedP10[index][metric])}—${fixed(selectedP90[index][metric])} ${unit}`);
        }
        return [`<strong>${values[0]?.axisValue ?? ""}年</strong>`, ...lines].join("<br/>");
      },
    },
    legend: {
      data: scenarios.filter((scenario) => rowsFor(results, scenario, selectedQuantile).length > 0),
      bottom: 0,
    },
    grid: { left: 72, right: 34, top: 60, bottom: 76, containLabel: true },
    xAxis: {
      type: "category",
      name: "年份",
      nameLocation: "middle",
      nameGap: 32,
      boundaryGap: false,
      data: base.map((row) => row.year),
    },
    yAxis: {
      type: "value",
      name: metric === "generation_gwh" ? "发电量（GWh）" : metric === "investment_million_cny" ? "投资（百万元）" : "存量装机（MWp）",
      nameLocation: "end",
      nameGap: 20,
      nameTextStyle: { align: "left", verticalAlign: "bottom", padding: [0, 0, 4, 0] },
    },
    series,
  };
}

export function scenePriorityOption(items: ScenePriority[]): EChartsOption {
  const ordered = [...items].sort((a, b) => a.value - b.value);
  const colors = [chartColors.pscAdvanced, chartColors.pscTarget, chartColors.bess, chartColors.primary];
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        return `<strong>${item.name}</strong><br/>存量装机：${fixed(item.value)} MWp`;
      },
    },
    grid: { left: 58, right: 74, top: 20, bottom: 58, containLabel: true },
    xAxis: {
      type: "value",
      name: "装机规模（MWp）",
      nameLocation: "middle",
      nameGap: 34,
    },
    yAxis: { type: "category", data: ordered.map((item) => item.scene) },
    series: [{
      type: "bar",
      data: ordered.map((item, index) => ({
        value: item.value,
        itemStyle: { color: linearGradient(`${colors[index]}66`, colors[index]) },
      })),
      barWidth: 20,
      label: { show: true, position: "right", formatter: (params) => `${fixed(params.value)} MWp` },
    }],
  };
}

export function policyRadarOption(items: Array<Pick<PolicyAnnualResult, "component_name" | "intensity">>): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const payload = Array.isArray(params) ? params[0] : params;
        const values = (payload?.value as number[] | undefined) ?? [];
        return [`<strong>政策组合</strong>`, ...items.map((item, index) => `${item.component_name}：${fixed(values[index])}%`)].join("<br/>");
      },
    },
    radar: {
      center: ["50%", "52%"],
      radius: "64%",
      splitNumber: 4,
      indicator: items.map((item) => ({ name: item.component_name, max: 100 })),
      axisName: { color: chartColors.uncertainty, fontSize: 12 },
      splitArea: { areaStyle: { color: ["rgba(37,99,235,.015)", "rgba(20,166,111,.035)"] } },
      splitLine: { lineStyle: { color: "rgba(110,135,160,.18)" } },
      axisLine: { lineStyle: { color: "rgba(110,135,160,.18)" } },
    },
    series: [{
      type: "radar",
      data: [{ value: items.map((item) => Number((item.intensity * 100).toFixed(3))), name: "政策组合" }],
      lineStyle: { color: chartColors.primary, width: 2 },
      itemStyle: { color: chartColors.primary },
      areaStyle: { color: linearGradient("rgba(37,99,235,.28)", "rgba(20,166,111,.10)", true) },
    }],
  };
}

export function stationEconomicOption(items: Array<Pick<ProjectScenarioResult, "scene" | "npv_cny" | "lcoe_cny_kwh">>): EChartsOption {
  const values = items.map((item) => Number((item.npv_cny / 1e6).toFixed(3)));
  return {
    tooltip: { trigger: "item", formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `<strong>${item.name}</strong><br/>净现值：${fixed(item.value)} 百万元`;
    } },
    xAxis: { type: "category", data: items.map((item) => item.scene) },
    yAxis: { type: "value", name: "净现值（百万元）", max: (value) => Math.max(0, value.max) },
    series: [{
      type: "bar",
      data: items.map((item, index) => ({ value: values[index], itemStyle: { color: linearGradient(item.npv_cny >= 0 ? "#79D6B0" : "#E6B493", item.npv_cny >= 0 ? chartColors.psc : chartColors.risk, true) } })),
      barMaxWidth: 42,
      label: { show: true, position: "top", formatter: (params) => fixed(params.value) },
      markLine: { silent: true, symbol: "none", label: { show: false }, lineStyle: { color: chartColors.uncertainty, width: 1.2 }, data: [{ yAxis: 0 }] },
    }],
  };
}

export function lifecycleCarbonOption(items: ProjectScenarioResult[]): EChartsOption {
  return {
    tooltip: { trigger: "item", formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `<strong>${item.name}</strong><br/>碳强度：${fixed(item.value)} g CO₂-eq/kWh`;
    } },
    xAxis: { type: "category", data: items.map((item) => item.scene) },
    yAxis: { type: "value", name: "碳强度（g CO₂-eq/kWh）", min: 0 },
    series: [{
      type: "bar",
      barMaxWidth: 42,
      data: items.map((item) => ({ value: Number(item.lifecycle_carbon_intensity_g_kwh.toFixed(3)), itemStyle: { color: linearGradient("#A9DEC7", chartColors.carbon, true) } })),
      label: { show: true, position: "top", formatter: (params) => fixed(params.value) },
    }],
  };
}

export function storageSynergyOption(items: ProjectScenarioResult[]): EChartsOption {
  return {
    tooltip: { trigger: "axis", formatter: (params) => {
      const values = (Array.isArray(params) ? params : [params]) as Array<{ axisValue?: string; marker?: string; seriesName?: string; value?: unknown }>;
      return [`<strong>${values[0]?.axisValue ?? ""}</strong>`, ...values.map((item) => `${item.marker ?? ""}${item.seriesName}：${fixed(item.value)} ${item.seriesName === "自给率" ? "%" : "MWh"}`)].join("<br/>");
    } },
    legend: { data: ["自给率", "年吞吐量"] },
    grid: { left: 72, right: 72, top: 54, bottom: 62, containLabel: true },
    xAxis: { type: "category", data: items.map((item) => item.scene) },
    yAxis: [
      { type: "value", name: "自给率（%）", min: 0, max: 100 },
      { type: "value", name: "年吞吐量（MWh）", min: 0 },
    ],
    series: [
      {
        name: "自给率",
        type: "bar",
        barMaxWidth: 34,
        data: items.map((item) => Number(item.storage_self_sufficiency_pct.toFixed(3))),
        itemStyle: { color: linearGradient("#B5E7F2", chartColors.bess, true) },
      },
      {
        name: "年吞吐量",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        symbolSize: 8,
        data: items.map((item) => Number(item.storage_throughput_mwh.toFixed(3))),
        lineStyle: { color: chartColors.primary, width: 2.5 },
        itemStyle: { color: chartColors.primary },
      },
    ],
  };
}

export function economicFrontierOption(items: ProjectScenarioResult[]): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const value = item.value as [number, number, number, string];
        return `<strong>${value[3]}</strong><br/>度电成本：${fixed(value[0])} 元/kWh<br/>净现值：${fixed(value[1])} 百万元<br/>场景评分：${fixed(value[2])} 分`;
      },
    },
    grid: { left: 82, right: 66, top: 54, bottom: 70, containLabel: true },
    xAxis: { type: "value", name: "平准化度电成本（元/kWh）", scale: true },
    yAxis: { type: "value", name: "净现值（百万元）", scale: true },
    series: [{
      type: "scatter",
      symbolSize: (value: number[]) => 14 + value[2] / 5,
      data: items.map((item) => [Number(item.lcoe_cny_kwh.toFixed(3)), Number((item.npv_cny / 1e6).toFixed(3)), Number(item.mcda_scene_score.toFixed(3)), item.scene]),
      itemStyle: { color: chartColors.economics, opacity: 0.86 },
      label: { show: true, position: "top", formatter: (params) => (params.value as [number, number, number, string])[3] },
      markLine: { silent: true, symbol: "none", label: { show: false }, data: [{ yAxis: 0 }], lineStyle: { color: chartColors.uncertainty, type: "dashed" } },
    }],
  };
}

export function npvHeatmapOption(items: ProjectScenarioResult[], selectedYear: number): EChartsOption {
  const years = [...new Set(items.map((item) => item.year))].sort((a, b) => a - b);
  const scenes = ["屋顶", "车棚", "边坡", "声屏障"];
  const values = items.map((item) => [years.indexOf(item.year), scenes.indexOf(item.scene), Number((item.npv_cny / 1e6).toFixed(3))]);
  const absolute = Math.max(1, ...values.map((value) => Math.abs(Number(value[2]))));
  return {
    tooltip: { position: "top", formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      const value = item.value as [number, number, number];
      return `${scenes[value[1]]} · ${years[value[0]]}年<br/>净现值：${fixed(value[2])} 百万元`;
    } },
    grid: { left: 72, right: 32, top: 24, bottom: 62, containLabel: true },
    xAxis: { type: "category", data: years, axisLabel: { interval: 4 }, splitArea: { show: true } },
    yAxis: { type: "category", data: scenes, splitArea: { show: true } },
    visualMap: {
      min: -absolute,
      max: absolute,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 4,
      inRange: { color: ["#C95C5C", "#F5F7FA", "#14A66F"] },
      text: ["可行", "承压"],
    },
    series: [{
      type: "heatmap",
      data: values,
      label: { show: false },
      emphasis: { itemStyle: { borderColor: chartColors.primary, borderWidth: 2 } },
      markLine: { silent: true, symbol: "none", data: [{ xAxis: String(selectedYear) }], lineStyle: { color: chartColors.primary, width: 1.5 } },
    }],
  };
}

export function maturityRadarOption(items: TechnologyMaturityResult[]): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const values = (item.value as number[] | undefined) ?? [];
        return [`<strong>成熟度</strong>`, ...items.map((entry, index) => `${entry.dimension_name}：${fixed(values[index])} 分`)].join("<br/>");
      },
    },
    radar: {
      center: ["50%", "48%"],
      radius: "58%",
      indicator: items.map((item) => ({ name: item.dimension_name, max: 100 })),
      axisName: { color: chartColors.uncertainty, fontSize: 12 },
      splitArea: { areaStyle: { color: ["rgba(37,99,235,.015)", "rgba(20,166,111,.035)"] } },
    },
    series: [{
      type: "radar",
      data: [{ name: "成熟度", value: items.map((item) => Number(item.score.toFixed(3))) }],
      lineStyle: { color: chartColors.psc, width: 2.4 },
      itemStyle: { color: chartColors.psc },
      areaStyle: { color: linearGradient("rgba(20,166,111,.30)", "rgba(43,174,209,.08)", true) },
    }],
  };
}

export function mcdaSceneOption(items: ProjectScenarioResult[]): EChartsOption {
  const ordered = [...items].sort((a, b) => a.mcda_scene_score - b.mcda_scene_score);
  return {
    tooltip: { trigger: "item", formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `<strong>${item.name}</strong><br/>综合优先级：${fixed(item.value)} 分`;
    } },
    grid: { left: 70, right: 72, top: 30, bottom: 70, containLabel: true },
    xAxis: { type: "value", name: "综合优先级（0—100）", min: 0, max: 100 },
    yAxis: { type: "category", data: ordered.map((item) => item.scene) },
    series: [{
      type: "bar",
      barMaxWidth: 28,
      data: ordered.map((item) => ({ value: Number(item.mcda_scene_score.toFixed(3)), itemStyle: { color: linearGradient("#A8D9F1", chartColors.primary) } })),
      label: { show: true, position: "right", formatter: (params) => fixed(params.value) },
    }],
  };
}

const projectTechnologyLabels = { cSi: "晶硅基准", PSC_C: "保守代际", PSC_T: "目标代际", PSC_A: "先进代际" } as const;
const projectTechnologyColors = { cSi: chartColors.csi, PSC_C: chartColors.pscConservative, PSC_T: chartColors.pscTarget, PSC_A: chartColors.pscAdvanced } as const;

export function technologyCarbonOption(items: ProjectSnapshot[], selectedTechnology: TechnologyCode): EChartsOption {
  const order: ProjectSnapshot["technology_generation"][] = ["cSi", "PSC_C", "PSC_T", "PSC_A"];
  const unique = order.flatMap((technology) => {
    const item = items.find((row) => row.technology_generation === technology);
    return item ? [item] : [];
  });
  return {
    tooltip: { trigger: "item", formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `<strong>${item.name}</strong><br/>生命周期碳强度：${fixed(item.value)} g CO₂-eq/kWh`;
    } },
    xAxis: { type: "category", data: unique.map((item) => projectTechnologyLabels[item.technology_generation]) },
    yAxis: { type: "value", name: "碳强度（g CO₂-eq/kWh）" },
    series: [{
      type: "bar",
      barMaxWidth: 46,
      data: unique.map((item) => {
        const selected = item.technology_generation === selectedTechnology;
        const color = projectTechnologyColors[item.technology_generation];
        return {
          value: Number(item.lifecycle_carbon_intensity_g_kwh.toFixed(3)),
          itemStyle: {
            color: linearGradient(`${color}66`, color, true),
            borderColor: selected ? chartColors.primary : color,
            borderWidth: selected ? 2 : 0,
          },
        };
      }),
      label: { show: true, position: "top", formatter: (params) => fixed(params.value) },
    }],
  };
}
