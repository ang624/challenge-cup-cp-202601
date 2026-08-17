"use client";

import * as echarts from "echarts";
import type { EChartsOption, LinesSeriesOption } from "echarts";
import type { FeatureCollection, Geometry, Position } from "geojson";
import { useEffect, useMemo, useState } from "react";
import { DecisionChart } from "@/components/charts/decision-chart";
import { getMapAssets } from "@/services/api/platform";

interface RoadLine {
  coords: number[][];
  value: number;
  name: string;
}

export type YunnanMapVariant = "default" | "research-atlas" | "energy-corridor";

function lineStrings(geometry: Geometry): Position[][] {
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  return [];
}

function roadSeries(roads: FeatureCollection): RoadLine[] {
  return roads.features.flatMap((feature) => {
    if (!feature.geometry) return [];
    const roadClass = String(feature.properties?.road_class ?? "trunk");
    const level = roadClass === "motorway" ? 2 : 1;
    return lineStrings(feature.geometry).map((coords) => ({
      coords: coords.map(([lng, lat]) => [Number(lng), Number(lat)]),
      value: level,
      name: String(feature.properties?.name || feature.properties?.ref || feature.properties?.road_class_zh || "公开道路"),
    }));
  });
}

export function YunnanMap({
  researchMode = false,
  height = 430,
  variant = "default",
}: {
  researchMode?: boolean;
  height?: number;
  variant?: YunnanMapVariant;
}) {
  const [boundary, setBoundary] = useState<FeatureCollection | null>(null);
  const [roads, setRoads] = useState<FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMapAssets().then((assets) => {
      echarts.registerMap("云南省", assets.boundary as Parameters<typeof echarts.registerMap>[1]);
      setBoundary(assets.boundary);
      setRoads(assets.roads);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "地图数据加载失败"));
  }, []);

  const option = useMemo<EChartsOption>(() => {
    if (!boundary || !roads) return {};
    const lines = roadSeries(roads);
    const trunk = lines.filter((item) => item.value === 1);
    const motorway = lines.filter((item) => item.value === 2);
    const atlas = variant === "research-atlas";
    const corridor = variant === "energy-corridor";
    const trunkColor = corridor ? "#7FB9D4" : atlas ? "#829BB2" : "#91A9BD";
    const motorwayColor = corridor ? "#35C7E8" : atlas ? "#1769E8" : "#2574D9";
    const series: LinesSeriesOption[] = [
      {
        name: "区域干线",
        type: "lines",
        coordinateSystem: "geo",
        polyline: true,
        silent: !researchMode,
        data: trunk,
        lineStyle: { color: trunkColor, width: atlas ? 0.72 : 0.55, opacity: corridor ? 0.42 : atlas ? 0.36 : 0.28 },
        emphasis: { lineStyle: { width: 1.2, opacity: 0.8 } },
      },
      ...(variant === "default" ? [] : [{
        name: "高速主廊道底衬",
        type: "lines" as const,
        coordinateSystem: "geo" as const,
        polyline: true,
        silent: true,
        data: motorway,
        lineStyle: { color: corridor ? "rgba(53,199,232,.22)" : "rgba(23,105,232,.18)", width: corridor ? 5.4 : 4.2, opacity: 1 },
        zlevel: 1,
      }]),
      {
        name: "高速主廊道",
        type: "lines",
        coordinateSystem: "geo",
        polyline: true,
        silent: !researchMode,
        data: motorway,
        lineStyle: { color: motorwayColor, width: corridor ? 1.9 : atlas ? 1.55 : 1.3, opacity: corridor ? 0.94 : atlas ? 0.88 : 0.76 },
        emphasis: { lineStyle: { color: corridor ? "#8BE7F4" : "#2BAED1", width: 2.5, opacity: 1 } },
        zlevel: 2,
      },
    ];
    return {
      tooltip: researchMode ? { trigger: "item", formatter: "{b}" } : { show: false },
      legend: {
        bottom: atlas ? 22 : 18,
        left: "center",
        data: ["高速主廊道", "区域干线"],
        textStyle: { color: corridor ? "#D9E8F3" : "#5D6E80" },
      },
      geo: {
        map: "云南省",
        roam: researchMode,
        layoutCenter: ["50%", atlas ? "43%" : "44%"],
        layoutSize: atlas ? "80%" : corridor ? "77%" : "78%",
        label: { show: false },
        itemStyle: {
          areaColor: corridor ? "rgba(17,62,94,.82)" : atlas ? "rgba(221,235,248,.68)" : "rgba(80,139,204,.10)",
          borderColor: corridor ? "#65B9DA" : atlas ? "#3F78B4" : "#4D82B8",
          borderWidth: corridor ? 1.7 : 1.4,
          shadowColor: corridor ? "rgba(34,176,213,.22)" : "rgba(51,96,143,.12)",
          shadowBlur: corridor ? 18 : atlas ? 8 : 0,
        },
        emphasis: { disabled: true },
      },
      series,
    };
  }, [boundary, researchMode, roads, variant]);

  if (error) return <div className="map-error">{error}</div>;
  if (!boundary || !roads) return <div className="map-loading">正在载入云南公开路网…</div>;
  return <DecisionChart option={option} height={height} ariaLabel="云南省高速主廊道与区域干线地图" />;
}
