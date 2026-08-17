import type { FeatureCollection } from "geojson";
import type { PageSlug } from "@/lib/navigation";
import type { PlatformSnapshot, ScenarioSelection } from "@/types/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
  const params = new URLSearchParams({
    page,
    region: selection.region,
    year: String(selection.year),
    technology: selection.technology,
    scene: selection.scene,
    scenario: selection.scenario,
    quantile: selection.quantile,
  });
  const response = await fetch(`${API_BASE_URL}/api/platform/snapshot?${params.toString()}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error || `数据服务读取失败：HTTP ${response.status}`);
  }
  const snapshot = await response.json() as PlatformSnapshot;
  validateSnapshot(snapshot);
  return snapshot;
}

export async function getMapAssets(): Promise<{ boundary: FeatureCollection; roads: FeatureCollection }> {
  const [boundaryResponse, roadsResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/maps/yunnan_boundary.geojson`, { cache: "force-cache" }),
    fetch(`${API_BASE_URL}/maps/yunnan_osm_roads.geojson`, { cache: "force-cache" }),
  ]);
  if (!boundaryResponse.ok || !roadsResponse.ok) {
    throw new Error("云南离线地图资产读取失败");
  }
  return {
    boundary: await boundaryResponse.json() as FeatureCollection,
    roads: await roadsResponse.json() as FeatureCollection,
  };
}
