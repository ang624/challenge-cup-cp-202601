import Image from "next/image";
import { publicPath } from "@/lib/public-path";

export function BrandIdentity({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="brand-identity">
      <span className="brand-logo"><Image src={publicPath("/assets/brand-logo.png")} alt="挑战杯研究决策平台标志" width={44} height={44} priority /></span>
      {!collapsed ? (
        <div>
          <small>CP-202601</small>
          <strong>挑战杯研究决策平台</strong>
          <span>工程基准 · 情景推演 · 培育路径</span>
        </div>
      ) : null}
    </div>
  );
}
