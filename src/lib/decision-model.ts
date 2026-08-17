import type {
  AnnualResult,
  DataState,
  DecisionGate,
  PlatformSnapshot,
  ProjectScenarioResult,
  ScenarioSelection,
  ScenePriority,
  StageGate,
  StrategicWorkspace,
  TrafficScene,
} from "@/types/data";

const SCENES: Array<Exclude<TrafficScene, "全部场景">> = ["屋顶", "车棚", "边坡", "声屏障"];

function uniqueAnnual(snapshot: PlatformSnapshot, selection: ScenarioSelection, scene = selection.scene): AnnualResult {
  const matches = snapshot.annualResults.filter(
    (item) =>
      item.region === selection.region &&
      item.technology_generation === selection.technology &&
      item.development_scenario === selection.scenario &&
      item.scene === scene &&
      item.year === selection.year &&
      item.quantile === selection.quantile,
  );
  if (matches.length !== 1) {
    throw new Error(`地区结果不唯一：${selection.technology}/${selection.scenario}/${scene}/${selection.year}/${selection.quantile}`);
  }
  return matches[0];
}

function currentStage(stages: StageGate[], year: number): StageGate | null {
  return (
    stages.find((stage) => stage.year_start <= year && stage.year_end >= year) ??
    stages.find((stage) => stage.year_start > year) ??
    stages.at(-1) ??
    null
  );
}

function bestProjectScenario(
  snapshot: PlatformSnapshot,
  selection: ScenarioSelection,
  year = selection.year,
): ProjectScenarioResult | null {
  const candidates = snapshot.projectScenarioResults.filter(
    (item) =>
      item.year === year &&
      item.technology_generation === selection.technology &&
      item.development_scenario === selection.scenario &&
      item.quantile === selection.quantile &&
      (selection.scene === "全部场景" || item.scene === selection.scene),
  );
  return candidates.reduce<ProjectScenarioResult | null>(
    (best, item) => (!best || item.npv_cny > best.npv_cny ? item : best),
    null,
  );
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function buildScenePriorities(
  snapshot: PlatformSnapshot,
  selection: ScenarioSelection,
  gateOpen: boolean,
): ScenePriority[] {
  return SCENES.map((scene) => {
    const row = uniqueAnnual(snapshot, selection, scene);
    return {
      scene,
      value: gateOpen ? row.stock_capacity_mw : row.accessible_ceiling_mw,
      metric: gateOpen ? "存量装机" : "准入前可开发上限",
      economicAttractiveness: row.economic_attractiveness,
    };
  }).sort((a, b) => b.value - a.value);
}

export function buildStrategicWorkspace(
  snapshot: PlatformSnapshot,
  selection: ScenarioSelection,
): StrategicWorkspace {
  const annual = uniqueAnnual(snapshot, selection);
  const technology = snapshot.technologies.find((item) => item.technology_generation === selection.technology);
  if (!technology) throw new Error(`未知技术代际：${selection.technology}`);

  const gateOpen = Boolean(annual.technical_gate_open);
  const stage = currentStage(snapshot.stageGates, selection.year);
  const developmentWindow = stage
    ? `${stage.stage_name}（${stage.year_start}—${stage.year_end}）`
    : "阶段门待定义";
  const recommendedAction = stage?.output_action ?? "补充阶段门条件";
  const bestSnapshot = bestProjectScenario(snapshot, selection);
  const baselineProject = bestProjectScenario(snapshot, selection, 2025);
  const maturity = snapshot.technologyMaturityResults.filter(
    (item) =>
      item.year === selection.year &&
      item.technology_generation === selection.technology &&
      item.scene === selection.scene &&
      item.development_scenario === selection.scenario &&
      item.quantile === selection.quantile,
  );
  const maturityScore = maturity.length
    ? maturity.reduce((sum, item) => sum + item.score, 0) / maturity.length
    : null;
  const policyDefinitions = snapshot.policyComponents.filter((item) => item.development_scenario === selection.scenario);
  const policy = snapshot.policyAnnualResults.filter(
    (item) =>
      item.development_scenario === selection.scenario &&
      item.technology_generation === selection.technology &&
      item.scene === selection.scene &&
      item.quantile === selection.quantile &&
      item.year === selection.year,
  );
  const policyCodes = new Set(policy.map((item) => item.component_code));
  const missingPolicy = Array.from(new Set(policyDefinitions
    .filter((item) => item.intensity_label === "缺失" || !policyCodes.has(item.component_code))
    .map((item) => item.component_name)));
  const policyScore = policy.length ? policy.reduce((sum, item) => sum + item.intensity, 0) / policy.length : 0;
  const policyDimensionCount = new Set(policyDefinitions.map((item) => item.component_code)).size;
  const allPolicyDimensionsRecorded = policyDimensionCount === 8 && policyCodes.size === 8 && missingPolicy.length === 0;
  const governanceThreshold = 2 / 3;
  const governancePassed = allPolicyDimensionsRecorded && policyScore >= governanceThreshold;
  const governanceState: DecisionGate["state"] = governancePassed
    ? "passed"
    : allPolicyDimensionsRecorded
      ? "pending"
      : "blocked";
  const governanceProgress = governancePassed
    ? 1
    : policy.length
      ? Math.min(0.95, 0.95 * (policyScore / governanceThreshold))
      : 0;
  const governanceStatus = governancePassed
    ? "治理条件已满足"
    : allPolicyDimensionsRecorded
      ? "政策强度强化中"
      : "存在制度缺口";
  const governanceHeadline = governancePassed
    ? "八维政策包达到有效促进阈值"
    : allPolicyDimensionsRecorded
      ? "八维政策包均有记录"
      : missingPolicy.slice(0, 3).join("、") || "政策维度记录不完整";
  const governanceDetail = governancePassed
    ? "政策包达到当前情景的治理准入阈值，财政支持仍只按已核实金额计入。"
    : allPolicyDimensionsRecorded
      ? "政策维度完整，但平均强度尚未达到有效促进阈值。"
      : "缺失维度不产生现金收益，也不由前端自动补值。";

  let economicState: DecisionGate["state"] = "blocked";
  let economicStatus = "待补结果";
  let economicHeadline = "缺少同口径单站结果";
  let economicDetail = "当前组合没有可用的项目级年度情景结果。";
  let economicProgress = 0;
  if (bestSnapshot && bestSnapshot.npv_cny >= 0 && !gateOpen) {
    economicState = "pending";
    economicStatus = "等待技术准入";
    economicHeadline = "技术门先于经济门";
    economicDetail = "单站净现值已非负，但商业扩散仍需等待技术准入。";
    economicProgress = 0.95;
  } else if (bestSnapshot && bestSnapshot.npv_cny >= 0) {
    economicState = "passed";
    economicStatus = "出现可行场景";
    economicHeadline = `${bestSnapshot.scene}单站净现值非负`;
    economicDetail = "该结论只适用于当前审核参数与部署口径，仍需结合认证和治理条件。";
    economicProgress = 1;
  } else if (bestSnapshot) {
    economicState = "pending";
    economicStatus = "尚未闭合";
    economicHeadline = "单站净现值仍为负";
    economicDetail = "应优先降低组件与场景工程成本，并提高寿命和封装可靠性。";
    if (baselineProject && baselineProject.npv_cny < 0) {
      const improvement = (bestSnapshot.npv_cny - baselineProject.npv_cny) / -baselineProject.npv_cny;
      economicProgress = clamp(improvement, 0.02, 0.95);
    } else {
      economicProgress = 0.02;
    }
  }

  let judgement: string;
  let gatePhrase: string;
  if (!gateOpen) {
    judgement = "继续验证，暂不进入商业扩散";
    gatePhrase = "该技术代际尚未通过商业准入门。";
  } else if (bestSnapshot && bestSnapshot.npv_cny < 0) {
    judgement = "进入受控示范准备，优先收敛单站成本";
    gatePhrase = "技术门已经开启，但项目经济门槛尚未闭合。";
  } else if (governanceState === "blocked") {
    judgement = "具备场景验证基础，治理条件需同步补齐";
    gatePhrase = "技术与项目条件已改善，制度缺口仍影响扩散速度。";
  } else if (governanceState === "pending") {
    judgement = "进入条件化示范准备，继续强化治理条件";
    gatePhrase = "技术与项目条件已改善，政策强度尚未达到有效促进阈值。";
  } else {
    judgement = "进入阶段化示范与区域滚动评估";
    gatePhrase = "技术、项目和政策维度可进入阶段门管理。";
  }

  const scenePriorities = buildScenePriorities(snapshot, selection, gateOpen);
  const topScene = scenePriorities[0]?.scene ?? "待评估";
  const pendingDimensions = snapshot.technologyGateItems
    .filter((item) => item.technology_generation === selection.technology && item.status !== "PASS")
    .map((item) => item.gate_dimension);
  const technicalDetail = `${technology.commercial_gate_year ? `商业准入年份为${technology.commercial_gate_year}年。` : "该代际未设置商业准入年份。"}${pendingDimensions.length ? `阶段门涉及${pendingDimensions.join("、")}。` : ""}`;
  const technicalState: DecisionGate["state"] = gateOpen
    ? "passed"
    : maturityScore === null || technology.commercial_gate_year === null
      ? "blocked"
      : "pending";
  const technicalProgress = gateOpen ? 1 : maturityScore === null ? 0 : Math.min(0.95, maturityScore / 100);
  const technicalStatus = gateOpen
    ? "已开启"
    : maturityScore === null
      ? "成熟度数据缺失"
      : technology.commercial_gate_year === null
        ? "未设商业准入"
        : "准入准备中";

  const gates: DecisionGate[] = [
    {
      name: "技术门",
      state: technicalState,
      status: technicalStatus,
      headline: gateOpen ? "商业扩散可进入后续判断" : "商业新增保持为零",
      detail: technicalDetail,
      progress: technicalProgress,
    },
    {
      name: "经济门",
      state: economicState,
      status: economicStatus,
      headline: economicHeadline,
      detail: economicDetail,
      progress: economicProgress,
    },
    {
      name: "治理门",
      state: governanceState,
      status: governanceStatus,
      headline: governanceHeadline,
      detail: governanceDetail,
      progress: governanceProgress,
    },
  ];

  const accessibleRatio = annual.physical_ceiling_mw > 0 ? annual.accessible_ceiling_mw / annual.physical_ceiling_mw : 0;
  const causes = [
    `技术准入：${gateOpen ? "已开启" : "尚未开启"}，决定商业新增是否可以大于零。`,
    `项目经济：设定参数空间内经济可行比例为${(annual.economic_attractiveness * 100).toFixed(1)}%。`,
    `资产可达：当前可开发上限占物理上限的${(accessibleRatio * 100).toFixed(1)}%。`,
    `政策条件：八维政策包平均强度为${(policyScore * 100).toFixed(1)}%，缺失维度不自动补值。`,
  ];

  return {
    annual,
    technology,
    developmentWindow,
    recommendedAction,
    judgement,
    judgementDetail: `${gatePhrase}当前以${technology.display_name.replace("PSC", "").trim()}、${selection.scenario}和${selection.quantile}结果进行研判，场景排序首位为${topScene}。`,
    gates,
    scenePriorities,
    trajectories: snapshot.annualResults.filter(
      (item) => item.region === selection.region && item.technology_generation === selection.technology && item.scene === selection.scene,
    ),
    causes,
    actions: {
      目标: developmentWindow,
      阶段条件: stage?.required_condition ?? "资料库尚未形成当前年份的阶段门记录。",
      推荐行动: recommendedAction,
      责任主体: stage?.responsible_party ?? "待明确",
      退出策略: "任一技术硬门未满足时维持验证规模，不进入商业扩散。",
    },
    bestSnapshot,
    policyScore,
    missingPolicy,
  };
}

export function classifyValue(rawValue: number | null | undefined, technicalGateOpen: boolean): DataState {
  if (rawValue === null || rawValue === undefined || !Number.isFinite(rawValue)) return "MISSING";
  if (!technicalGateOpen) return "GATE_BLOCKED";
  if (Math.abs(rawValue) <= 1e-12) return "ZERO_RESULT";
  return "VALID";
}
