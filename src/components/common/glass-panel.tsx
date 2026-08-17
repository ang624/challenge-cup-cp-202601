import { cn } from "@/lib/utils";

export function GlassPanel({
  children,
  className,
  id,
  tabIndex,
  ariaLabel,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tabIndex?: number;
  ariaLabel?: string;
  as?: "section" | "article" | "div";
}) {
  return <Tag className={cn("glass-panel", className)} id={id} tabIndex={tabIndex} aria-label={ariaLabel}>{children}</Tag>;
}
