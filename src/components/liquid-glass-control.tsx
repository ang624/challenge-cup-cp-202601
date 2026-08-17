"use client";

import dynamic from "next/dynamic";

const LiquidGlass = dynamic(() => import("liquid-glass-react"), {
  ssr: false,
  loading: () => <span className="liquid-control-fallback" aria-hidden="true" />,
});

export function LiquidGlassControl({ children }: { children: React.ReactNode }) {
  return (
    <LiquidGlass
      displacementScale={18}
      blurAmount={0.04}
      saturation={116}
      aberrationIntensity={0.25}
      elasticity={0.06}
      cornerRadius={12}
      padding="0"
      className="liquid-control"
      overLight
    >
      {children}
    </LiquidGlass>
  );
}
