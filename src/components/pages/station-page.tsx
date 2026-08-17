"use client";

import { BatteryCharging, CircleDollarSign, Factory, Leaf, SunMedium } from "lucide-react";
import { AssetImage } from "@/components/common/asset-image";
import { DataTable } from "@/components/common/data-table";
import { DecisionInsight } from "@/components/common/decision-insight";
import { GlassPanel } from "@/components/common/glass-panel";
import { MetricStrip } from "@/components/common/metric-strip";
import { SectionHeading } from "@/components/common/page-header";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { DecisionChart } from "@/components/charts/decision-chart";
import {
  economicFrontierOption,
  lifecycleCarbonOption,
  mcdaSceneOption,
  npvHeatmapOption,
  stationEconomicOption,
  storageSynergyOption,
} from "@/components/charts/chart-options";
import { usePlatform } from "@/contexts/platform-context";
import { number, technologyLabels } from "@/lib/format";
import type { DataRecord, ProjectScenarioResult } from "@/types/data";


export function StationPage() {
  const { snapshot, selection } = usePlatform();
  if (!snapshot) return null;

  const rows = snapshot.projectScenarioResults.filter(
    (item) =>
      item.year === selection.year &&
      item.technology_generation === selection.technology &&
      item.development_scenario === selection.scenario &&
      item.quantile === selection.quantile &&
      (selection.scene === "全部场景" || item.scene === selection.scene),
  );
  const evolutionRows = snapshot.projectScenarioResults.filter(
    (item) =>
      item.technology_generation === selection.technology &&
      item.development_scenario === selection.scenario &&
      item.quantile === selection.quantile &&
      (selection.scene === "全部场景" || item.scene === selection.scene),
  );
  const anchorRows = snapshot.projectSnapshots.filter(
    (item) =>
      item.target_year === 2030 &&
      item.technology_generation === selection.technology &&
      (selection.scene === "全部场景" || item.scene === selection.scene),
  );
  const best = rows.reduce<ProjectScenarioResult | null>(
    (value, item) => (!value || item.npv_cny > value.npv_cny ? item : value),
    null,
  );
  const facts = Object.fromEntries(snapshot.projectFacts.map((item) => [item.fact_id, item]));
  const allNegative = rows.length > 0 && rows.every((item) => item.npv_cny < 0);
  const gateOpen = Boolean(best?.technical_gate_open);

  return <div className="page-stack">
    <GlassPanel className="station-hero"><div><span className="eyebrow">项目级决策底座</span><h2>光伏—储能—负荷—经济—碳排放统一核算</h2><p>以2030年审核结果为锚点，按同一工程边界比较2025—2060年技术经济与生命周期结果。</p><div className="system-chain"><span><SunMedium />光伏</span><i>→</i><span><BatteryCharging />储能</span><i>→</i><span><Factory />交通负荷</span><i>→</i><span><CircleDollarSign />经济</span><i>→</i><span><Leaf />碳效益</span></div></div><AssetImage src="/assets/station-system.png" alt="高速服务区光伏储能充电系统技术示意" className="station-image" /></GlassPanel>
    <MetricStrip items={[
      { label: "晶硅工程基准", value: `${number(facts.DSP_DC_CAPACITY?.value_num ?? 0, 3)} kWp`, tone: "blue" },
      { label: "当前分析年份", value: `${selection.year}年`, detail: selection.scenario, tone: "cyan" },
      { label: "当前技术代际", value: technologyLabels[selection.technology], detail: selection.scene, tone: "green" },
      { label: "最优场景净现值", value: best ? `${number(best.npv_cny / 1e6, 3)} 百万元` : "暂无记录", detail: best?.scene, tone: best && best.npv_cny >= 0 ? "green" : "gold" },
    ]} />
    <ViewModeSection
      strategy={<div className="decision-row"><GlassPanel><SectionHeading title="当前关键输出" /><dl className="decision-dl"><div><dt>发电</dt><dd>{best ? `${number(best.annual_pv_kwh / 1e6, 3)} GWh/年` : "—"}</dd></div><div><dt>平准化度电成本</dt><dd>{best ? `${number(best.lcoe_cny_kwh, 3)} 元/kWh` : "—"}</dd></div><div><dt>储能自给率</dt><dd>{best ? `${number(best.storage_self_sufficiency_pct, 3)}%` : "—"}</dd></div><div><dt>初始投资</dt><dd>{best ? `${number(best.initial_capex_cny / 1e6, 3)} 百万元` : "—"}</dd></div></dl></GlassPanel><DecisionInsight title={!gateOpen ? "经济结果可计算，但技术门尚未放行" : best && best.npv_cny >= 0 ? `${best.scene}达到经济可行条件` : "技术已准入，项目经济门槛仍需收敛"} detail={allNegative ? `在${selection.year}年、${selection.scenario}和${selection.quantile}条件下，当前组合净现值仍为负。成本学习、寿命、衰减、融资和场景工程费共同决定后续转正年份。` : "净现值转正仅表示当前组合的经济门槛闭合，示范仍需通过安全、认证和治理条件。"} tone={gateOpen && best && best.npv_cny >= 0 ? "green" : "gold"} /></div>}
      research={rows.length ? <div className="research-projection">
        <div className="two-column chart-grid">
          <GlassPanel><SectionHeading title={`${selection.year}年四场景净现值`} /><DecisionChart option={stationEconomicOption(rows)} ariaLabel="所选年份四类交通场景净现值比较" height={350} /></GlassPanel>
          <GlassPanel><SectionHeading title="生命周期碳强度" note="并网点1 kWh交流电" /><DecisionChart option={lifecycleCarbonOption(rows)} ariaLabel="所选年份四类交通场景生命周期碳强度" height={350} /></GlassPanel>
        </div>
        <div className="two-column chart-grid">
          <GlassPanel><SectionHeading title="净现值—度电成本前沿" /><DecisionChart option={economicFrontierOption(rows)} ariaLabel="四类交通场景经济性散点图" height={350} /></GlassPanel>
          <GlassPanel><SectionHeading title="储能协同" note="500 kW / 1165 kWh边界" /><DecisionChart option={storageSynergyOption(rows)} ariaLabel="四类交通场景储能自给率与吞吐量" height={350} /></GlassPanel>
        </div>
        <div className="two-column chart-grid">
          <GlassPanel><SectionHeading title="2025—2060年净现值演化" /><DecisionChart option={npvHeatmapOption(evolutionRows, selection.year)} ariaLabel="四类交通场景净现值年度热力图" height={360} /></GlassPanel>
          <GlassPanel><SectionHeading title="场景综合优先级" /><DecisionChart option={mcdaSceneOption(rows)} ariaLabel="四类交通场景多准则优先级" height={360} /></GlassPanel>
        </div>
        <GlassPanel><SectionHeading title="年度结果明细" /><DataTable name="年度结果明细" rows={rows as unknown as DataRecord[]} columns={[
          { key: "scene", label: "交通场景" },
          { key: "npv_cny", label: "净现值（百万元）", format: (value) => number(Number(value) / 1e6, 3) },
          { key: "lcoe_cny_kwh", label: "度电成本（元/kWh）", format: (value) => number(Number(value), 3) },
          { key: "module_price_cny_w", label: "组件情景价（元/W）", format: (value) => number(Number(value), 3) },
          { key: "lifecycle_carbon_intensity_g_kwh", label: "碳强度（g CO₂-eq/kWh）", format: (value) => number(Number(value), 3) },
        ]} /></GlassPanel>
        <GlassPanel><SectionHeading title="2030年基准结果" /><DataTable name="2030年项目级基准结果" rows={anchorRows as unknown as DataRecord[]} columns={[
          { key: "scene", label: "交通场景" },
          { key: "npv_cny", label: "净现值（百万元）", format: (value) => number(Number(value) / 1e6, 3) },
          { key: "lcoe_cny_kwh", label: "度电成本（元/kWh）", format: (value) => number(Number(value), 3) },
        ]} /></GlassPanel>
      </div> : <GlassPanel className="empty-panel"><strong>当前组合没有可用结果</strong><p>页面不会以0替代缺失记录。</p></GlassPanel>}
    />
  </div>;
}
