import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const sourcePath = process.argv[2] || process.env.PLATFORM_SNAPSHOT_PATH;
if (!sourcePath) {
  throw new Error("请通过参数或PLATFORM_SNAPSHOT_PATH指定已审核V4快照");
}

const privateKeys = new Set([
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

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !privateKeys.has(key))
      .map(([key, nested]) => [key, sanitize(nested)]),
  );
}

const payload = await readFile(path.resolve(sourcePath));
const source = JSON.parse(payload.toString("utf8"));
if (source.metadata?.review_status !== "REVIEWED" || source.metadata?.regional_release_status !== "RELEASED") {
  throw new Error("源快照不是REVIEWED/RELEASED状态");
}
if ((source.scenarioQualityChecks || []).some((item) => item.status !== "PASS")) {
  throw new Error("源快照存在未通过的质量检查");
}

const metadataKeys = [
  "regional_sample_count",
  "release_scope",
  "review_status",
  "regional_release_status",
  "project_result_year",
];
const publicRuntime = sanitize(source);
publicRuntime.snapshotVersion = "PUBLIC_WEB_RUNTIME_V1";
publicRuntime.metadata = Object.fromEntries(
  metadataKeys.flatMap((key) => source.metadata?.[key] == null ? [] : [[key, source.metadata[key]]]),
);
publicRuntime.regionalParameters = [];
publicRuntime.regionalRuns = [];
publicRuntime.mapLayers = [];

const json = Buffer.from(JSON.stringify(publicRuntime));
const compressed = gzipSync(json, { level: 9 });
const outputDir = path.join(process.cwd(), "public", "data");
const outputPath = path.join(outputDir, "v4-public-runtime.json.gz");
await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, compressed);
await writeFile(
  path.join(outputDir, "v4-public-runtime.sha256"),
  `${createHash("sha256").update(compressed).digest("hex")}  v4-public-runtime.json.gz\n`,
);

console.log(JSON.stringify({
  sourceBytes: payload.length,
  publicJsonBytes: json.length,
  compressedBytes: compressed.length,
  output: outputPath,
}, null, 2));
