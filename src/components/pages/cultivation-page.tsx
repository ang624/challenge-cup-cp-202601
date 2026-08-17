"use client";

import { ArrowDownToLine, BadgeCheck, Factory, FlaskConical, Recycle, Route, ShieldCheck, Wrench } from "lucide-react";
import { AssetImage } from "@/components/common/asset-image";
import { DataTable } from "@/components/common/data-table";
import { DecisionInsight } from "@/components/common/decision-insight";
import { GlassPanel } from "@/components/common/glass-panel";
import { SectionHeading } from "@/components/common/page-header";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { usePlatform } from "@/contexts/platform-context";
import { buildStrategicWorkspace } from "@/lib/decision-model";
import { downloadBlob, technologyLabels } from "@/lib/format";
import type { DataRecord } from "@/types/data";

const chain = [
  ["01", "材料", "稳定配方与含铅管理", FlaskConical], ["02", "器件", "效率与大面积一致性", BadgeCheck], ["03", "组件", "互联、封装与功率定型", Factory], ["04", "封装", "湿热、振动与碎片约束", ShieldCheck], ["05", "检测认证", "交通环境组合测试", BadgeCheck], ["06", "交通建设", "结构、消防与施工组织", Route], ["07", "运营维护", "监测、质保与保险", Wrench], ["08", "回收追溯", "责任主体与退役闭环", Recycle],
] as const;

export function CultivationPage() {
  const { snapshot, selection } = usePlatform();
  if (!snapshot) return null;
  const workspace = buildStrategicWorkspace(snapshot, selection);
  const exportPlan = () => {
    const body = [`# 示范培育决策单`, ``, `- 技术代际：${technologyLabels[selection.technology]}`, `- 目标年份：${selection.year}`, `- 交通场景：${selection.scene}`, `- 发展情景：${selection.scenario}`, `- 当前判断：${workspace.judgement}`, `- 推荐行动：${workspace.recommendedAction}`, ``, `## 阶段门`, ...snapshot.stageGates.map((stage) => `- ${stage.stage_name}（${stage.year_start}—${stage.year_end}）：${stage.output_action}`)].join("\r\n");
    downloadBlob("示范培育决策单.md", body, "text/markdown;charset=utf-8");
  };
  return <div className="page-stack">
    <GlassPanel className="cultivation-hero"><div><span className="eyebrow">从技术验证走向规模复制</span><h2>把培育路径转化为可进入、可监测、可退出的阶段门</h2><p>每一阶段明确目标、责任主体、交付成果和进入下一阶段的条件，避免把长期愿景直接等同于近期商业化。</p><button type="button" className="primary-button" onClick={exportPlan}><ArrowDownToLine />生成当前决策单</button></div><AssetImage src="/assets/cultivation-path.png" alt="钙钛矿光伏产业培育路径示意" className="cultivation-image" /></GlassPanel>
    <GlassPanel className="roadmap-panel"><SectionHeading title="三阶段培育路线" note="技术门、经济门、工程门和政策门同步管理" /><div className="roadmap">{snapshot.stageGates.map((stage, index) => {
      const active = selection.year >= stage.year_start && selection.year <= stage.year_end;
      return <article className={active ? "active" : ""} key={stage.stage_gate_id}><span>{String(index + 1).padStart(2, "0")}</span><small>{stage.year_start}—{stage.year_end}</small><h3>{stage.stage_name}</h3><p>{stage.required_condition}</p><strong>{stage.output_action}</strong><footer>{stage.responsible_party}</footer></article>;
    })}</div></GlassPanel>
    <ViewModeSection
      strategy={<div className="research-projection"><DecisionInsight title={workspace.judgement} detail={`当前推荐行动：${workspace.recommendedAction}。若任一技术硬门未满足，则维持验证规模并延后商业扩散。`} tone={workspace.annual.technical_gate_open ? "green" : "gold"} /><div className="two-column"><GlassPanel><SectionHeading title="进入下一阶段" /><dl className="action-sheet">{Object.entries(workspace.actions).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></GlassPanel><GlassPanel><SectionHeading title="退出与延后机制" /><div className="exit-strategy"><ShieldCheck /><h3>技术硬门不被补贴覆盖</h3><p>安全、寿命、衰减、认证或回收责任不满足时，经济补贴不得把方案改判为可商业化；项目回到验证阶段补齐证据。</p></div></GlassPanel></div></div>}
      research={<div className="research-projection"><GlassPanel><SectionHeading title="八环节产业链" note="从材料到回收追溯的责任闭环" /><div className="chain-grid">{chain.map(([index, name, note, Icon]) => <article key={index}><span>{index}</span><Icon /><h3>{name}</h3><p>{note}</p></article>)}</div></GlassPanel><GlassPanel><SectionHeading title="阶段门原始记录" note="进入条件、责任主体和交付动作均读取V4" /><DataTable name="示范培育阶段门" rows={snapshot.stageGates as unknown as DataRecord[]} columns={[{ key: "stage_name", label: "阶段" }, { key: "year_start", label: "起始年" }, { key: "year_end", label: "结束年" }, { key: "gate_type", label: "阶段门类型" }, { key: "required_condition", label: "进入条件" }, { key: "output_action", label: "交付动作" }, { key: "responsible_party", label: "责任主体" }, { key: "status", label: "状态" }]} /></GlassPanel><GlassPanel className="research-note"><strong>政策与证据边界</strong><p>路线图读取V4阶段门表；前端仅组合已发布行动，不生成新的准入年份、责任主体或补贴金额。未核实补贴保持为0，技术硬门不由政策现金支持覆盖。</p></GlassPanel></div>}
    />
  </div>;
}
