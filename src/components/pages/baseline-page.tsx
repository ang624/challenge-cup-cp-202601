"use client";

import type { EChartsOption } from "echarts";
import { Database, FileCheck2, Gauge, Layers3 } from "lucide-react";
import { AssetImage } from "@/components/common/asset-image";
import { DataTable } from "@/components/common/data-table";
import { DecisionInsight } from "@/components/common/decision-insight";
import { GlassPanel } from "@/components/common/glass-panel";
import { MetricStrip } from "@/components/common/metric-strip";
import { SectionHeading } from "@/components/common/page-header";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { DecisionChart } from "@/components/charts/decision-chart";
import { chartColors, linearGradient } from "@/lib/chart-theme";
import { usePlatform } from "@/contexts/platform-context";
import { number } from "@/lib/format";
import type { DataRecord } from "@/types/data";

export function BaselinePage() {
  const { snapshot } = usePlatform();
  if (!snapshot) return null;
  const facts = Object.fromEntries(snapshot.projectFacts.map((item) => [item.fact_id, item]));
  const scenes = [facts.DSP_ROOF_MODULES, facts.DSP_CANOPY_MODULES, facts.DSP_SLOPE_MODULES].filter(Boolean);
  const sceneOption: EChartsOption = {
    tooltip: { trigger: "item", formatter: (params) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `<strong>${item.name}</strong><br/>组件数量：${Number(item.value).toFixed(0)} 块`;
    } },
    grid: { left: 46, right: 24, top: 28, bottom: 42, containLabel: true },
    xAxis: { type: "category", data: scenes.map((item) => item.label_zh), name: "现状场景" },
    yAxis: { type: "value", name: "组件数量（块）" },
    series: [{ type: "bar", barMaxWidth: 46, data: scenes.map((item, index) => ({ value: item.value_num, itemStyle: { color: linearGradient([chartColors.csi, chartColors.bess, chartColors.psc][index] + "88", [chartColors.csi, chartColors.bess, chartColors.psc][index], true) } })), label: { show: true, position: "top", formatter: (params) => `${Number(params.value).toFixed(0)} 块` } }],
  };
  return <div className="page-stack">
    <GlassPanel className="baseline-hero"><div><span className="eyebrow">现实晶硅光储充基准</span><h2>设备台账与月度能源汇总共同限定比较口径</h2><p>3384块580 W组件形成1962.72 kWp直流装机，现场逆变器、储能和年度负荷作为单站模型的工程约束。</p><div className="evidence-pills"><span><Database />现场设备台账</span><span><FileCheck2 />现场月度汇总</span><span><Gauge />模型边界已冻结</span></div></div><AssetImage src="/assets/dushupu-aerial-detail.png" alt="读书铺服务区边坡光伏与车棚场景航拍" className="baseline-image" priority /></GlassPanel>
    <MetricStrip items={[
      { label: "直流装机容量", value: `${number(facts.DSP_DC_CAPACITY.value_num ?? 0, 2)} kWp`, detail: `${number(facts.DSP_MODULE_COUNT.value_num ?? 0, 0)} 块 × ${number(facts.DSP_MODULE_POWER.value_num ?? 0, 0)} W`, tone: "blue" },
      { label: "逆变器交流容量", value: `${number(facts.DSP_AC_CAPACITY.value_num ?? 0, 0)} kW`, detail: `${number(facts.DSP_INVERTER_COUNT.value_num ?? 0, 0)} 台`, tone: "cyan" },
      { label: "储能配置", value: `${number(facts.DSP_BESS_POWER.value_num ?? 0, 0)} kW / ${number(facts.DSP_BESS_ENERGY.value_num ?? 0, 0)} kWh`, detail: "现场设备台账", tone: "green" },
      { label: "年度用电量", value: `${number(facts.DSP_ANNUAL_LOAD.value_num ?? 0, 0)} kWh`, detail: `充电量 ${number(facts.DSP_ANNUAL_CHARGING.value_num ?? 0, 0)} kWh`, tone: "gold" },
    ]} />
    <div className="two-column chart-grid"><GlassPanel><SectionHeading title="三类现状场景" note="组件数量严格闭合3384块" /><DecisionChart option={sceneOption} height={330} ariaLabel="读书铺服务区三类现状场景组件数量" /></GlassPanel><GlassPanel><SectionHeading title="数据如何进入模型" note="工程事实、情景输入和模型输出分层" /><div className="evidence-flow"><div><span>01</span><Layers3 /><strong>设备与容量</strong><p>组件、逆变器、储能和场景分区形成工程边界。</p></div><div><span>02</span><Database /><strong>能源统计</strong><p>年度负荷、充电量和计量口径约束代表序列。</p></div><div><span>03</span><Gauge /><strong>模型桥接</strong><p>同容量、同面积与扩展空间分别进入PSC情景。</p></div></div></GlassPanel></div>
    <ViewModeSection
      strategy={<DecisionInsight eyebrow="基准结论" title="读书铺提供可核验的比较边界，而不是把未来PSC情景写成现场实证" detail="地区级模型只接收审核后的单站容量、经济概率、单位投资和碳减排结果；工程数据与未来情景在数据身份上保持分离。" tone="blue" />}
      research={<div className="research-projection"><GlassPanel><SectionHeading title="工程事实明细" /><DataTable name="读书铺工程事实" rows={snapshot.projectFacts as unknown as DataRecord[]} columns={[{ key: "fact_group", label: "数据类别" }, { key: "label_zh", label: "指标名称" }, { key: "value_num", label: "数值", format: (value) => typeof value === "number" ? number(value, 3) : "—" }, { key: "unit", label: "单位" }, { key: "metering_scope", label: "计量范围" }, { key: "applicability", label: "适用边界" }]} /></GlassPanel><GlassPanel><SectionHeading title="项目参数进入模型的边界" /><p>设备数量与容量进入工程约束；年度负荷进入单站能量平衡；经济可行概率、单位投资和碳指标由项目级结果传递至地区模型。</p></GlassPanel></div>}
    />
  </div>;
}
