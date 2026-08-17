import { notFound } from "next/navigation";
import { YunnanMap, type YunnanMapVariant } from "@/components/charts/yunnan-map";

const variants = new Set(["research-atlas", "energy-corridor"]);

export const dynamicParams = false;

export function generateStaticParams() {
  return [...variants].map((variant) => ({ variant }));
}

const copy: Record<Exclude<YunnanMapVariant, "default">, { eyebrow: string; title: string; lead: string }> = {
  "research-atlas": {
    eyebrow: "地图方案 A · 科研图谱",
    title: "分级真实路网与省域资产边界",
    lead: "以克制的蓝灰底图呈现高速主廊道和区域干线，强调科学制图、层级辨识与投影环境可读性。",
  },
  "energy-corridor": {
    eyebrow: "地图方案 B · 能源走廊",
    title: "交通能源走廊战略图谱",
    lead: "以深蓝玻璃底图和青蓝双层道路表达产业走廊，强化未来能源研判氛围，同时保持真实路网几何不变。",
  },
};

export default async function MapPreviewPage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  if (!variants.has(variant)) notFound();
  const key = variant as Exclude<YunnanMapVariant, "default">;
  const content = copy[key];
  return (
    <main className={`map-preview-page map-preview-${key}`}>
      <section className="map-preview-shell">
        <header>
          <span>{content.eyebrow}</span>
          <h1>{content.title}</h1>
          <p>{content.lead}</p>
        </header>
        <div className="map-preview-canvas">
          <YunnanMap researchMode height={650} variant={key} />
        </div>
        <footer>
          <span>同一份云南省界与公开道路数据</span>
          <strong>高速主廊道 · 区域干线</strong>
          <span>不包含虚构站点、热度或示范线路</span>
        </footer>
      </section>
    </main>
  );
}
