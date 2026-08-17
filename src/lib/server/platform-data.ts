import "server-only";

import { get } from "@vercel/blob";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PageSlug } from "@/lib/navigation";
import type {
  DevelopmentScenario,
  PlatformSnapshot,
  Quantile,
  ScenarioSelection,
  TechnologyCode,
  TrafficScene,
} from "@/types/data";

const DEFAULT_SNAPSHOT_PATH = path.join(process.cwd(), "private-data", "v4-snapshot.json");

let snapshotPromise: Promise<PlatformSnapshot> | null = null;

function assertSnapshot(snapshot: PlatformSnapshot): void {
  if (!snapshot.snapshotVersion.startsWith("FRONTEND_V4_FUTURE_SCENARIO_SNAPSHOT_")) {
    throw new Error("私有数据文件不是当前V4发布版本");
  }
  const failedChecks = snapshot.scenarioQualityChecks.filter((item) => item.status !== "PASS");
  if (failedChecks.length > 0) {
    throw new Error(`V4数据存在${failedChecks.length}项未通过的质量检查`);
  }
}

function configuredHash(): string | null {
  return process.env.PLATFORM_SNAPSHOT_SHA256?.trim().toLowerCase() || null;
}

async function readLocalPayload(): Promise<{ payload: Buffer; expectedHash: string }> {
  const snapshotPath = process.env.PLATFORM_SNAPSHOT_PATH?.trim() || DEFAULT_SNAPSHOT_PATH;
  const hashPath = process.env.PLATFORM_SNAPSHOT_HASH_PATH?.trim() ||
    path.join(path.dirname(snapshotPath), "v4-snapshot.sha256");
  const configured = configuredHash();
  const [payload, hashFile] = await Promise.all([
    readFile(/* turbopackIgnore: true */ snapshotPath),
    configured ? Promise.resolve(configured) : readFile(/* turbopackIgnore: true */ hashPath, "utf8"),
  ]);
  const expectedHash = hashFile.trim().split(/\s+/)[0]?.toLowerCase();
  if (!expectedHash) throw new Error("未配置私有V4数据文件哈希");
  return { payload, expectedHash };
}

async function readBlobPayload(): Promise<{ payload: Buffer; expectedHash: string }> {
  const pathname = process.env.PLATFORM_SNAPSHOT_BLOB_PATH?.trim();
  const expectedHash = configuredHash();
  if (!pathname || !expectedHash) {
    throw new Error("Vercel私有数据路径或哈希未配置");
  }
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Vercel私有V4数据读取失败");
  }
  const payload = Buffer.from(await new Response(result.stream).arrayBuffer());
  return { payload, expectedHash };
}

async function readReviewedSnapshot(): Promise<PlatformSnapshot> {
  const useBlob = Boolean(process.env.PLATFORM_SNAPSHOT_BLOB_PATH?.trim()) &&
    !process.env.PLATFORM_SNAPSHOT_PATH?.trim();
  const { payload, expectedHash } = useBlob
    ? await readBlobPayload()
    : await readLocalPayload();
  const actualHash = createHash("sha256").update(payload).digest("hex");
  if (actualHash !== expectedHash) {
    throw new Error("私有V4数据文件完整性检查失败");
  }
  const snapshot = JSON.parse(payload.toString("utf8")) as PlatformSnapshot;
  assertSnapshot(snapshot);
  return snapshot;
}

export function getReviewedSnapshot(): Promise<PlatformSnapshot> {
  snapshotPromise ??= readReviewedSnapshot();
  return snapshotPromise;
}

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

function removePrivateProjectionFields(value: unknown): unknown {
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
    sourceDatabaseSha256: source.sourceDatabaseSha256,
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
  target.annualResults = source.annualResults
    .filter((row) =>
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
  target.projectScenarioResults = source.projectScenarioResults
    .filter((row) =>
      row.technology_generation === selection.technology &&
      row.development_scenario === selection.scenario &&
      row.quantile === selection.quantile,
    );
  target.policyAnnualResults = source.policyAnnualResults
    .filter((row) => matchesDynamicSelection(row, selection));
  target.technologyMaturityResults = source.technologyMaturityResults
    .filter((row) => matchesDynamicSelection(row, selection));
  target.technologyPerformanceResults = source.technologyPerformanceResults
    .filter((row) => matchesDynamicSelection(row, selection));
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
    projection.projectScenarioResults = source.projectScenarioResults
      .filter((row) =>
        row.technology_generation === selection.technology &&
        row.development_scenario === selection.scenario &&
        row.quantile === selection.quantile,
      );
  }

  if (page === "yunnan") {
    projection.annualResults = source.annualResults
      .filter((row) =>
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
