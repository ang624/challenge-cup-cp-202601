"use client";

import { useMemo } from "react";
import { ArrowRight, Database, MapPinned, Route, Zap } from "lucide-react";
import Link from "next/link";
import { AssetImage } from "@/components/common/asset-image";
import { DecisionInsight } from "@/components/common/decision-insight";
import { GateStack } from "@/components/common/gate-stack";
import { GlassPanel } from "@/components/common/glass-panel";
import { MetricStrip } from "@/components/common/metric-strip";
import { SectionHeading } from "@/components/common/page-header";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { DecisionChart } from "@/components/charts/decision-chart";
import { scenePriorityOption, scenarioTrajectoryOption } from "@/components/charts/chart-options";
import { YunnanMap } from "@/components/charts/yunnan-map";
import { usePlatform } from "@/contexts/platform-context";
import { compact, number, technologyLabels } from "@/lib/format";
import { buildStrategicWorkspace } from "@/lib/decision-model";

export function StrategicPage() {
  const { snapshot, selection, viewMode } = usePlatform();
  const workspace = useMemo(() => snapshot ? buildStrategicWorkspace(snapshot, selection) : null, [selection, snapshot]);
  const trajectories = useMemo(() => snapshot?.annualResults.filter((row) => row.region === selection.region && row.technology_generation === selection.technology && row.scene === selection.scene) ?? [], [selection, snapshot]);
  if (!snapshot || !workspace) return null;
  const assets = Object.fromEntries(snapshot.regionalAssets.map((item) => [item.asset_id, item]));
  const priority = workspace.scenePriorities[0];
  const currentInterval = Object.fromEntries(
    ["P10", "P50", "P90"].map((quantile) => [
      quantile,
      trajectories.find((row) => row.year === selection.year && row.development_scenario === selection.scenario && row.quantile === quantile)?.stock_capacity_mw,
    ]),
  );
  return <div className="page-stack">
    <GlassPanel className="hero-panel">
      <div className="hero-copy"><span>真实工程基准 · 地区推演 · 示范准入</span><h2>从读书铺出发，研判轻质钙钛矿进入交通场景的时机与条件</h2><p>连接工程基准、技术门槛与产业路径，形成分阶段示范决策。</p></div>
      <AssetImage src="/assets/dushupu-aerial-overview.png" alt="读书铺服务区现场航拍工程总览" className="hero-image" priority />
    </GlassPanel>
    <MetricStrip items={[
      { label: "未来产业方向", value: "交通场景轻质钙钛矿光伏", detail: technologyLabels[selection.technology], tone: "blue" },
      { label: "当前阶段", value: workspace.developmentWindow, detail: `目标年份 ${selection.year}`, tone: "cyan" },
      { label: "优先场景", value: priority?.scene ?? "—", detail: priority ? `${priority.metric} ${number(priority.value, 3)} MWp` : "等待结果", tone: "green" },
      { label: "推荐行动", value: workspace.recommendedAction, detail: selection.scenario, tone: "gold" },
    ]} />
    <DecisionInsight title={workspace.judgement} detail={workspace.judgementDetail} tone={workspace.annual.technical_gate_open ? "green" : "gold"} href="/cultivation" action="查看培育路径" />
    <div className="two-column strategic-grid">
      <GlassPanel><SectionHeading title="云南交通资产图谱" note="公开路网用于区域定位，业务规模读取审核数据库" /><div className="map-board"><YunnanMap researchMode={viewMode === "research"} height={430} /><div className="asset-facts">
        <span><MapPinned />空间规模</span><strong>{number(assets.YN_SERVICE_AREAS?.value_base ?? 0, 0)} 个</strong><small>高速公路服务区</small><strong>{number(assets.YN_EXPRESSWAY_KM?.value_base ?? 0, 0)} km</strong><small>高速公路通车里程</small>
        <span><Zap />发展基础</span><strong>{number(assets.YN_CHARGING_STATIONS?.value_base ?? 0, 0)} 座</strong><small>在线运营高速充电站</small><strong>{number(assets.YN_PV_PROJECTS_FILED?.value_base ?? 0, 0)} / {number(assets.YN_PV_PROJECTS_GRID?.value_base ?? 0, 0)} 个</strong><small>备案 / 并网项目</small>
      </div></div></GlassPanel>
      <div className="side-stack"><SectionHeading title="三级准入门" note="技术门先于经济门和治理门" /><GateStack gates={workspace.gates} /></div>
    </div>
    <div className="two-column chart-grid">
      <GlassPanel><SectionHeading title="四场景优先级" /><DecisionChart option={scenePriorityOption(workspace.scenePriorities)} ariaLabel="四类交通场景装机优先级" height={310} /></GlassPanel>
      <GlassPanel><SectionHeading title="三情景产业轨迹" note="主线为中位，带状区域为低位—高位" /><DecisionChart option={scenarioTrajectoryOption(trajectories, "stock_capacity_mw", selection.scenario, selection.quantile, selection.year)} ariaLabel="云南交通钙钛矿三情景存量装机轨迹" height={310} /></GlassPanel>
    </div>
    <ViewModeSection
      strategy={<GlassPanel className="action-board"><SectionHeading title="为什么得到这一判断" note="因果条件均来自当前筛选组合" /><div className="cause-list">{workspace.causes.map((cause, index) => <div key={cause}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{cause}</p></div>)}</div><div className="next-links"><Link href="/baseline"><Database />核查读书铺输入<ArrowRight /></Link><Link href="/yunnan"><Route />比较地区情景<ArrowRight /></Link><Link href="/cultivation"><MapPinned />形成示范决策<ArrowRight /></Link></div></GlassPanel>}
      research={<div className="two-column research-projection">
        <GlassPanel><SectionHeading title="当前结果区间" note={`${selection.year}年 · ${selection.scenario}`} /><dl className="decision-dl"><div><dt>低位</dt><dd>{currentInterval.P10 == null ? "—" : `${number(Number(currentInterval.P10), 3)} MWp`}</dd></div><div><dt>中位</dt><dd>{currentInterval.P50 == null ? "—" : `${number(Number(currentInterval.P50), 3)} MWp`}</dd></div><div><dt>高位</dt><dd>{currentInterval.P90 == null ? "—" : `${number(Number(currentInterval.P90), 3)} MWp`}</dd></div><div><dt>样本量</dt><dd>{compact(Number(snapshot.metadata.regional_sample_count ?? 0))}</dd></div></dl></GlassPanel>
        <GlassPanel><SectionHeading title="判断依据" /><div className="cause-list compact-causes">{workspace.causes.map((cause, index) => <div key={cause}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{cause}</p></div>)}</div></GlassPanel>
      </div>}
    />
  </div>;
}
