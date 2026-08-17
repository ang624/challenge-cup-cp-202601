import { CheckCircle2, CircleDashed, ShieldAlert } from "lucide-react";
import type { DecisionGate } from "@/types/data";

const statePresentation = {
  passed: { color: "green", Icon: CheckCircle2 },
  pending: { color: "gold", Icon: CircleDashed },
  blocked: { color: "red", Icon: ShieldAlert },
} as const;

function normalizedProgress(gate: DecisionGate): number {
  const bounded = Math.min(1, Math.max(0, gate.progress));
  return gate.state === "passed" ? 1 : Math.min(0.95, bounded);
}

export function GateStack({ gates }: { gates: DecisionGate[] }) {
  return <div className="gate-stack">{gates.map((gate) => {
    const { color, Icon } = statePresentation[gate.state];
    const progress = normalizedProgress(gate);
    const progressPercent = Math.round(progress * 100);
    return <article className={`gate-card gate-${color}`} data-gate-name={gate.name} data-gate-state={gate.state} key={gate.name}><div className="gate-head"><span><Icon aria-hidden="true" />{gate.name}</span><strong>{gate.status}</strong></div><h3>{gate.headline}</h3><p>{gate.detail}</p><div className="progress-track" role="progressbar" aria-label={`${gate.name}准备度`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent} aria-valuetext={`${gate.status}，准备度${progressPercent}%`}><span style={{ width: `${progressPercent}%` }} /></div></article>;
  })}</div>;
}
