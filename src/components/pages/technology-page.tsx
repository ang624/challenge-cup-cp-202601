"use client";

import { useEffect, useRef, useState } from "react";
import type { EChartsOption } from "echarts";
import { ArrowRight, Cpu, Factory, Layers, ShieldCheck, X } from "lucide-react";
import { AssetImage } from "@/components/common/asset-image";
import { DataTable } from "@/components/common/data-table";
import { DecisionInsight } from "@/components/common/decision-insight";
import { GateStack } from "@/components/common/gate-stack";
import { GlassPanel } from "@/components/common/glass-panel";
import { SectionHeading } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { DecisionChart } from "@/components/charts/decision-chart";
import { maturityRadarOption, policyRadarOption } from "@/components/charts/chart-options";
import { chartColors, linearGradient } from "@/lib/chart-theme";
import { buildStrategicWorkspace } from "@/lib/decision-model";
import { usePlatform } from "@/contexts/platform-context";
import { quantileLabels, technologyLabels } from "@/lib/format";
import type { DataRecord, TrafficScene } from "@/types/data";

const tabs = ["方向识别", "技术代际", "场景适配", "政策组合"] as const;
type SpecificScene = Exclude<TrafficScene, "全部场景">;

const sceneCards: Array<{ name: string; scene: SpecificScene; value: string; constraint: string }> = [
  { name: "服务区屋顶", scene: "屋顶", value: "既有建筑优先验证", constraint: "承载、消防、检修通道" },
  { name: "停车棚/车棚", scene: "车棚", value: "光储充协同优先", constraint: "结构、车辆安全、施工组织" },
  { name: "公路边坡", scene: "边坡", value: "新增空间潜力较高", constraint: "地形、生态、维护与排水" },
  { name: "声屏障", scene: "声屏障", value: "未来扩展场景", constraint: "眩光、振动、噪声构造与运维" },
];

export function TechnologyPage() {
  const { snapshot, selection } = usePlatform();
  const [tab, setTab] = useState<(typeof tabs)[number]>("方向识别");
  const [activeScene, setActiveScene] = useState<SpecificScene | null>(null);
  const sceneTriggerRefs = useRef<Partial<Record<SpecificScene, HTMLButtonElement | null>>>({});

  useEffect(() => {
    if (!activeScene) return;
    const panel = document.getElementById("scene-admission-panel");
    if (!panel) return;
    const frame = window.requestAnimationFrame(() => {
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeScene]);

  const closeSceneAdmission = () => {
    const trigger = activeScene ? sceneTriggerRefs.current[activeScene] : null;
    setActiveScene(null);
    window.requestAnimationFrame(() => trigger?.focus());
  };
  if (!snapshot) return null;
  const selected = snapshot.technologies.find((item) => item.technology_generation === selection.technology)!;
  const gates = snapshot.technologyGateItems.filter((item) => item.technology_generation === selection.technology);
  const policy = snapshot.policyAnnualResults.filter(
    (item) =>
      item.development_scenario === selection.scenario &&
      item.technology_generation === selection.technology &&
      item.scene === selection.scene &&
      item.quantile === selection.quantile &&
      item.year === selection.year,
  );
  const maturity = snapshot.technologyMaturityResults.filter(
    (item) =>
      item.technology_generation === selection.technology &&
      item.scene === selection.scene &&
      item.development_scenario === selection.scenario &&
      item.year === selection.year &&
      item.quantile === selection.quantile,
  );
  const performance = snapshot.technologyPerformanceResults.find(
    (item) =>
      item.technology_generation === selection.technology &&
      item.scene === selection.scene &&
      item.development_scenario === selection.scenario &&
      item.year === selection.year &&
      item.quantile === selection.quantile,
  );
  const performanceValues = performance ? [
    Number((100 * performance.realized_efficiency_pct / selected.efficiency_pct).toFixed(3)),
    Number((100 * performance.realized_lifetime_years / selected.lifetime_years).toFixed(3)),
    Number((100 * selected.degradation_pct_year / performance.realized_degradation_pct_year).toFixed(3)),
  ] : [];
  const activeSceneCard = sceneCards.find((item) => item.scene === activeScene) ?? null;
  const activeSceneWorkspace = activeScene
    ? buildStrategicWorkspace(snapshot, { ...selection, scene: activeScene })
    : null;
  const generationOption: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: () => performance
        ? `可实现效率：${performance.realized_efficiency_pct.toFixed(3)}%<br/>可实现寿命：${performance.realized_lifetime_years.toFixed(3)}年<br/>预计衰减：${performance.realized_degradation_pct_year.toFixed(3)}%/年`
        : "暂无年度性能结果",
    },
    xAxis: { type: "category", data: ["效率实现度", "寿命实现度", "衰减控制度"] },
    yAxis: { type: "value", name: "目标实现度（%）", max: 110 },
    series: [
      {
        name: "年度可实现性能",
        type: "bar",
        data: performanceValues,
        barWidth: 34,
        label: { show: true, position: "top", formatter: (params) => `${Number(params.value).toFixed(3)}%` },
        itemStyle: { color: linearGradient("#A9DEC7", chartColors.psc, true) },
      },
    ],
  };
  return <div className="page-stack">
    <div className="tab-bar">{tabs.map((item) => <button type="button" className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
    {tab === "方向识别" ? <>
      <GlassPanel className="technology-intro"><div><span className="eyebrow">方向识别</span><h2>轻质化的战略价值在于解锁承载受限交通空间</h2><p>PSC的潜在优势不是脱离工程边界的效率比较，而是把低面密度、可制造形态和交通资产适配性转化为新增可开发面积。</p><div className="tech-principles"><span><Cpu />器件效率与稳定寿命</span><span><Layers />组件封装与轻质结构</span><span><Factory />制造成熟度与成本下降</span><span><ShieldCheck />认证、安全和回收责任</span></div></div><AssetImage src="/assets/traffic-scenes.png" alt="屋顶、车棚、边坡和声屏障四类交通光伏场景示意" className="technology-image" /></GlassPanel>
      <GlassPanel><SectionHeading title="候选方向比较" /><div className="comparison-grid">{[
        ["轻质PSC", "高", "高", "待提升", "交通增量空间"], ["柔性晶硅", "中高", "中", "较高", "轻质改造"], ["CIGS", "高", "中", "中", "曲面适配"], ["有机光伏", "高", "中", "较低", "弱光与柔性"], ["钙钛矿—晶硅叠层", "中", "很高", "中", "高效率增量"],
      ].map((row) => <article key={row[0]}><strong>{row[0]}</strong><dl><dt>轻质适配</dt><dd>{row[1]}</dd><dt>效率潜力</dt><dd>{row[2]}</dd><dt>产业成熟度</dt><dd>{row[3]}</dd></dl><span>{row[4]}</span></article>)}</div></GlassPanel>
    </> : null}
    {tab === "技术代际" ? <><div className="two-column chart-grid"><GlassPanel><SectionHeading title={`${selection.year}年年度性能实现度`} /><DecisionChart option={generationOption} ariaLabel="所选技术代际年度可实现性能" /></GlassPanel><GlassPanel><SectionHeading title={`${selection.year}年${technologyLabels[selection.technology]}技术—场景成熟度`} /><DecisionChart option={maturityRadarOption(maturity)} ariaLabel="所选技术代际年度场景成熟度" /></GlassPanel></div><GlassPanel><SectionHeading title={`${technologyLabels[selection.technology]}准入清单`} /><div className="gate-item-list">{gates.map((item) => <div key={item.gate_item_id}><span>{item.gate_dimension}</span><strong>{item.target_value_text}</strong><StatusBadge label={item.status === "PASS" ? "已满足" : "阶段目标"} tone={item.status === "PASS" ? "green" : "gold"} /></div>)}</div></GlassPanel><DecisionInsight title={selected.commercial_gate_year ? `商业准入目标年份为${selected.commercial_gate_year}年` : "当前代际未设置商业准入年份"} detail="效率、寿命、安全、认证和回收责任按技术门逐项判断，年度表现随当前筛选条件联动。" tone={selected.commercial_gate_year ? "blue" : "gold"} /></> : null}
    {tab === "场景适配" ? <><AssetImage src="/assets/traffic-scenes.png" alt="四类交通光伏场景示意" className="wide-scene-image" /><div className="scene-card-grid">{sceneCards.map((item) => {
      const expanded = activeScene === item.scene;
      return <article className={expanded ? "active" : ""} key={item.scene}><span>{item.name}</span><h3>{item.value}</h3><p>{item.constraint}</p><button ref={(element) => { sceneTriggerRefs.current[item.scene] = element; }} type="button" aria-controls="scene-admission-panel" aria-expanded={expanded} onClick={() => expanded ? closeSceneAdmission() : setActiveScene(item.scene)}>{expanded ? "收起准入条件" : "查看准入条件"}<ArrowRight /></button></article>;
    })}</div>{activeSceneCard && activeSceneWorkspace ? <GlassPanel className="scene-admission-panel" id="scene-admission-panel" tabIndex={-1} ariaLabel={`${activeSceneCard.name}准入条件`}><div className="scene-admission-heading"><div><span className="eyebrow">{activeSceneCard.name}</span><h2>{activeSceneCard.value}</h2><p>工程前置条件：{activeSceneCard.constraint}</p></div><button type="button" aria-label="关闭准入条件" onClick={closeSceneAdmission}><X /></button></div><div className="scene-admission-context"><span>{selection.year}年</span><span>{technologyLabels[selection.technology]}</span><span>{selection.scenario}</span><span>{quantileLabels[selection.quantile]}</span></div><GateStack gates={activeSceneWorkspace.gates} /></GlassPanel> : null}<DecisionInsight title="优先次序由技术门、经济吸引力和可开发上限共同决定" detail="轻质化只构成场景价值的一部分，不能替代结构安全、封装寿命、运维可达性和交通环境认证。" tone="green" /></> : null}
    {tab === "政策组合" ? <div className="two-column chart-grid"><GlassPanel><SectionHeading title={`${selection.year}年政策有效覆盖度`} /><DecisionChart option={policyRadarOption(policy)} ariaLabel="八维政策有效覆盖度雷达图" height={410} /></GlassPanel><GlassPanel><SectionHeading title="政策维度" /><DataTable name="政策组合" pageSize={8} rows={policy as unknown as DataRecord[]} columns={[{ key: "component_name", label: "政策维度" }, { key: "intensity", label: "有效覆盖度", format: (value) => `${(Number(value) * 100).toFixed(3)}%` }]} /></GlassPanel></div> : null}
    <ViewModeSection
      strategy={<DecisionInsight eyebrow="方向研判" title="轻质PSC的优先价值是拓展交通增量空间，而不是预设替代晶硅" detail="示范顺序由结构适配、技术硬门、项目经济性和交通环境治理条件共同决定。" tone="blue" />}
      research={<div className="research-projection"><GlassPanel><SectionHeading title="代际参数" note="技术代际与发展情景相互独立" /><DataTable name="技术代际参数" rows={snapshot.technologies as unknown as DataRecord[]} columns={[{ key: "display_name", label: "技术代际" }, { key: "efficiency_pct", label: "效率（%）", format: (value) => Number(value).toFixed(3) }, { key: "lifetime_years", label: "寿命（年）", format: (value) => Number(value).toFixed(3) }, { key: "degradation_pct_year", label: "年衰减（%）", format: (value) => Number(value).toFixed(3) }, { key: "commercial_gate_year", label: "准入目标年" }]} /></GlassPanel><GlassPanel><SectionHeading title="参数适用边界" /><p>三类技术代际分别采用17.5% / 22% / 25%的效率、10 / 20 / 25年的寿命及对应衰减率。SCAPS、PVsyst、MATLAB和LCA接口共用同一代际标识，政策组合不改变技术参数。</p></GlassPanel></div>}
    />
  </div>;
}
