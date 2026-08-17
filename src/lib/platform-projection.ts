import type { PageSlug } from "@/lib/navigation";
import type {
  DevelopmentScenario,
  PlatformSnapshot,
  Quantile,
  ScenarioSelection,
  TechnologyCode,
  TrafficScene,
} from "@/types/data";

const privateProjectionKeys = new Set([
  "approval_file",
  "approval_id",
  "baseline_id",
  "knowledge_base_version",
  "maturity_result_id",
  "parameter_hash",
  "performance_result_id",
  "policy_result_id",
  "pre_release_sha256",
  "result_hash",
  "reviewer_role",
  "reviewer_agent_id",
  "run_id",
  "scenario_result_id",
  "snapshot_id",
  "source_anchor_snapshot_id",
  "sourceDatabaseSha256",
  "source_ids_json",
  "snapshotVersion",
  "test_report_sha256",
]);

export function removePrivateProjectionFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removePrivateProjectionFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !privateProjectionKeys.has(key))
      .map(([key, nested]) => [key, removePrivateProjectionFields(nested)]),
  );
}

function commonProjection(source: PlatformSnapshot): PlatformSnapshot {
  const metadataKeys = [
    "regional_sample_count",
    "release_scope",
    "review_status",
    "regional_release_status",
    "project_result_year",
  ];
  const metadata = Object.fromEntries(
    metadataKeys.flatMap((key) => source.metadata[key] == null ? [] : [[key, source.metadata[key]]]),
  );

  return {
    snapshotVersion: source.snapshotVersion,
    sourceDatabaseSha256: source.sourceDatabaseSha256 ?? "",
    metadata,
    auditCounts: source.auditCounts,
    technologies: source.technologies,
    developmentScenarios: source.developmentScenarios,
    projectFacts: source.projectFacts,
    regionalAssets: source.regionalAssets,
    policyComponents: source.policyComponents,
    regionalEvidence: [],
    stageGates: source.stageGates,
    technologyGateItems: source.technologyGateItems,
    displayStates: source.displayStates,
    projectSnapshots: [],
    projectScenarioResults: [],
    policyAnnualResults: [],
    technologyMaturityResults: [],
    technologyPerformanceResults: [],
    scenarioQualityChecks: [],
    chartAuditManifest: [],
    regionalParameters: [],
    qualityChecks: [],
    approvals: [],
    regionalRuns: [],
    annualResults: [],
    mapLayers: [],
  };
}

function matchesDynamicSelection(
  row: {
    year: number;
    technology_generation: TechnologyCode;
    development_scenario: DevelopmentScenario;
    quantile: Quantile;
    scene: TrafficScene;
  },
  selection: ScenarioSelection,
): boolean {
  return row.year === selection.year &&
    row.technology_generation === selection.technology &&
    row.quantile === selection.quantile;
}

function addDecisionProjection(
  target: PlatformSnapshot,
  source: PlatformSnapshot,
  selection: ScenarioSelection,
): void {
  target.annualResults = source.annualResults.filter((row) =>
    row.region === selection.region &&
    row.technology_generation === selection.technology &&
    (
      row.scene === selection.scene ||
      (
        row.year === selection.year &&
        row.development_scenario === selection.scenario &&
        row.quantile === selection.quantile
      )
    ),
  );
  target.projectScenarioResults = source.projectScenarioResults.filter((row) =>
    row.technology_generation === selection.technology &&
    row.development_scenario === selection.scenario &&
    row.quantile === selection.quantile,
  );
  target.policyAnnualResults = source.policyAnnualResults.filter((row) => matchesDynamicSelection(row, selection));
  target.technologyMaturityResults = source.technologyMaturityResults.filter((row) => matchesDynamicSelection(row, selection));
  target.technologyPerformanceResults = source.technologyPerformanceResults.filter((row) => matchesDynamicSelection(row, selection));
}

export function buildPublicProjection(
  source: PlatformSnapshot,
  page: PageSlug,
  selection: ScenarioSelection,
): PlatformSnapshot {
  const projection = commonProjection(source);

  if (["strategic", "technology", "cultivation"].includes(page)) {
    addDecisionProjection(projection, source, selection);
  }

  if (page === "station") {
    projection.projectSnapshots = source.projectSnapshots.filter(
      (row) => row.technology_generation === selection.technology,
    );
    projection.projectScenarioResults = source.projectScenarioResults.filter((row) =>
      row.technology_generation === selection.technology &&
      row.development_scenario === selection.scenario &&
      row.quantile === selection.quantile,
    );
  }

  if (page === "yunnan") {
    projection.annualResults = source.annualResults.filter((row) =>
      row.region === selection.region &&
      row.technology_generation === selection.technology &&
      row.scene === selection.scene,
    );
  }

  if (page === "evidence") {
    projection.regionalEvidence = source.regionalEvidence;
    projection.scenarioQualityChecks = source.scenarioQualityChecks;
    projection.chartAuditManifest = source.chartAuditManifest;
    projection.qualityChecks = source.qualityChecks;
    projection.approvals = source.approvals;
  }

  return removePrivateProjectionFields(projection) as PlatformSnapshot;
}
