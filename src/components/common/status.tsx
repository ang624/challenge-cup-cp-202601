import { cn } from "@/lib/utils";

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "green" | "blue" | "gold" | "red" | "neutral" }) {
  return <span className={cn("status-badge", `status-${tone}`)}>{label}</span>;
}

export function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-skeleton" aria-hidden="true">
        <i className="skeleton-line skeleton-line-short" />
        <i className="skeleton-line skeleton-line-title" />
        <i className="skeleton-line" />
        <span className="skeleton-grid">
          <i />
          <i />
          <i />
        </span>
      </div>
      <p>正在读取审核后的V4研究结果…</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <div className="error-state"><strong>数据加载失败</strong><p>{message}</p></div>;
}
