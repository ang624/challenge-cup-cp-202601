export const technologyLabels = {
  PSC_C: "保守代际",
  PSC_T: "目标代际",
  PSC_A: "先进代际",
} as const;

export const quantileLabels = { P10: "低位", P50: "中位", P90: "高位" } as const;

export function number(value: number, digits = 1): string {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function compact(value: number, unit = ""): string {
  return `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2, notation: "compact" }).format(value)}${unit}`;
}

export function safeText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function csvCell(value: unknown): string {
  const text = safeText(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function downloadBlob(name: string, content: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
