"use client";

import { useMemo, useState } from "react";
import { DecisionInsight } from "@/components/common/decision-insight";
import { DataTable } from "@/components/common/data-table";
import { GlassPanel } from "@/components/common/glass-panel";
import { MetricStrip } from "@/components/common/metric-strip";
import { SectionHeading } from "@/components/common/page-header";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { DecisionChart } from "@/components/charts/decision-chart";
import { scenarioTrajectoryOption } from "@/components/charts/chart-options";
import { YunnanMap } from "@/components/charts/yunnan-map";
import { usePlatform } from "@/contexts/platform-context";
import { number, quantileLabels, technologyLabels } from "@/lib/format";
import type { AnnualResult, DataRecord } from "@/types/data";

const metrics = {
  stock_capacity_mw: "存量装机",
  generation_gwh: "年度发电量",
  investment_million_cny: "年度投资",
} as const;
type MetricKey = keyof typeof metrics;

export function YunnanPage() {
  const { snapshot, selection, viewMode } = usePlatform();
  const [metric, setMetric] = useState<MetricKey>("stock_capacity_mw");
  const results = useMemo(() => snapshot?.annualResults.filter((row) => row.region === selection.region && row.technology_generation === selection.technology && row.scene === selection.scene) ?? [], [selection, snapshot]);
  if (!snapshot) return null;
  const current = results.find((row) => row.year === selection.year && row.development_scenario === selection.scenario && row.quantile === selection.quantile) as AnnualResult | undefined;
  const currentInterval = results.filter((row) => row.year === selection.year && row.development_scenario === selection.scenario);
  const assets = Object.fromEntries(snapshot.regionalAssets.map((item) => [item.asset_id, item]));
  return <div className="page-stack">
    <div className="regional-layout">
      <GlassPanel><SectionHeading title="云南交通资产与公开路网" note="地图表达道路几何，不代表PSC项目选址" /><YunnanMap researchMode={viewMode === "research"} height={500} /></GlassPanel>
      <GlassPanel className="regional-summary"><span className="eyebrow">当前组合</span><h2>{technologyLabels[selection.technology]} · {selection.scenario}</h2><p>{selection.year}年 · {selection.scene} · {quantileLabels[selection.quantile]}</p><dl><div><dt>服务区规模</dt><dd>{number(assets.YN_SERVICE_AREAS?.value_base ?? 0, 0)}个</dd></div><div><dt>高速里程</dt><dd>{number(assets.YN_EXPRESSWAY_KM?.value_base ?? 0, 0)} km</dd></div><div><dt>光伏备案 / 并网</dt><dd>{number(assets.YN_PV_PROJECTS_FILED?.value_base ?? 0, 0)} / {number(assets.YN_PV_PROJECTS_GRID?.value_base ?? 0, 0)}个</dd></div><div><dt>充电站</dt><dd>{number(assets.YN_CHARGING_STATIONS?.value_base ?? 0, 0)}座</dd></div></dl></GlassPanel>
    </div>
    <MetricStrip items={[
      { label: "技术准入", value: current?.technical_gate_open ? "已开启" : "尚未开启", detail: current?.technical_gate_open ? "进入商业扩散判断" : "商业新增保持为零", tone: current?.technical_gate_open ? "green" : "gold" },
      { label: "存量装机", value: current ? `${number(current.stock_capacity_mw, 3)} MWp` : "暂无记录", detail: quantileLabels[selection.quantile], tone: "blue" },
      { label: "年度发电量", value: current ? `${number(current.generation_gwh, 3)} GWh` : "暂无记录", detail: selection.scene, tone: "cyan" },
      { label: "生命周期净减排", value: current ? `${number(current.net_lifecycle_reduction_kt, 3)} kt` : "暂无记录", detail: "与避免排放分列", tone: "green" },
    ]} />
    <GlassPanel><div className="chart-title-row"><SectionHeading title="2025—2060三情景产业演化" note="同一技术代际下比较三种发展环境" /><div className="segmented">{Object.entries(metrics).map(([key, label]) => <button type="button" className={metric === key ? "active" : ""} onClick={() => setMetric(key as MetricKey)} key={key}>{label}</button>)}</div></div><DecisionChart option={scenarioTrajectoryOption(results, metric, selection.scenario, selection.quantile, selection.year)} ariaLabel="云南交通钙钛矿三情景产业演化曲线" height={430} /></GlassPanel>
    <ViewModeSection
      strategy={<div className="two-column"><GlassPanel><SectionHeading title="受约束存量—流量逻辑" /><ol className="model-steps"><li><strong>物理上限</strong><span>交通资产规模、适宜率和功率密度共同约束。</span></li><li><strong>技术硬门</strong><span>未准入时商业新增严格为零。</span></li><li><strong>经济吸引力</strong><span>读取单站NPV为正的概率，不由前端推算。</span></li><li><strong>新增与退役</strong><span>供货、可达上限、扩散率和寿命队列共同作用。</span></li></ol></GlassPanel><DecisionInsight title={current?.technical_gate_open ? "当前结果用于比较不同发展条件下的容量与节奏" : "准入前零值是技术门的模型结果，不是数据缺失"} detail="三种发展环境只改变市场、需求、融资和政策条件；切换发展环境不会改变效率、寿命和衰减参数。" tone={current?.technical_gate_open ? "blue" : "gold"} /></div>}
      research={<div className="research-projection"><GlassPanel><SectionHeading title="当前年度分位结果" note={`${selection.year}年 · ${selection.scenario}`} /><DataTable name="地区年度分位结果" rows={currentInterval as unknown as DataRecord[]} columns={[{ key: "quantile", label: "结果区间", format: (value) => quantileLabels[String(value) as keyof typeof quantileLabels] ?? String(value) }, { key: "stock_capacity_mw", label: "存量装机（MWp）", format: (value) => number(Number(value), 3) }, { key: "new_capacity_mw", label: "年度新增（MWp）", format: (value) => number(Number(value), 3) }, { key: "retired_capacity_mw", label: "年度退役（MWp）", format: (value) => number(Number(value), 3) }, { key: "generation_gwh", label: "发电量（GWh）", format: (value) => number(Number(value), 3) }, { key: "investment_million_cny", label: "年度投资（百万元）", format: (value) => number(Number(value), 3) }]} /></GlassPanel>{current ? <GlassPanel><SectionHeading title="空间解释边界" /><p>公开路网用于区域定位，不代表项目选址或示范优先级。</p></GlassPanel> : null}</div>}
    />
  </div>;
}
