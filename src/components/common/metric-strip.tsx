import { cn } from "@/lib/utils";

export interface MetricItem {
  label: string;
  value: string;
  detail?: string;
  tone?: "blue" | "green" | "cyan" | "gold" | "neutral";
}

export function MetricStrip({ items, className }: { items: MetricItem[]; className?: string }) {
  return (
    <div className={cn("metric-strip", className)}>
      {items.map((item) => (
        <div className={cn("metric-item", `metric-${item.tone ?? "neutral"}`)} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.detail ? <small>{item.detail}</small> : null}
        </div>
      ))}
    </div>
  );
}
