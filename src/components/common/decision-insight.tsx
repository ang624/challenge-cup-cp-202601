import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DecisionInsight({
  eyebrow = "当前判断",
  title,
  detail,
  tone = "green",
  href,
  action,
}: {
  eyebrow?: string;
  title: string;
  detail: string;
  tone?: "blue" | "green" | "gold" | "red";
  href?: string;
  action?: string;
}) {
  return (
    <aside className={cn("decision-insight", `insight-${tone}`)}>
      <div className="insight-icon"><ShieldCheck aria-hidden="true" /></div>
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
      {href && action ? (
        <Link href={href} className="text-action">{action}<ArrowRight aria-hidden="true" /></Link>
      ) : null}
    </aside>
  );
}
