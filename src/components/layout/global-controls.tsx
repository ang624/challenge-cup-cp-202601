"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import { usePlatform } from "@/contexts/platform-context";
import { quantileLabels, technologyLabels } from "@/lib/format";
import type { DevelopmentScenario, Quantile, TechnologyCode, TrafficScene } from "@/types/data";

const technologies: TechnologyCode[] = ["PSC_C", "PSC_T", "PSC_A"];
const scenes: TrafficScene[] = ["全部场景", "屋顶", "车棚", "边坡", "声屏障"];
const scenarios: DevelopmentScenario[] = ["市场约束", "基准转型", "政策加速"];
const quantiles: Quantile[] = ["P10", "P50", "P90"];

export type ControlAxis = "technology" | "year" | "scene" | "scenario" | "quantile";

const allAxes: ControlAxis[] = ["technology", "year", "scene", "scenario", "quantile"];

interface GlassSelectOption<T extends string> {
  value: T;
  label: string;
}

interface GlassSelectProps<T extends string> {
  ariaLabel: string;
  value: T;
  options: GlassSelectOption<T>[];
  onValueChange: (value: T) => void;
}

function GlassSelect<T extends string>({ ariaLabel, value, options, onValueChange }: GlassSelectProps<T>) {
  const current = options.find((option) => option.value === value)?.label ?? value;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="glass-select-trigger" type="button" aria-label={ariaLabel}>
        <span>{current}</span><ChevronDown aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="glass-select-content" align="start" sideOffset={7} collisionPadding={12}>
          <DropdownMenu.RadioGroup value={value} onValueChange={(next) => onValueChange(next as T)}>
            {options.map((option) => (
              <DropdownMenu.RadioItem className="glass-select-item" value={option.value} key={option.value}>
                <span>{option.label}</span>
                <DropdownMenu.ItemIndicator className="glass-select-indicator"><Check aria-hidden="true" /></DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function GlobalControls({ axes = allAxes }: { axes?: ControlAxis[] }) {
  const { selection, updateSelection } = usePlatform();
  const progress = ((selection.year - 2025) / (2060 - 2025)) * 100;
  const rangeStyle = { "--range-progress": `${progress}%` } as CSSProperties;
  return (
    <div className="global-controls" data-axis-count={axes.length}>
      {axes.includes("technology") ? <div className="control-field"><span>技术代际</span><GlassSelect ariaLabel="技术代际" value={selection.technology} options={technologies.map((item) => ({ value: item, label: technologyLabels[item] }))} onValueChange={(technology) => updateSelection({ technology })} /></div> : null}
      {axes.includes("year") ? <label className="year-control">
        <span>地区目标年份 <strong>{selection.year}</strong></span>
        <div className="energy-range" style={rangeStyle}>
          <input aria-label="地区目标年份" type="range" min="2025" max="2060" step="1" value={selection.year} onChange={(event) => updateSelection({ year: Number(event.target.value) })} />
          <span className="range-charge" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ "--particle-index": index } as CSSProperties} />)}
          </span>
        </div>
      </label> : null}
      {axes.includes("scene") ? <div className="control-field"><span>交通场景</span><GlassSelect ariaLabel="交通场景" value={selection.scene} options={scenes.map((item) => ({ value: item, label: item }))} onValueChange={(scene) => updateSelection({ scene })} /></div> : null}
      {axes.includes("scenario") ? <div className="control-field"><span>发展情景</span><GlassSelect ariaLabel="发展情景" value={selection.scenario} options={scenarios.map((item) => ({ value: item, label: item }))} onValueChange={(scenario) => updateSelection({ scenario })} /></div> : null}
      {axes.includes("quantile") ? <div className="control-field"><span>结果区间</span><GlassSelect ariaLabel="结果区间" value={selection.quantile} options={quantiles.map((item) => ({ value: item, label: quantileLabels[item] }))} onValueChange={(quantile) => updateSelection({ quantile })} /></div> : null}
    </div>
  );
}
