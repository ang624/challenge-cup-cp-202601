import { NextRequest } from "next/server";
import { buildPublicProjection, getReviewedSnapshot } from "@/lib/server/platform-data";
import { validPageSlugs, type PageSlug } from "@/lib/navigation";
import type {
  DevelopmentScenario,
  Quantile,
  ScenarioSelection,
  TechnologyCode,
  TrafficScene,
} from "@/types/data";

export const dynamic = "force-dynamic";

const technologies = new Set<TechnologyCode>(["PSC_C", "PSC_T", "PSC_A"]);
const scenes = new Set<TrafficScene>(["全部场景", "屋顶", "车棚", "边坡", "声屏障"]);
const scenarios = new Set<DevelopmentScenario>(["市场约束", "基准转型", "政策加速"]);
const quantiles = new Set<Quantile>(["P10", "P50", "P90"]);

function required<T extends string>(value: string | null, values: Set<T>, name: string): T {
  if (!value || !values.has(value as T)) throw new Error(`${name}无效`);
  return value as T;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const pageValue = params.get("page");
    if (!pageValue || !validPageSlugs.has(pageValue as PageSlug)) throw new Error("页面参数无效");
    const year = Number(params.get("year"));
    if (!Number.isInteger(year) || year < 2025 || year > 2060) throw new Error("目标年份无效");

    const selection: ScenarioSelection = {
      region: params.get("region") || "云南省",
      year,
      technology: required(params.get("technology"), technologies, "技术代际"),
      scene: required(params.get("scene"), scenes, "交通场景"),
      scenario: required(params.get("scenario"), scenarios, "发展情景"),
      quantile: required(params.get("quantile"), quantiles, "结果区间"),
    };
    const source = await getReviewedSnapshot();
    const projection = buildPublicProjection(source, pageValue as PageSlug, selection);
    return Response.json(projection, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      event: "platform_snapshot_failed",
      message: error instanceof Error ? error.message : "unknown error",
      at: new Date().toISOString(),
    }));
    return Response.json(
      { error: error instanceof Error ? error.message : "数据服务暂不可用" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
