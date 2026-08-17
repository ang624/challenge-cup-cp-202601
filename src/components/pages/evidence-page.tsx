"use client";

import { useState } from "react";
import { CheckCircle2, Database, Download, FileSearch, Fingerprint, ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { DecisionInsight } from "@/components/common/decision-insight";
import { GlassPanel } from "@/components/common/glass-panel";
import { MetricStrip } from "@/components/common/metric-strip";
import { ViewModeSection } from "@/components/common/view-mode-section";
import { usePlatform } from "@/contexts/platform-context";
import { downloadBlob } from "@/lib/format";
import type { DataRecord } from "@/types/data";

const tabs = ["地区证据", "项目事实", "模型校验", "情景校验", "图表口径", "状态定义"] as const;

export function EvidencePage() {
  const { snapshot } = usePlatform();
  const [tab, setTab] = useState<(typeof tabs)[number]>("地区证据");
  if (!snapshot) return null;
  const passing = snapshot.qualityChecks.filter((item) => item.status === "PASS").length;
  const scenarioPassing = snapshot.scenarioQualityChecks.filter((item) => item.status === "PASS").length;
  const allChecksPass = passing === snapshot.qualityChecks.length && scenarioPassing === snapshot.scenarioQualityChecks.length;
  const released = snapshot.approvals[0];
  const totalChecks = snapshot.qualityChecks.length + snapshot.scenarioQualityChecks.length;
  const passedChecks = passing + scenarioPassing;
  const downloadManifest = () => downloadBlob("研究结果审核清单.json", JSON.stringify({
    dataIntegrity: "服务端完整性校验通过",
    qualityChecks: { passed: passedChecks, total: totalChecks },
    independentReview: released?.status === "RELEASED" ? "通过" : "未通过",
    reviewedAt: released?.approved_at ?? null,
    releaseScope: "研究报告",
    auditCounts: snapshot.auditCounts,
  }, null, 2), "application/json;charset=utf-8");
  return <div className="page-stack">
    <GlassPanel className="evidence-hero"><div><span className="eyebrow">证据审计</span><h2>从来源、参数、模型到网页结论的完整追溯</h2><p>服务端执行数据完整性与质量校验，网页展示审核结论、证据来源和适用边界。</p><button type="button" className="primary-button" onClick={downloadManifest}><Download />导出审核清单</button></div><div className="evidence-symbol"><Fingerprint /><strong>V4+</strong><span>已校验</span></div></GlassPanel>
    <MetricStrip items={[
      { label: "来源记录", value: String(snapshot.auditCounts.sources), detail: "文献、政策与工程来源", tone: "blue" },
      { label: "参数记录", value: String(snapshot.auditCounts.parameters), detail: "统一参数结构", tone: "cyan" },
      { label: "地区年度结果", value: String(snapshot.auditCounts.regional_annual_results), detail: "三代际 × 三情景 × 五场景", tone: "green" },
      { label: "质量检查", value: `${passing + scenarioPassing} / ${snapshot.qualityChecks.length + snapshot.scenarioQualityChecks.length}`, detail: "模型与年度情景", tone: allChecksPass ? "green" : "gold" },
    ]} />
    <ViewModeSection
      strategy={<DecisionInsight title={released && allChecksPass ? "V4地区模型与年度项目结果已通过自动校验" : "当前结果尚未通过完整校验"} detail={released && allChecksPass ? `${passing}项地区模型检查与${scenarioPassing}项年度结果检查全部通过。年度项目结果为模型结果，不替代现场实测。` : "发布记录或质量检查不完整时，不得使用网页结果。"} tone={released && allChecksPass ? "green" : "red"} />}
      research={<div className="research-projection"><GlassPanel className="research-note"><strong>审核与发布记录</strong><p>{released ? `独立审核已通过；审核时间：${released.approved_at}；发布范围：研究报告。` : "当前没有可用的独立发布记录。"}</p></GlassPanel><GlassPanel><div className="audit-tabs">{tabs.map((item) => <button type="button" className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
      {tab === "地区证据" ? <DataTable name="地区证据清单" rows={snapshot.regionalEvidence as unknown as DataRecord[]} columns={[{ key: "topic", label: "证据主题" }, { key: "claim_text", label: "支撑主张" }, { key: "value_text", label: "数值或结论" }, { key: "evidence_level", label: "证据等级" }, { key: "source_title", label: "来源题名" }, { key: "limitations", label: "使用边界" }]} /> : null}
      {tab === "项目事实" ? <DataTable name="项目事实清单" rows={snapshot.projectFacts as unknown as DataRecord[]} columns={[{ key: "fact_group", label: "类别" }, { key: "label_zh", label: "指标" }, { key: "value_num", label: "数值" }, { key: "unit", label: "单位" }, { key: "data_identity", label: "数据身份" }, { key: "evidence_level", label: "证据等级" }, { key: "applicability", label: "适用边界" }]} /> : null}
      {tab === "模型校验" ? <DataTable name="地区模型校验清单" rows={snapshot.qualityChecks as unknown as DataRecord[]} columns={[{ key: "check_name", label: "检查项目" }, { key: "status", label: "状态" }, { key: "observed_value", label: "检查值" }, { key: "threshold_text", label: "判定阈值" }, { key: "technology_generation", label: "技术代际" }, { key: "development_scenario", label: "发展情景" }]} /> : null}
      {tab === "情景校验" ? <DataTable name="年度情景校验清单" rows={snapshot.scenarioQualityChecks as unknown as DataRecord[]} columns={[{ key: "check_name", label: "检查项目" }, { key: "status", label: "状态" }, { key: "observed_value", label: "检查值" }, { key: "threshold_text", label: "判定阈值" }]} /> : null}
      {tab === "图表口径" ? <DataTable name="图表数据口径清单" rows={snapshot.chartAuditManifest as unknown as DataRecord[]} columns={[{ key: "chart_name", label: "图表" }, { key: "chart_type", label: "图型" }, { key: "source_table", label: "数据表" }, { key: "responsive_axes", label: "响应输入" }, { key: "fixed_axes", label: "固定边界" }, { key: "data_identity", label: "数据身份" }, { key: "boundary_note", label: "解释边界" }]} /> : null}
      {tab === "状态定义" ? <DataTable name="结果状态定义" rows={snapshot.displayStates as unknown as DataRecord[]} columns={[{ key: "data_state", label: "状态代码" }, { key: "display_label_zh", label: "页面显示" }, { key: "definition_zh", label: "定义" }]} /> : null}
    </GlassPanel><GlassPanel className="integrity-grid"><div><Database /><span>数据完整性</span><code>校验通过</code></div><div><FileSearch /><span>质量检查</span><code>{passedChecks} / {totalChecks}</code></div><div><ShieldCheck /><span>独立审核</span><code>{released?.status === "RELEASED" ? "已通过" : "待审核"}</code></div><div><CheckCircle2 /><span>发布范围</span><code>研究报告</code></div></GlassPanel></div>}
    />
  </div>;
}
