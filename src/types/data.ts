export type ThemeMode = "light" | "dark";
export type ViewMode = "strategy" | "research";
export type TechnologyCode = "PSC_C" | "PSC_T" | "PSC_A";
export type ProjectTechnologyCode = TechnologyCode | "cSi";
export type DevelopmentScenario = "市场约束" | "基准转型" | "政策加速";
export type TrafficScene = "全部场景" | "屋顶" | "车棚" | "边坡" | "声屏障";
export type Quantile = "P10" | "P50" | "P90";
export type DataState = "VALID" | "GATE_BLOCKED" | "NOT_APPLICABLE" | "MISSING" | "ZERO_RESULT";

export interface ScenarioSelection {
  region: string;
  year: number;
  technology: TechnologyCode;
  scene: TrafficScene;
  scenario: DevelopmentScenario;
  quantile: Quantile;
}

export interface TechnologyGeneration {
  technology_generation: TechnologyCode;
  display_name: string;
  efficiency_pct: number;
  lifetime_years: number;
  degradation_pct_year: number;
  commercial_gate_year: number | null;
  gate_status: string;
  mass_class: string;
  evidence_level: string;
  source_id: string;
  notes: string;
}

export interface PolicyPackage {
  policy_package_id: string;
  development_scenario: DevelopmentScenario;
  display_name: string;
  description: string;
  cash_support_cny: number;
  evidence_level: string;
  review_status: string;
}

export interface ProjectFact {
  fact_id: string;
  baseline_id: string;
  fact_group: string;
  label_zh: string;
  value_num: number | null;
  value_text: string | null;
  unit: string;
  display_order: number;
  source_id: string;
  data_identity: string;
  evidence_level: string;
  metering_scope: string;
  applicability: string;
  notes: string;
}

export interface RegionalAsset {
  asset_id: string;
  region: string;
  asset_type: string;
  value_low: number;
  value_base: number;
  value_high: number;
  unit: string;
  reference_year: number;
  source_id: string;
  data_identity: string;
  evidence_level: string;
  derivation: string;
  applicability: string;
}

export interface PolicyComponent {
  development_scenario: DevelopmentScenario;
  policy_package_id: string;
  component_code: string;
  component_name: string;
  intensity: number;
  intensity_label: string;
  source_id: string;
  rule_basis: string;
}

export interface RegionalEvidence {
  evidence_id: string;
  topic: string;
  claim_text: string;
  value_text: string;
  source_id: string;
  page_or_line: string;
  evidence_level: string;
  support_level: string;
  applicability: string;
  limitations: string;
  source_title: string;
  url: string;
}

export interface StageGate {
  stage_gate_id: string;
  stage_order: number;
  stage_name: string;
  year_start: number;
  year_end: number;
  gate_type: string;
  required_condition: string;
  output_action: string;
  responsible_party: string;
  status: string;
}

export interface TechnologyGateItem {
  gate_item_id: string;
  technology_generation: TechnologyCode;
  gate_dimension: string;
  threshold_text: string;
  target_value_text: string;
  expected_year: number;
  status: string;
  evidence_level: string;
  source_id: string;
}

export interface DisplayStateDefinition {
  data_state: DataState;
  display_label_zh: string;
  definition_zh: string;
  sort_order: number;
}

export interface ProjectSnapshot {
  snapshot_id: string;
  baseline_id: string;
  target_year: number;
  technology_generation: ProjectTechnologyCode;
  scene: Exclude<TrafficScene, "全部场景">;
  deployment_mode: string;
  capacity_kwp: number;
  annual_pv_kwh: number;
  annual_load_kwh: number;
  npv_cny: number;
  lcoe_cny_kwh: number;
  initial_capex_cny: number;
  break_even_module_price_cny_w: number;
  lifecycle_carbon_intensity_g_kwh: number;
  source_ids_json: string;
  parameter_hash: string;
  evidence_status: string;
  release_scope: string;
  review_status: string;
}

export interface ProjectScenarioResult {
  scenario_result_id: string;
  year: number;
  technology_generation: TechnologyCode;
  scene: Exclude<TrafficScene, "全部场景">;
  development_scenario: DevelopmentScenario;
  quantile: Quantile;
  technical_gate_open: number;
  module_price_cny_w: number;
  annual_pv_kwh: number;
  usable_energy_kwh: number;
  initial_capex_cny: number;
  annual_net_benefit_cny: number;
  npv_cny: number;
  lcoe_cny_kwh: number;
  irr_proxy_pct: number;
  break_even_module_price_cny_w: number;
  technology_carbon_intensity_g_kwh: number;
  lifecycle_carbon_intensity_g_kwh: number;
  storage_self_sufficiency_pct: number;
  storage_throughput_mwh: number;
  mcda_scene_score: number;
  data_identity: "SCIENTIFIC_SCENARIO_SIMULATION";
  evidence_level: string;
  model_version: string;
  source_anchor_snapshot_id: string;
  parameter_hash: string;
  result_hash: string;
}

export interface PolicyAnnualResult {
  policy_result_id: string;
  year: number;
  technology_generation: TechnologyCode;
  scene: TrafficScene;
  development_scenario: DevelopmentScenario;
  quantile: Quantile;
  component_code: string;
  component_name: string;
  intensity: number;
  data_identity: "SCIENTIFIC_SCENARIO_SIMULATION";
  evidence_level: string;
  parameter_hash: string;
}

export interface TechnologyMaturityResult {
  maturity_result_id: string;
  year: number;
  technology_generation: TechnologyCode;
  scene: TrafficScene;
  development_scenario: DevelopmentScenario;
  quantile: Quantile;
  dimension_code: string;
  dimension_name: string;
  score: number;
  data_identity: "SCIENTIFIC_SCENARIO_SIMULATION";
  evidence_level: string;
  parameter_hash: string;
}

export interface TechnologyPerformanceResult {
  performance_result_id: string;
  year: number;
  technology_generation: TechnologyCode;
  scene: TrafficScene;
  development_scenario: DevelopmentScenario;
  quantile: Quantile;
  realized_efficiency_pct: number;
  realized_lifetime_years: number;
  realized_degradation_pct_year: number;
  performance_realization_index: number;
  data_identity: "SCIENTIFIC_SCENARIO_SIMULATION";
  evidence_level: string;
  parameter_hash: string;
}

export interface ScenarioQualityCheck {
  check_id: string;
  check_name: string;
  status: string;
  observed_value: string;
  threshold_text: string;
}

export interface ChartAuditItem {
  chart_id: string;
  chart_name: string;
  chart_type: string;
  source_table: string;
  responsive_axes: string;
  fixed_axes: string;
  data_identity: string;
  boundary_note: string;
}

export interface AnnualResult {
  run_id: string;
  year: number;
  scene: TrafficScene;
  quantile: Quantile;
  technical_gate_open: number;
  economic_attractiveness: number;
  physical_ceiling_mw: number;
  accessible_ceiling_mw: number;
  new_capacity_mw: number;
  retired_capacity_mw: number;
  stock_capacity_mw: number;
  generation_gwh: number;
  investment_million_cny: number;
  avoided_emissions_kt: number;
  net_lifecycle_reduction_kt: number;
  equivalent_dushupu_sites: number;
  policy_dependency_index: number;
  region: string;
  technology_generation: TechnologyCode;
  development_scenario: DevelopmentScenario;
  policy_package_id: string;
  result_hash: string;
  calibration_status: string;
  bass_eligibility: string;
  review_status: string;
}

export interface QualityCheck {
  check_id: string;
  run_id: string;
  check_name: string;
  status: string;
  observed_value: string;
  threshold_text: string;
  checked_at: string;
  technology_generation: TechnologyCode | null;
  development_scenario: DevelopmentScenario | null;
}

export interface ReleaseApproval {
  approval_id: string;
  knowledge_base_version: string;
  reviewer_role: string;
  reviewer_agent_id: string;
  pre_release_sha256: string;
  test_report_sha256: string;
  status: string;
  approved_at: string;
  approval_file: string;
}

export interface RegionalParameter extends Record<string, unknown> {
  regional_parameter_id: string;
  parameter_set_id: string;
  category: string;
  variable_key: string;
  context: string;
  value_low: number;
  value_base: number;
  value_high: number;
  unit: string;
  data_identity: string;
  evidence_level: string;
}

export interface PlatformSnapshot {
  snapshotVersion: string;
  sourceDatabaseSha256?: string;
  metadata: Record<string, string>;
  auditCounts: Record<string, number>;
  technologies: TechnologyGeneration[];
  developmentScenarios: PolicyPackage[];
  projectFacts: ProjectFact[];
  regionalAssets: RegionalAsset[];
  policyComponents: PolicyComponent[];
  regionalEvidence: RegionalEvidence[];
  stageGates: StageGate[];
  technologyGateItems: TechnologyGateItem[];
  displayStates: DisplayStateDefinition[];
  projectSnapshots: ProjectSnapshot[];
  projectScenarioResults: ProjectScenarioResult[];
  policyAnnualResults: PolicyAnnualResult[];
  technologyMaturityResults: TechnologyMaturityResult[];
  technologyPerformanceResults: TechnologyPerformanceResult[];
  scenarioQualityChecks: ScenarioQualityCheck[];
  chartAuditManifest: ChartAuditItem[];
  regionalParameters: RegionalParameter[];
  qualityChecks: QualityCheck[];
  approvals: ReleaseApproval[];
  regionalRuns: Array<Record<string, unknown>>;
  annualResults: AnnualResult[];
  mapLayers: Array<Record<string, unknown>>;
}

export type DecisionGateState = "passed" | "pending" | "blocked";

export interface DecisionGate {
  name: string;
  state: DecisionGateState;
  status: string;
  headline: string;
  detail: string;
  progress: number;
}

export interface ScenePriority {
  scene: Exclude<TrafficScene, "全部场景">;
  value: number;
  metric: string;
  economicAttractiveness: number;
}

export interface StrategicWorkspace {
  annual: AnnualResult;
  technology: TechnologyGeneration;
  developmentWindow: string;
  recommendedAction: string;
  judgement: string;
  judgementDetail: string;
  gates: DecisionGate[];
  scenePriorities: ScenePriority[];
  trajectories: AnnualResult[];
  causes: string[];
  actions: Record<string, string>;
  bestSnapshot: ProjectScenarioResult | null;
  policyScore: number;
  missingPolicy: string[];
}

export type DataRecord = Record<string, unknown>;
