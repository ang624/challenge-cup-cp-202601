import type { FeatureCollection } from "geojson";
import type { PageSlug } from "@/lib/navigation";
import { buildPublicProjection } from "@/lib/platform-projection";
import type { PlatformSnapshot, ScenarioSelection } from "@/types/data";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
let runtimeSnapshotPromise: Promise<PlatformSnapshot> | null = null;

function validateSnapshot(snapshot: PlatformSnapshot): void {
  if (snapshot.metadata.review_status !== "REVIEWED" || snapshot.metadata.regional_release_status !== "RELEASED") {
    throw new Error("数据服务未返回已审核发布结果");
  }
  const failedChecks = snapshot.scenarioQualityChecks.filter((item) => item.status !== "PASS");
  if (failedChecks.length > 0) {
    throw new Error(`V4数据存在${failedChecks.length}项未通过的质量检查`);
  }
}

export async function getPlatformSnapshot(
  page: PageSlug,
  selection: ScenarioSelection,
  signal?: AbortSignal,
): Promise<PlatformSnapshot> {
  runtimeSnapshotPromise ??= loadRuntimeSnapshot();
  const source = await runtimeSnapshotPromise;
  if (signal?.aborted) throw new DOMException("请求已取消", "AbortError");
  const projection = buildPublicProjection(source, page, selection);
  validateSnapshot(projection);
  return projection;
}

async function loadRuntimeSnapshot(): Promise<PlatformSnapshot> {
  const response = await fetch(`${BASE_PATH}/data/v4-public-runtime.json.gz`, { cache: "force-cache" });
  if (!response.ok || !response.body) {
    throw new Error(`公开数据包读取失败：HTTP ${response.status}`);
  }
  const decompressed = response.body.pipeThrough(new DecompressionStream("gzip"));
  const snapshot = await new Response(decompressed).json() as PlatformSnapshot;
  validateSnapshot(snapshot);
  return snapshot;
}

export async function getMapAssets(): Promise<{ boundary: FeatureCollection; roads: FeatureCollection }> {
  const [boundaryResponse, roadsResponse] = await Promise.all([
    fetch(`${BASE_PATH}/maps/yunnan_boundary.geojson`, { cache: "force-cache" }),
    fetch(`${BASE_PATH}/maps/yunnan_osm_roads.geojson`, { cache: "force-cache" }),
  ]);
  if (!boundaryResponse.ok || !roadsResponse.ok) {
    throw new Error("云南离线地图资产读取失败");
  }
  return {
    boundary: await boundaryResponse.json() as FeatureCollection,
    roads: await roadsResponse.json() as FeatureCollection,
  };
}
